import { GRPC_SLOTS_SERVICE } from '@app/common/constants';
import { InjectFacilitiesClient } from '@app/common/decorators';
import { ISlotsClient, Slot } from '@app/common/facilities';
import { PrismaService } from '@app/common/prisma';
import {
  CreateReservationRequest,
  Reservation,
  ReservationStatus,
} from '@app/common/reservations';
import { ContextService } from '@app/common/users/context.service';
import { IDateSlot, ISlot, SlotUtil } from '@app/common/utils';
import { Metadata, status } from '@grpc/grpc-js';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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

  async create({ reservation_date, slot_ids }: CreateReservationRequest) {
    this.logger.debug(
      `Creating reservation for user ${this.context.userId} on ${reservation_date} for slots ${slot_ids}`,
    );
    const count = await this.prisma.reservations.count({
      where: {
        reservation_date: reservation_date,
        status: ReservationStatus.CONFIRMED,
        reservation_slots: {
          some: {
            slot_id: { in: slot_ids },
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
          ids: slot_ids,
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
      slots.items[0].day_of_week !== reservation_date.getDay()
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

    const reservation = this.prisma.reservations.create({
      data: {
        user_id: this.context.userId!,
        reservation_date,
        status: ReservationStatus.CONFIRMED,
        reservation_slots: {
          create: slot_ids.map((slot_id) => ({ slot_id })),
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        reservation_slots: true,
      },
    });

    return Reservation.fromObject(reservation);
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
        updated_at: new Date(),
      },
    });

    return Reservation.fromObject(updatedReservation);
  }
}
