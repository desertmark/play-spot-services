import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GRPC_USERS_CLIENT, GRPC_USERS_PACKAGE } from '@app/common/constants';
import { UsersGatewayController } from './users-gateway.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: GRPC_USERS_CLIENT,
        transport: Transport.GRPC,
        options: {
          package: GRPC_USERS_PACKAGE,
          protoPath: join(__dirname, '../../../libs/common/proto/users.proto'),
          url: process.env.USERS_URL,
        },
      },
    ]),
  ],
  controllers: [GatewayController, UsersGatewayController],
  providers: [],
})
export class GatewayModule {}
