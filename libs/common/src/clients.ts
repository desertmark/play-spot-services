import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  GRPC_USERS_CLIENT,
  GRPC_USERS_PACKAGE,
  GRPC_FACILITIES_CLIENT,
  GRPC_FACILITIES_PACKAGE,
  GRPC_RESERVATIONS_CLIENT,
  GRPC_RESERVATIONS_PACKAGE,
} from './constants';

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
        'libs/common/proto/slots.proto',
      ],
      url: process.env.FACILITIES_URL,
    },
  },
]);

export const ReservationsClientModule = ClientsModule.register([
  {
    name: GRPC_RESERVATIONS_CLIENT,
    transport: Transport.GRPC,
    options: {
      package: GRPC_RESERVATIONS_PACKAGE,
      protoPath: ['libs/common/proto/reservations.proto'],
      url: process.env.RESERVATIONS_URL,
    },
  },
]);

export const ClientsModules = [
  UsersClientModule,
  FacilitiesClientModule,
  ReservationsClientModule,
];
