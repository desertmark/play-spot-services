import { Controller, Scope, UseGuards } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_ESTABLISHMENTS_SERVICE } from '@app/common/constants';
import {
  CreateEstablishmentRequest,
  GetEstablishmentsRequest,
  UpdateEstablishmentRequest,
} from '@app/common/facilities';
import { Authorized } from '@app/common/users/auth.guard';
import { DeleteEntitytRequest, UpdateEntityRequest } from '@app/common/dto';

@Controller()
@Authorized()
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @GrpcMethod(GRPC_ESTABLISHMENTS_SERVICE, 'GetEstablishments')
  async getEstablishments(data: GetEstablishmentsRequest) {
    return await this.establishmentsService.findMany(data);
  }

  @GrpcMethod(GRPC_ESTABLISHMENTS_SERVICE, 'CreateEstablishment')
  async createEstablishments(data: CreateEstablishmentRequest) {
    return await this.establishmentsService.create(data);
  }

  @GrpcMethod(GRPC_ESTABLISHMENTS_SERVICE, 'UpdateEstablishment')
  async updateEstablishment({ id, model }: UpdateEstablishmentRequest) {
    return await this.establishmentsService.update(id, model);
  }

  @GrpcMethod(GRPC_ESTABLISHMENTS_SERVICE, 'DeleteEstablishment')
  async deleteEstablishment({ id }: DeleteEntitytRequest) {
    return await this.establishmentsService.delete(id);
  }
}
