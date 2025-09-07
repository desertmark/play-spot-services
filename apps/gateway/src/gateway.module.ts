import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { UsersGatewayController } from './users-gateway.controller';
import { EstablishmentsGatewayController } from './establishments-gateway.controller';
import { UnitsGatewayController } from './units-gateway.controller';
import { ClientsModules } from '@app/common/clients';

@Module({
  imports: ClientsModules,
  controllers: [
    GatewayController,
    UsersGatewayController,
    EstablishmentsGatewayController,
    UnitsGatewayController,
  ],
  providers: [],
})
export class GatewayModule {}
