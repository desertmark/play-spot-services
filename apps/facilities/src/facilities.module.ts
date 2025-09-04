import { Module } from '@nestjs/common';
import { EstablishmentsModule } from './establishments';

@Module({
  imports: [EstablishmentsModule],
  controllers: [],
  providers: [],
})
export class FacilitiesModule {}
