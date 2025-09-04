import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { UsersGatewayController } from './users-gateway.controller';
import { ClientsModules } from '@app/common/clients';

@Module({
  imports: ClientsModules,
  controllers: [GatewayController, UsersGatewayController],
  providers: [],
})
export class GatewayModule {}
