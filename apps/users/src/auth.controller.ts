import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  ValidateJwtRequest,
  ValidateJwtResponse,
} from '@app/common/users';
import { GRPC_USERS_SERVICE } from '@app/common/constants';
import { SupabaseAdapter } from './supabase.adapter';

@Controller()
export class AuthController {
  constructor(private readonly supabase: SupabaseAdapter) {}

  @GrpcMethod(GRPC_USERS_SERVICE, 'ValidateJwt')
  async validateJwt({ jwt }: ValidateJwtRequest): Promise<ValidateJwtResponse> {
    return await this.supabase.validateJwt(jwt);
  }
}
