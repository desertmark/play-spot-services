import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { PrismaModule } from '@app/common/prisma';
import { FacilitiesClientModule, UsersClientModule } from '@app/common/clients';
import { ContextService } from '@app/common/users/context.service';

@Module({
  imports: [UsersClientModule, FacilitiesClientModule, PrismaModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ContextService],
})
export class ReservationsModule {}
