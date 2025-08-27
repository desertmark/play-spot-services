import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';
import { GetHelloResponse } from '@app/common/users';

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
