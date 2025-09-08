import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_SLOTS_SERVICE } from '@app/common/constants';
import { Authorized } from '@app/common/users/auth.guard';
import { DeleteEntitytRequest } from '@app/common/dto';
import { SlotsService } from './slots.service';
import {
  CreateSlotRequest,
  GetSlotsRequest,
  UpdateSlotRequest,
} from '@app/common/facilities/slots.dto';

@Controller()
@Authorized()
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @GrpcMethod(GRPC_SLOTS_SERVICE, 'GetSlots')
  async getSlots(data: GetSlotsRequest) {
    return await this.slotsService.findMany(data);
  }

  @GrpcMethod(GRPC_SLOTS_SERVICE, 'CreateSlot')
  async createSlot(data: CreateSlotRequest) {
    return await this.slotsService.create(data);
  }

  @GrpcMethod(GRPC_SLOTS_SERVICE, 'UpdateSlot')
  async updateSlot({ id, model }: UpdateSlotRequest) {
    return await this.slotsService.update(id, model);
  }

  @GrpcMethod(GRPC_SLOTS_SERVICE, 'DeleteSlot')
  async deleteSlot({ id }: DeleteEntitytRequest) {
    return await this.slotsService.delete(id);
  }
}
