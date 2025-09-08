import { InjectFacilitiesClient } from '@app/common/decorators';
import { GRPC_SLOTS_SERVICE } from '@app/common/constants';
import {
  CreateSlotRequest,
  GetSlotsRequest,
  UpdateSlotRequest,
  ISlotsClient,
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

@ApiTags('Slots')
@Controller('slots')
@Authorized()
export class SlotsGatewayController {
  private slotsService: ISlotsClient;

  constructor(@InjectFacilitiesClient() private client: ClientGrpc) {}

  onModuleInit() {
    this.slotsService =
      this.client.getService<ISlotsClient>(GRPC_SLOTS_SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Get slots with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'List of slots retrieved successfully',
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
  @ApiQuery({
    name: 'unit_id',
    required: false,
    type: Number,
    description: 'Filter by unit ID',
  })
  @ApiQuery({
    name: 'day_of_week',
    required: false,
    type: Number,
    description: 'Filter by day of week (0=Sunday, 1=Monday, ... 6=Saturday)',
  })
  async getSlots(
    @Query() request: GetSlotsRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    return this.slotsService.GetSlots(request, metadata);
  }

  @Post()
  @RequiredBody()
  @ApiOperation({ summary: 'Create a new slot' })
  @ApiResponse({ status: 201, description: 'Slot created successfully' })
  async createSlot(
    @Body() body: CreateSlotRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    return await this.slotsService.CreateSlot(body, metadata);
  }

  @Put(':id')
  @RequiredBody()
  @ApiOperation({ summary: 'Update a slot' })
  @ApiResponse({ status: 200, description: 'Slot updated successfully' })
  async updateSlot(
    @Param('id') id: string,
    @Body() body: CreateSlotRequest,
    @CurrentMeta() metadata: Metadata,
  ) {
    const request: UpdateSlotRequest = {
      id: parseInt(id),
      model: body,
    };
    return await this.slotsService.UpdateSlot(request, metadata);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a slot' })
  @ApiResponse({ status: 200, description: 'Slot deleted successfully' })
  async deleteSlot(@Param('id') id: string, @CurrentMeta() metadata: Metadata) {
    return await this.slotsService.DeleteSlot({ id: parseInt(id) }, metadata);
  }
}
