// Establishment module
import { PrismaModule } from '@app/common/prisma';
import { Module } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { EstablishmentsController } from './establishments.controller';
import { ContextService } from '@app/common/users/context.service';
import { UsersClientModule } from '@app/common/clients';

@Module({
  imports: [PrismaModule, UsersClientModule],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService, ContextService],
})
export class EstablishmentsModule {}
