import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type { Metadata } from '@grpc/grpc-js';

import type {
  GetUserByIdRequest,
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
    const userId = metadata.get('userId')[0] as string;
    return this.supabase.getUserById(userId);
  }

  @GrpcMethod(GRPC_USERS_SERVICE, 'GetUserById')
  async getUserById({ userId }: GetUserByIdRequest): Promise<UserProfile> {
    return this.supabase.getUserById(userId);
  }

  @GrpcMethod(GRPC_USERS_SERVICE, 'UpdateUser')
  async updateUser(
    user: UpdateUserRequest,
    metadata: Metadata,
  ): Promise<UserProfile> {
    const userId = metadata.get('userId')[0] as string;
    return this.supabase.updateUser(userId, user);
  }

  @GrpcMethod(GRPC_USERS_SERVICE, 'ValidateJwt')
  async validateJwt({ jwt }: ValidateJwtRequest): Promise<ValidateJwtResponse> {
    return await this.supabase.validateJwt(jwt);
  }
}
