import { InjectUsersClient } from '@app/common/decorators';
import { IUsersClient } from '@app/common/users/users.client';
import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { GRPC_USERS_SERVICE } from '@app/common/constants';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersGatewayController {
  private usersService: IUsersClient;

  constructor(@InjectUsersClient() private client: ClientGrpc) {}

  onModuleInit() {
    this.usersService =
      this.client.getService<IUsersClient>(GRPC_USERS_SERVICE);
  }

  @Get('current')
  async getCurrentUser(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader?.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Token JWT requerido');
    }

    const jwt = authHeader.substring(7); // Remover 'Bearer '

    // Crear metadata para gRPC
    const metadata = new Metadata();
    metadata.set('authorization', `Bearer ${jwt}`);

    return this.usersService.GetCurrentUser({}, metadata);
  }
}
