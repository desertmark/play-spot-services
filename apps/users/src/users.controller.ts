import { Controller, Get, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';
import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { GetHelloResponse } from '@lib/users/users.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'GetHello')
  getHello(): GetHelloResponse {
    return {
      message: this.usersService.getHello(),
    };
  }
}
