import { GRPC_SLOTS_SERVICE } from '@app/common/constants';
import { InjectFacilitiesClient } from '@app/common/decorators';
import { ISlotsClient } from '@app/common/facilities';
import { PrismaService } from '@app/common/prisma';
import {
  CreateReservationRequest,
  GetReservationsRequest,
  Reservation,
  ReservationStatus,
} from '@app/common/reservations';
import { ContextService } from '@app/common/users/context.service';
import { SlotUtil } from '@app/common/utils';
import { Metadata, status } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { type ClientGrpc, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Prisma } from '@prisma/client';
import { PaginationResponse } from '@app/common/dto';

@Injectable()
export class ReservationsService {
  private slotsService: ISlotsClient;
  private readonly logger = new Logger(ReservationsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ContextService,
    @InjectFacilitiesClient() private readonly facilities: ClientGrpc,
  ) {
    this.slotsService =
      this.facilities.getService<ISlotsClient>(GRPC_SLOTS_SERVICE);
  }

  async findMany({
    userId,
    reservationDate,
    status,
    limit,
    offset,
  }: GetReservationsRequest): Promise<PaginationResponse<Reservation>> {
    const where: Prisma.reservationsWhereInput = {};
    if (userId) {
      where.userId = userId;
    }
    if (reservationDate) {
      where.reservationDate = reservationDate;
    }
    if (status) {
      where.status = status;
    }
    const reservations = await this.prisma.reservations.findMany({
      take: limit,
      skip: offset,
      include: {
        reservationSlots: true,
      },
      where,
    });
    return {
      items: reservations.map((r) => Reservation.fromObject(r)),
      total: await this.prisma.reservations.count({ where }),
    };
  }

  async create({ reservationDate, slotIds }: CreateReservationRequest) {
    this.logger.debug(
      `Creating reservation for user ${this.context.userId} on ${reservationDate} for slots ${slotIds}`,
    );
    const count = await this.prisma.reservations.count({
      where: {
        reservationDate: reservationDate,
        status: ReservationStatus.CONFIRMED,
        reservationSlots: {
          some: {
            slotId: { in: slotIds },
          },
        },
      },
    });

    if (count > 0) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'One or more slots are already booked',
      });
    }
    const meta = new Metadata();
    meta.set('authorization', this.context.authHeader!);
    const slots = await firstValueFrom(
      this.slotsService.GetSlots(
        {
          ids: slotIds,
        },
        meta,
      ),
    );

    if (!SlotUtil.areAllSlotsOfTheSameUnit(slots.items)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'All slots must belong to the same unit',
      });
    }

    if (
      !SlotUtil.areAllSlotsOfTheSameWeekDay(slots.items) ||
      slots.items[0].dayOfWeek !== reservationDate.getDay()
    ) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'All slots must be of the same day of week as the reservation',
      });
    }

    if (!SlotUtil.areAllSlotsContiguousInTime(slots.items)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'All slots must be contiguous in time',
      });
    }

    const reservation = await this.prisma.reservations.create({
      data: {
        userId: this.context.userId!,
        reservationDate,
        status: ReservationStatus.CONFIRMED,
        reservationSlots: {
          create: slotIds.map((slotId) => ({ slotId })),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        reservationSlots: true,
      },
    });
    return Reservation.fromObject({
      ...reservation,
      slots: reservation.reservationSlots,
    });
  }

  async cancel(id: number) {
    const reservation = await this.prisma.reservations.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Reservation: ${id} not found`,
      });
    }

    const updatedReservation = await this.prisma.reservations.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        updatedAt: new Date(),
      },
    });

    return Reservation.fromObject(updatedReservation);
  }
}
