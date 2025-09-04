import { Controller, Scope, UseGuards } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_FACILITIES_SERVICE } from '@app/common/constants';
import {
  CreateEstablishmentRequest,
  GetEstablishmentsRequest,
} from '@app/common/facilities';
import { Authorized } from '@app/common/users/auth.guard';

@Controller()
@Authorized()
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @GrpcMethod(GRPC_FACILITIES_SERVICE, 'GetEstablishments')
  async getEstablishments(data: GetEstablishmentsRequest) {
    return await this.establishmentsService.findMany(data);
  }

  @GrpcMethod(GRPC_FACILITIES_SERVICE, 'CreateEstablishment')
  async createEstablishments(data: CreateEstablishmentRequest) {
    return await this.establishmentsService.create(data);
  }
}
