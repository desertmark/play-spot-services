import { PaginationResponse } from '@app/common/dto';
import {
  Establishment,
  GetEstablishmentsRequest,
} from '@app/common/facilities';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { Injectable, Logger } from '@nestjs/common';

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
    });
    const items = dbItems?.map((i) => Establishment.fromObject(i));
    console.log(items[0]?.id);
    return {
      items,
      total: await this.prisma.establishments.count(),
    };
  }

  async create(model: Partial<Establishment>): Promise<Establishment> {
    model.active = true;
    model.owner_id = this.context.userId;
    model.created_at = new Date();
    model.updated_at = new Date();

    this.logger.debug(`create establishment`, model);

    return await this.prisma.establishments.create({
      data: model as Establishment,
    });
  }
}
