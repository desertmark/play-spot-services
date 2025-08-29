import { InjectUsersClient } from '@app/common/decorators';
import { IUsersClient } from '@app/common/users/users.client';
import {
  Body,
  Controller,
  Get,
  Headers,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { GRPC_USERS_SERVICE } from '@app/common/constants';
import { ApiTags } from '@nestjs/swagger';
import type { UpdateUserRequest } from '@app/common/users';

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
    const metadata = new Metadata();
    metadata.set('authorization', authHeader);
    return this.usersService.GetCurrentUser({}, metadata);
  }

  @Put('current')
  async updateUser(
    @Headers('authorization') authHeader: string,
    @Body() body: UpdateUserRequest,
  ) {
    const metadata = new Metadata();
    metadata.set('authorization', authHeader);
    return await this.usersService.UpdateUser(body, metadata);
  }
}
