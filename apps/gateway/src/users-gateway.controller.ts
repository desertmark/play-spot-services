import {
  CurrentMeta,
  CurrentUser,
  InjectUsersClient,
} from '@app/common/decorators';
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
import { Authorized } from './auth.guard';

@ApiTags('Users')
@Controller('users')
@Authorized()
export class UsersGatewayController {
  private usersService: IUsersClient;

  constructor(@InjectUsersClient() private client: ClientGrpc) {}

  onModuleInit() {
    this.usersService =
      this.client.getService<IUsersClient>(GRPC_USERS_SERVICE);
  }

  @Get('current')
  async getCurrentUser(@CurrentMeta() metadata: Metadata) {
    return this.usersService.GetCurrentUser({}, metadata);
  }

  @Put('current')
  async updateUser(
    @Body() body: UpdateUserRequest,
    @CurrentUser() metadata: Metadata,
  ) {
    return await this.usersService.UpdateUser(body, metadata);
  }
}
