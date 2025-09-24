import { InjectFacilitiesClient } from '@app/common/decorators';
import { GRPC_ESTABLISHMENTS_SERVICE } from '@app/common/constants';
import {
  CreateEstablishmentRequest,
  GetEstablishmentsRequest,
  UpdateEstablishmentRequest,
  IEstablishmentsClient,
} from '@app/common/facilities';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RequiredBody } from './required-body.guard';
import { Authorized } from '@app/common/users/auth.guard';
import { CurrentMeta } from '@app/common/decorators';
import { PaginationRequest } from '@app/common/dto';

@ApiTags('Establishments')
@Controller('establishments')
@Authorized()
export class EstablishmentsGatewayController {
  private establishmentsService: IEstablishmentsClient;

  constructor(@InjectFacilitiesClient() private client: ClientGrpc) {}

  onModuleInit() {
    this.establishmentsService = this.client.getService<IEstablishmentsClient>(
      GRPC_ESTABLISHMENTS_SERVICE,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get establishments with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of establishments retrieved successfully',
  })
  async getEstablishments(
    @Query() query: GetEstablishmentsRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    return this.establishmentsService.GetEstablishments(query, metadata);
  }

  @Post()
  @RequiredBody()
  @ApiOperation({ summary: 'Create a new establishment' })
  @ApiResponse({
    status: 201,
    description: 'Establishment created successfully',
  })
  async createEstablishment(
    @Body() body: CreateEstablishmentRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    return await this.establishmentsService.CreateEstablishment(body, metadata);
  }

  @Put(':id')
  @RequiredBody()
  @ApiOperation({ summary: 'Update an establishment' })
  @ApiResponse({
    status: 200,
    description: 'Establishment updated successfully',
  })
  async updateEstablishment(
    @Param('id') id: string,
    @Body() body: CreateEstablishmentRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    const request: UpdateEstablishmentRequest = {
      id: parseInt(id),
      model: body,
    };
    return await this.establishmentsService.UpdateEstablishment(
      request,
      metadata,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an establishment' })
  @ApiResponse({
    status: 200,
    description: 'Establishment deleted successfully',
  })
  async deleteEstablishment(
    @Param('id') id: string,
    @CurrentMeta() metadata: Metadata,
  ) {
    return await this.establishmentsService.DeleteEstablishment(
      { id: parseInt(id) },
      metadata,
    );
  }
}
