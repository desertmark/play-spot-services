import { PaginationResponse } from '@app/common/dto';
import { GetSlotsRequest, Slot } from '@app/common/facilities/slots.dto';
import { PrismaService } from '@app/common/prisma';
import { ISlot, SlotUtil } from '@app/common/utils';
import { status } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class SlotsService {
  private logger = new Logger(SlotsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findMany({
    limit,
    offset,
    unitId,
    dayOfWeek,
    ids,
  }: GetSlotsRequest): Promise<PaginationResponse<Slot>> {
    const where: any = {};

    if (ids?.length) {
      where.id = {
        in: ids,
      };
    }

    if (unitId) {
      where.unitId = unitId;
    }

    if (dayOfWeek !== undefined && dayOfWeek !== null) {
      where.dayOfWeek = dayOfWeek;
    }

    const dbItems = await this.prisma.slots.findMany({
      take: limit,
      skip: offset,
      orderBy: [{ id: 'asc' }],
      where,
    });

    const items = dbItems?.map((i) =>
      Slot.fromObject(SlotUtil.toStringSlot(i)),
    );
    return {
      items,
      total: await this.prisma.slots.count({ where }),
    };
  }

  async create(model: Partial<Slot>): Promise<Slot> {
    // Validate that unit exists
    const unitExists = await this.prisma.units.count({
      where: { id: model.unitId },
    });

    if (!unitExists) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Unit: ${model.unitId} not found.`,
      });
    }

    // Check for existing slot with same unitId and dayOfWeek
    const overlappingSlots = await this.findOverlappingSlots(model as Slot);

    if (overlappingSlots?.length) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Overlapping slot already exists for unit ${model.unitId}, ${overlappingSlots.map((s) => SlotUtil.toPrintString(s)).join('; ')}`,
      });
    }

    model.active = true;
    model.createdAt = new Date();
    model.updatedAt = new Date();

    const created = await this.prisma.slots.create({
      data: SlotUtil.toDateSlot<Slot>(model as ISlot),
    });

    return Slot.fromObject(SlotUtil.toStringSlot<Slot>(created));
  }

  async update(id: number, model: Partial<Slot>): Promise<Slot> {
    this.logger.debug('Update slot', id, model);

    const dbSlot = await this.prisma.slots.findFirst({
      where: { id },
    });

    if (!dbSlot) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Slot: ${id} not found`,
      });
    }

    // Validate unit exists if unitId is being updated
    if (model.unitId && model.unitId !== dbSlot.unitId) {
      const unitExists = await this.prisma.units.count({
        where: { id: model.unitId },
      });

      if (!unitExists) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Unit: ${model.unitId} not found.`,
        });
      }
    }
    // Merge existing slot data with updates
    const updatedSlot = Object.assign(dbSlot, {
      ...SlotUtil.toDateSlot(model as ISlot),
      updatedAt: new Date(),
    });
    // Check for conflicts with existing slots (excluding current slot)
    const overlappingSlots = await this.findOverlappingSlots(
      SlotUtil.toStringSlot(dbSlot),
    );

    if (overlappingSlots?.length) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `Overlapping slot already exists for unit ${updatedSlot.unitId}: ${overlappingSlots.map((s) => SlotUtil.toPrintString(s)).join('; ')}`,
      });
    }

    const dbUpdated = await this.prisma.slots.update({
      data: updatedSlot,
      where: { id },
    });
    return Slot.fromObject(SlotUtil.toStringSlot(dbUpdated));
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

  private async findOverlappingSlots({
    id,
    unitId,
    dayOfWeek,
    openTime,
    closeTime,
  }: Slot): Promise<Slot[]> {
    const dbSlots = await this.prisma.slots.findMany({
      where: {
        id: id ? { not: id } : undefined,
        unitId: unitId,
        dayOfWeek: dayOfWeek,
        openTime: {
          lt: SlotUtil.timeStringToDate(closeTime!),
        },
        closeTime: {
          gt: SlotUtil.timeStringToDate(openTime!),
        },
      },
    });
    return dbSlots.map((s) => Slot.fromObject(SlotUtil.toStringSlot(s)));
  }
}
