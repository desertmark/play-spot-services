// AuthGuard
import { Metadata, status } from '@grpc/grpc-js';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SupabaseAdapter } from './supabase.adapter';

@Injectable()
export class UsersAuthGuard implements CanActivate {
  private readonly logger = new Logger(UsersAuthGuard.name);

  constructor(private supabase: SupabaseAdapter) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let authHeader: string | undefined;
    const metadata = context.switchToRpc().getContext<Metadata>();
    authHeader = metadata.get('authorization')?.[0]?.toString();
    try {
      const jwt = authHeader?.split(' ')[1]!;
      const res = await this.supabase.validateJwt(jwt);

      metadata.set?.('userId', res.userId);

      this.logger.debug(`Authenticated user ID:`, res);

      return !!res.isValid;
    } catch (error) {
      this.logger.warn(`Unauthorized request ${error}`);
      throw new RpcException({
        code: error.code || status.UNAUTHENTICATED,
        error: error.message,
      });
    }
  }
}

export const Authorized = () => UseGuards(UsersAuthGuard);
