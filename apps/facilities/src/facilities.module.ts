import { Module } from '@nestjs/common';
import { EstablishmentsModule } from './establishments';
import { UnitsModule } from './units/units.module';

@Module({
  imports: [EstablishmentsModule, UnitsModule],
  controllers: [],
  providers: [],
})
export class FacilitiesModule {}
