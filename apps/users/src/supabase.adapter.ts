import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile, ValidateJwtResponse } from '@app/common/users';
import type { UpdateUserRequest } from '@app/common/users';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { Settings } from '@app/common/settings';
import { ContextService } from '@app/common/users/context.service';

@Injectable()
export class SupabaseAdapter {
  private client: SupabaseClient;
  private logger = new Logger(SupabaseAdapter.name);
  constructor(private readonly context: ContextService) {
    this.client = createClient(
      Settings.supabaseUrl,
      Settings.supabaseSecretKey,
    );
  }

  async validateJwt(jwt: string): Promise<ValidateJwtResponse> {
    if (!jwt) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Missing access token',
      });
    }
    try {
      const res = await this.client.auth.getClaims(jwt);
      if (res.error) {
        throw res.error;
      }
      this.logger.debug(`validateJwt`, res?.data?.claims?.email);
      return {
        isValid: !res.error,
        userId: res?.data?.claims?.sub || '',
      };
    } catch (error) {
      this.logger.debug(`validateJwt: ${error}`);
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: error.message,
      });
    }
  }

  @HandleError()
  async getUserById(id: string): Promise<UserProfile> {
    const res = await this.client.auth.admin.getUserById(id);
    if (res.error) {
      throw res.error;
    }
    return this.toUserProfile(res.data.user!);
  }
  @HandleError()
  async updateUser(id: string, user: UpdateUserRequest): Promise<UserProfile> {
    const res = await this.client.auth.admin.updateUserById(id, {
      user_metadata: {
        ...user,
      },
    });
    if (res.error) {
      throw res.error;
    }
    return this.toUserProfile(res.data.user);
  }

  @HandleError()
  async updateProfile(user: UpdateUserRequest): Promise<UserProfile> {
    const userId = this.context.userId;
    const res = await this.client.auth.admin.updateUserById(userId!, {
      user_metadata: {
        ...user,
      },
    });
    if (res.error) {
      throw res.error;
    }
    return this.toUserProfile(res.data.user);
  }

  private toUserProfile(user: User): UserProfile {
    return UserProfile.fromObject({
      id: user.id,
      email: user.email!,
      firstName: user.user_metadata?.firstName,
      lastName: user.user_metadata?.lastName,
    });
  }
}

// method decorator to handle error
function HandleError() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        this?.logger?.error?.(propertyKey, error);
        let code = status.UNKNOWN;
        if (error.message?.toLowerCase().includes('not found')) {
          code = status.NOT_FOUND;
        }
        if (error.message?.toLowerCase().includes('expected parameter')) {
          code = status.INVALID_ARGUMENT;
        }
        throw new RpcException({
          code,
          message: error.message.replace(/\S*supabase\S*/gi, ''),
        });
      }
    };
    return descriptor;
  };
}
