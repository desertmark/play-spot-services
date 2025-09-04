import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Settings } from '@app/common/settings';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: Settings.dbConnectionString,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
