import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { status } from '@grpc/grpc-js';

import { UserProfile } from '@app/common/users';
import { UsersService } from './users.service';
import { GRPC_USERS_SERVICE } from '@app/common/constants';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod(GRPC_USERS_SERVICE, 'GetCurrentUser')
  async getCurrentUser(_: {}, metadata: Metadata): Promise<UserProfile> {
    const authHeader = metadata.get('authorization')[0] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Token JWT required',
      });
    }

    const jwt = authHeader.substring(7); // Remover 'Bearer '

    return this.usersService.getCurrentUser(jwt);
  }
}
