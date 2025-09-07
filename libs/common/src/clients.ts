import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  GRPC_USERS_CLIENT,
  GRPC_USERS_PACKAGE,
  GRPC_FACILITIES_CLIENT,
  GRPC_FACILITIES_PACKAGE,
} from './constants';
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

export const FacilitiesClientModule = ClientsModule.register([
  {
    name: GRPC_FACILITIES_CLIENT,
    transport: Transport.GRPC,
    options: {
      package: GRPC_FACILITIES_PACKAGE,
      protoPath: [
        'libs/common/proto/establishments.proto',
        'libs/common/proto/units.proto',
      ],
      url: process.env.FACILITIES_URL,
    },
  },
]);

export const ClientsModules = [UsersClientModule, FacilitiesClientModule];
