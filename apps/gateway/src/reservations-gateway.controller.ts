import { InjectReservationsClient } from '@app/common/decorators';
import { GRPC_RESERVATIONS_SERVICE } from '@app/common/constants';
import {
  CreateReservationRequest,
  GetReservationsRequest,
  IReservationsClient,
  ReservationStatus,
} from '@app/common/reservations';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RequiredBody } from './required-body.guard';
import { Authorized } from '@app/common/users/auth.guard';
import { CurrentMeta } from '@app/common/decorators';

@ApiTags('Reservations')
@Controller('reservations')
@Authorized()
export class ReservationsGatewayController {
  private reservationsService: IReservationsClient;

  constructor(@InjectReservationsClient() private client: ClientGrpc) {}

  onModuleInit() {
    this.reservationsService = this.client.getService<IReservationsClient>(
      GRPC_RESERVATIONS_SERVICE,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get reservations with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'List of reservations retrieved successfully',
  })
  async getReservations(
    @Query() query: GetReservationsRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    console.log('__GetReservations query', JSON.stringify(query, null, 2));
    return this.reservationsService.GetReservations(query, metadata);
  }

  @Post()
  @RequiredBody()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
  })
  async createReservation(
    @Body() body: CreateReservationRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    return await this.reservationsService.CreateReservation(body, metadata);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiResponse({
    status: 200,
    description: 'Reservation cancelled successfully',
  })
  async deleteReservation(
    @Param('id') id: string,
    @CurrentMeta() metadata: Metadata,
  ) {
    return await this.reservationsService.DeleteReservation(
      { id: parseInt(id) },
      metadata,
    );
  }
}
