import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import type { Metadata } from '@grpc/grpc-js';
import { status } from '@grpc/grpc-js';

import type {
  UpdateUserRequest,
  UserProfile,
  ValidateJwtRequest,
  ValidateJwtResponse,
} from '@app/common/users';
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
    const { id } = JSON.parse(metadata.get('user')[0]?.toString());
    return await this.supabase.updateUser(id, user);
  }

  @GrpcMethod(GRPC_USERS_SERVICE, 'ValidateJwt')
  async validateJwt({ jwt }: ValidateJwtRequest): Promise<ValidateJwtResponse> {
    const { data, error } = await this.supabase.validateJwt(jwt);
    return {
      isValid: !error,
      userId: data?.claims?.sub || '',
      error: error?.message,
    };
  }
}
