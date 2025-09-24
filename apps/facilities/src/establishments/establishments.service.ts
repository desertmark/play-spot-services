import { PaginationResponse } from '@app/common/dto';
import {
  Establishment,
  GetEstablishmentsRequest,
} from '@app/common/facilities';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { status } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class EstablishmentsService {
  private logger = new Logger(EstablishmentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private context: ContextService,
  ) {}

  async findMany({
    pagination,
  }: GetEstablishmentsRequest): Promise<PaginationResponse<Establishment>> {
    const dbItems = await this.prisma.establishments.findMany({
      take: pagination?.limit,
      skip: pagination?.offset,
      orderBy: { id: 'asc' },
    });
    const items = dbItems?.map((i) => Establishment.fromObject(i));
    return {
      items,
      total: await this.prisma.establishments.count(),
    };
  }

  async create(model: Partial<Establishment>): Promise<Establishment> {
    model.active = true;
    model.ownerId = this.context.userId;
    model.createdAt = new Date();
    model.updatedAt = new Date();
    const establishment = await this.prisma.establishments.create({
      data: model as Establishment,
    });
    return Establishment.fromObject(establishment);
  }

  async update(
    id: number,
    model: Partial<Establishment>,
  ): Promise<Establishment> {
    this.logger.debug('Update establishment', id, model);
    const establishment = await this.prisma.establishments.findFirst({
      where: { id },
    });
    if (!establishment) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Establishment: ${id} not found`,
      });
    }

    Object.assign<Establishment, Partial<Establishment>>(establishment, {
      ...model,
      updatedAt: new Date(),
    });

    const updated = await this.prisma.establishments.update({
      data: establishment,
      where: { id },
    });
    return Establishment.fromObject(updated);
  }

  async delete(id: number) {
    try {
      return await this.prisma.establishments.delete({ where: { id } });
    } catch (error) {
      this.logger.warn('Failed to delete establishment', error?.meta?.cause);
      if (error?.meta?.cause === 'No record was found for a delete.') {
        return;
      }
      throw error;
    }
  }
}
