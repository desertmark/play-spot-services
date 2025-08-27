import { Inject } from '@nestjs/common';
import { GRPC_USERS_CLIENT } from './constants';

export const InjectUsersClient = () => Inject(GRPC_USERS_CLIENT);
