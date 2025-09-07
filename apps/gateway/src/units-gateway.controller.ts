import { InjectFacilitiesClient } from '@app/common/decorators';
import { GRPC_UNITS_SERVICE } from '@app/common/constants';
import {
  CreateUnitRequest,
  GetUnitsRequest,
  UpdateUnitRequest,
  IUnitsClient,
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

@ApiTags('Units')
@Controller('units')
@Authorized()
export class UnitsGatewayController {
  private unitsService: IUnitsClient;

  constructor(@InjectFacilitiesClient() private client: ClientGrpc) {}

  onModuleInit() {
    this.unitsService =
      this.client.getService<IUnitsClient>(GRPC_UNITS_SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Get units with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of units retrieved successfully',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  async getUnits(
    @Query() request: GetUnitsRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    return this.unitsService.GetUnits(request, metadata);
  }

  @Post()
  @RequiredBody()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  async createUnit(
    @Body() body: CreateUnitRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    return await this.unitsService.CreateUnit(body, metadata);
  }

  @Put(':id')
  @RequiredBody()
  @ApiOperation({ summary: 'Update a unit' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  async updateUnit(
    @Param('id') id: string,
    @Body() body: CreateUnitRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    const request: UpdateUnitRequest = {
      id: parseInt(id),
      model: body,
    };
    return await this.unitsService.UpdateUnit(request, metadata);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  async deleteUnit(@Param('id') id: string, @CurrentMeta() metadata: Metadata) {
    return await this.unitsService.DeleteUnit({ id: parseInt(id) }, metadata);
  }
}
