import { Controller, Get, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';
import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'GetHello')
  getHello(
    data: any,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ): { message: string } {
    Logger.log('Metadata:', metadata);
    Logger.log('Call:', call);
    Logger.log('Data:', data);
    return {
      message: this.usersService.getHello(),
    };
  }
}
