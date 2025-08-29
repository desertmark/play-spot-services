// AuthGuard
import { GRPC_USERS_SERVICE } from '@app/common/constants';
import { InjectUsersClient } from '@app/common/decorators';
import { IUsersClient } from '@app/common/users/users.client';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

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
    const request = context.switchToHttp().getRequest<Request>();
    const jwt = request.headers['authorization']?.split(' ')[1];

    const res = await firstValueFrom(this.usersService.ValidateJwt({ jwt }));
    if (res.error) {
      this.logger.debug(`Unauthorized request: ${res.error}`);
      throw new UnauthorizedException(res.error);
    }
    request['user'] = {
      id: res.userId,
    };
    this.logger.debug(`Authenticated user ID: ${res.userId}`);
    return res.isValid;
  }
}

export const Authorized = () => UseGuards(AuthGuard);
