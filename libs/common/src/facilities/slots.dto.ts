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
  unit_id: number;
  @IsDayOfWeek()
  day_of_week: DayOfWeek;
  @IsTime()
  open_time: string;
  @IsTime()
  close_time: string;
  active: boolean;
  @SerializeAsISO()
  created_at: Date | null;
  @SerializeAsISO()
  updated_at: Date | null;
}

export class CreateSlotRequest implements IUpsertEntity<Slot> {
  @IsDefined()
  @IsPositive()
  @ApiProperty()
  unit_id: number;

  @IsDefined()
  @IsDayOfWeek()
  @Type(() => Number)
  @DayOfWeekApiProperty()
  day_of_week: DayOfWeek;

  @IsDefined()
  @IsString()
  @IsTime()
  @ApiProperty({
    example: '08:00',
    description: 'Opening time in HH:MM format',
  })
  open_time: string;

  @IsDefined()
  @IsString()
  @IsTime()
  @ApiProperty({
    example: '22:00',
    description: 'Closing time in HH:MM format',
  })
  @IsAfterTime({ targetField: 'open_time' })
  close_time: string;
}

export class UpdateSlotRequest extends BaseDto {
  @IsDefined()
  @IsPositive()
  id: number;
  @ValidateNested()
  @Type(() => CreateSlotRequest)
  model: CreateSlotRequest;
}

export class GetSlotsRequest {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ids: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationRequest)
  pagination?: PaginationRequest;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    required: false,
    description: 'Filter by unit_id',
  })
  unit_id?: number;

  @IsOptional()
  @IsDayOfWeek()
  @Type(() => Number)
  @DayOfWeekApiProperty()
  day_of_week?: DayOfWeek;
}
