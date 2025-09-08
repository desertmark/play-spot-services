import { DayOfWeek, PaginationResponse } from '@app/common/dto';
import { GetSlotsRequest, Slot } from '@app/common/facilities/slots.dto';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { ISlot, SlotUtil } from '@app/common/utils';
import { status } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class SlotsService {
  private logger = new Logger(SlotsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private context: ContextService,
  ) {}

  async findMany({
    pagination,
    unit_id,
    day_of_week,
  }: GetSlotsRequest): Promise<PaginationResponse<Slot>> {
    const where: any = {};

    if (unit_id) {
      where.unit_id = unit_id;
    }

    if (day_of_week !== undefined) {
      where.day_of_week = day_of_week;
    }

    const dbItems = await this.prisma.slots.findMany({
      take: pagination?.limit,
      skip: pagination?.offset,
      orderBy: [{ unit_id: 'asc' }, { day_of_week: 'asc' }],
      where,
    });

    const items = dbItems?.map((i) => Slot.fromObject(i));
    return {
      items,
      total: await this.prisma.slots.count({ where }),
    };
  }

  async create(model: Partial<Slot>): Promise<Slot> {
    // Validate that unit exists
    const unitExists = await this.prisma.units.count({
      where: { id: model.unit_id },
    });

    if (!unitExists) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Unit: ${model.unit_id} not found.`,
      });
    }

    // Check for existing slot with same unit_id and day_of_week
    const existingSlot = await this.prisma.slots.findFirst({
      where: {
        unit_id: model.unit_id,
        day_of_week: model.day_of_week,
      },
    });

    if (existingSlot) {
      if (SlotUtil.isOverlapping(model as ISlot, existingSlot)) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `An overlapping slot already exists for unit ${model.unit_id}, ${SlotUtil.toPrintString(SlotUtil.toStringSlot(existingSlot))}`,
        });
      }
    }

    model.active = true;
    model.created_at = new Date();
    model.updated_at = new Date();

    const created = await this.prisma.slots.create({
      data: SlotUtil.toDateSlot<Slot>(model as ISlot),
    });

    return Slot.fromObject(SlotUtil.toStringSlot<Slot>(created));
  }

  async update(id: number, model: Partial<Slot>): Promise<Slot> {
    this.logger.debug('Update slot', id, model);

    const slot = await this.prisma.slots.findFirst({
      where: { id },
    });

    if (!slot) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Slot: ${id} not found`,
      });
    }

    // Validate unit exists if unit_id is being updated
    if (model.unit_id && model.unit_id !== slot.unit_id) {
      const unitExists = await this.prisma.units.count({
        where: { id: model.unit_id },
      });

      if (!unitExists) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Unit: ${model.unit_id} not found.`,
        });
      }
    }

    // Validate time logic
    const openTime = model.open_time || slot.open_time;
    const closeTime = model.close_time || slot.close_time;

    if (openTime >= closeTime) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'open_time must be before close_time',
      });
    }

    // Check for conflicts with existing slots (excluding current slot)
    if (model.unit_id || model.day_of_week !== undefined) {
      const unitId = model.unit_id || slot.unit_id;
      const dayOfWeek =
        model.day_of_week !== undefined ? model.day_of_week : slot.day_of_week;

      const existingSlot = await this.prisma.slots.findFirst({
        where: {
          unit_id: unitId,
          day_of_week: dayOfWeek,
          id: { not: id },
        },
      });

      if (existingSlot) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: `Slot already exists for unit ${unitId} on day ${dayOfWeek}`,
        });
      }
    }

    Object.assign(slot, {
      ...model,
      updated_at: new Date(),
    });

    const updated = await this.prisma.slots.update({
      data: slot,
      where: { id },
    });

    return Slot.fromObject(updated);
  }

  async delete(id: number) {
    try {
      return await this.prisma.slots.delete({ where: { id } });
    } catch (error) {
      this.logger.warn('Failed to delete slot', error?.meta?.cause);
      if (error?.meta?.cause === 'No record was found for a delete.') {
        return;
      }
      throw error;
    }
  }
}
