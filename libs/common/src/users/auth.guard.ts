// AuthGuard
import { GRPC_USERS_SERVICE } from '@app/common/constants';
import { InjectUsersClient } from '@app/common/decorators';
import { IUsersClient } from '@app/common/users/users.client';
import { Metadata, status } from '@grpc/grpc-js';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RpcException, type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, take } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private usersService: IUsersClient;
  constructor(@InjectUsersClient() private client: ClientGrpc) {}

  onModuleInit() {
    this.usersService =
      this.client.getService<IUsersClient>(GRPC_USERS_SERVICE);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let authHeader: string | undefined;
    let requestOrMetadata: Request | Metadata;
    if (context.getType() == 'rpc') {
      requestOrMetadata = context.switchToRpc().getContext<Metadata>();
      authHeader = requestOrMetadata.get('authorization')?.[0]?.toString();
    } else {
      requestOrMetadata = context.switchToHttp().getRequest<Request>();
      authHeader = requestOrMetadata.headers?.['authorization'];
    }
    try {
      const jwt = authHeader?.split(' ')[1]!;
      const res = await firstValueFrom(
        this.usersService.ValidateJwt({ jwt }).pipe(take(1)),
      );

      (requestOrMetadata as Request)['userId'] = res.userId;
      (requestOrMetadata as Metadata)?.set?.('userId', res.userId);

      this.logger.debug(`Authenticated user ID:`, res.userId);

      return !!res.isValid;
    } catch (error) {
      this.logger.warn(`Unauthorized request ${error}`);
      if (context.getType() == 'rpc') {
        throw new RpcException({
          code: error.code || status.UNAUTHENTICATED,
          error: error.message,
        });
      }
      throw new UnauthorizedException(error.message);
    }
  }
}

export const Authorized = () => UseGuards(AuthGuard);
