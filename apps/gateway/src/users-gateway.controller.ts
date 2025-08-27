import { InjectUsersClient } from '@app/common/decorators';
import { UsersClient } from '@app/common/users/users.client';
import { Controller, Get } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';

@Controller('users')
export class UsersGatewayController {
  private usersService: UsersClient;

  constructor(@InjectUsersClient() private client: ClientGrpc) {}

  onModuleInit() {
    this.usersService = this.client.getService<UsersClient>('UsersService');
  }

  @Get('hello')
  async getHello() {
    return this.usersService.GetHello({});
  }
}
