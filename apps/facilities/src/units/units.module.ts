import { UsersClientModule } from '@app/common/clients';
import { PrismaModule } from '@app/common/prisma';
import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  imports: [UsersClientModule, PrismaModule],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [],
})
export class UnitsModule {}
