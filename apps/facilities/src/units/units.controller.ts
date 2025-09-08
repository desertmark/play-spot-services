import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_UNITS_SERVICE } from '@app/common/constants';
import {} from '@app/common/facilities';
import { Authorized } from '@app/common/users/auth.guard';
import { DeleteEntitytRequest } from '@app/common/dto';
import { UnitsService } from './units.service';
import {
  CreateUnitRequest,
  GetUnitsRequest,
  UpdateUnitRequest,
} from '@app/common/facilities/units.dto';

@Controller()
@Authorized()
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @GrpcMethod(GRPC_UNITS_SERVICE, 'GetUnits')
  async getEstablishments(data: GetUnitsRequest) {
    return await this.unitsService.findMany(data);
  }

  @GrpcMethod(GRPC_UNITS_SERVICE, 'CreateUnit')
  async createEstablishments(data: CreateUnitRequest) {
    return await this.unitsService.create(data);
  }

  @GrpcMethod(GRPC_UNITS_SERVICE, 'UpdateUnit')
  async updateEstablishment({ id, model }: UpdateUnitRequest) {
    return await this.unitsService.update(id, model);
  }

  @GrpcMethod(GRPC_UNITS_SERVICE, 'DeleteUnit')
  async deleteEstablishment({ id }: DeleteEntitytRequest) {
    return await this.unitsService.delete(id);
  }
}
