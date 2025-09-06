import { ClientsModule, Transport } from '@nestjs/microservices';
import { GRPC_USERS_CLIENT, GRPC_USERS_PACKAGE } from './constants';
import { Global, Module } from '@nestjs/common';

export const UsersClientModule = ClientsModule.register([
  {
    name: GRPC_USERS_CLIENT,
    transport: Transport.GRPC,
    options: {
      package: GRPC_USERS_PACKAGE,
      protoPath: 'libs/common/proto/users.proto',
      url: process.env.USERS_URL,
    },
  },
]);

export const ClientsModules = [UsersClientModule];
