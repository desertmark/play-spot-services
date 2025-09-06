import { PaginationResponse } from '@app/common/dto';
import { GetUnitsRequest, Unit } from '@app/common/facilities/units.dto';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { status } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UnitsService {
  private logger = new Logger(UnitsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findMany({
    pagination,
  }: GetUnitsRequest): Promise<PaginationResponse<Unit>> {
    const dbItems = await this.prisma.units.findMany({
      take: pagination?.limit,
      skip: pagination?.offset,
      orderBy: { id: 'asc' },
    });
    const items = dbItems?.map((i) => Unit.fromObject(i));
    return {
      items,
      total: await this.prisma.units.count(),
    };
  }

  async create(model: Partial<Unit>): Promise<Unit> {
    const establishmentExists = await this.prisma.establishments.count({
      where: { id: model.establishment_id },
    });

    if (!establishmentExists) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Establishment: ${model.establishment_id} not found.`,
      });
    }

    model.active = true;
    model.created_at = new Date();
    model.updated_at = new Date();
    const created = await this.prisma.units.create({
      data: model as Unit,
    });
    return Unit.fromObject(created);
  }

  async update(id: number, model: Partial<Unit>): Promise<Unit> {
    const unit = await this.prisma.units.findFirst({
      where: { id },
    });
    if (!unit) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Unit: ${id} not found`,
      });
    }

    Object.assign<Unit | any, Partial<Unit>>(unit, {
      ...model,
      updated_at: new Date(),
    });

    const updated = await this.prisma.units.update({
      data: unit,
      where: { id },
    });
    return Unit.fromObject(updated);
  }

  async delete(id: number) {
    try {
      return await this.prisma.units.delete({ where: { id } });
    } catch (error) {
      this.logger.warn('Failed to delete Unit', error?.meta?.cause);
      if (error?.meta?.cause === 'No record was found for a delete.') {
        return;
      }
      throw error;
    }
  }
}
