import { Controller } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_RESERVATIONS_SERVICE } from '@app/common/constants';
import {
  CreateReservationRequest,
  GetReservationsRequest,
} from '@app/common/reservations';
import { Authorized } from '@app/common/users/auth.guard';
import { DeleteEntitytRequest } from '@app/common/dto';

@Controller()
@Authorized()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @GrpcMethod(GRPC_RESERVATIONS_SERVICE, 'CreateReservation')
  async createReservation(data: CreateReservationRequest) {
    return await this.reservationsService.create(data);
  }

  @GrpcMethod(GRPC_RESERVATIONS_SERVICE, 'DeleteReservation')
  async deleteReservation({ id }: DeleteEntitytRequest) {
    return await this.reservationsService.cancel(id);
  }

  @GrpcMethod(GRPC_RESERVATIONS_SERVICE, 'GetReservations')
  async getReservations(data: GetReservationsRequest) {
    return await this.reservationsService.findMany(data);
  }
}
