import { BaseDto, DayOfWeek, IUpsertEntity, PaginationRequest } from '../dto';
import {
  SerializeAsISO,
  IsTime,
  IsDayOfWeek,
  DayOfWeekApiProperty,
  IsAfterTime,
} from '../decorators';
import {
  IsDefined,
  IsOptional,
  IsPositive,
  ValidateNested,
  IsString,
  IsArray,
  IsIn,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Slot extends BaseDto {
  id: number;
  unitId: number;
  @IsDayOfWeek()
  dayOfWeek: DayOfWeek;
  @IsTime()
  openTime: string;
  @IsTime()
  closeTime: string;
  active: boolean;
  @SerializeAsISO()
  createdAt: Date | null;
  @SerializeAsISO()
  updatedAt: Date | null;
}

export class CreateSlotRequest implements IUpsertEntity<Slot> {
  @IsDefined()
  @IsPositive()
  @ApiProperty()
  unitId: number;

  @IsDefined()
  @IsDayOfWeek()
  @Type(() => Number)
  @DayOfWeekApiProperty()
  dayOfWeek: DayOfWeek;

  @IsDefined()
  @IsString()
  @IsTime()
  @ApiProperty({
    example: '08:00',
    description: 'Opening time in HH:MM format',
  })
  openTime: string;

  @IsDefined()
  @IsString()
  @IsTime()
  @ApiProperty({
    example: '22:00',
    description: 'Closing time in HH:MM format',
  })
  @IsAfterTime({ targetField: 'openTime' })
  closeTime: string;
}

export class UpdateSlotRequest extends BaseDto {
  @IsDefined()
  @IsPositive()
  id: number;
  @ValidateNested()
  @Type(() => CreateSlotRequest)
  model: CreateSlotRequest;
}

export class GetSlotsRequest extends PaginationRequest {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    required: false,
    description: 'Filter by unit ID',
  })
  unitId?: number;

  @IsOptional()
  @IsDayOfWeek()
  @Type(() => Number)
  @DayOfWeekApiProperty()
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @Type(() => Number)
  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by specific slot IDs',
  })
  ids?: number[];
}
