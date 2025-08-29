import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import type { Metadata } from '@grpc/grpc-js';
import { status } from '@grpc/grpc-js';

import type { UpdateUserRequest, UserProfile } from '@app/common/users';
import { GRPC_USERS_SERVICE } from '@app/common/constants';
import { SupabaseAdapter } from './supabase.adapter';

@Controller()
export class UsersController {
  constructor(private readonly supabase: SupabaseAdapter) {}

  @GrpcMethod(GRPC_USERS_SERVICE, 'GetCurrentUser')
  async getCurrentUser(_: {}, metadata: Metadata): Promise<UserProfile> {
    const authHeader = metadata.get('authorization')[0] as string;

    if (!authHeader || !authHeader?.toLowerCase().startsWith('bearer ')) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Token JWT required',
      });
    }

    const jwt = authHeader.substring(7); // Remover 'Bearer '

    return this.supabase.getCurrentUser(jwt);
  }

  @GrpcMethod(GRPC_USERS_SERVICE, 'UpdateUser')
  async updateUser(user: UpdateUserRequest, metadata: Metadata): Promise<void> {
    const userProfile = await this.getCurrentUser({}, metadata); // Verifica se o usuário está autenticado
    return await this.supabase.updateUser(userProfile.id, user);
  }
}
