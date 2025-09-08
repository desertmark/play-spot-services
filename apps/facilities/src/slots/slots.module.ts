import { UsersClientModule } from '@app/common/clients';
import { PrismaModule } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { Module } from '@nestjs/common';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  imports: [UsersClientModule, PrismaModule],
  controllers: [SlotsController],
  providers: [SlotsService, ContextService],
  exports: [],
})
export class SlotsModule {}
