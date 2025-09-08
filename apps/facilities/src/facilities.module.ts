import { Module } from '@nestjs/common';
import { EstablishmentsModule } from './establishments';
import { UnitsModule } from './units/units.module';
import { SlotsModule } from './slots/slots.module';

@Module({
  imports: [EstablishmentsModule, UnitsModule, SlotsModule],
  controllers: [],
  providers: [],
})
export class FacilitiesModule {}
