import {
  IsArray,
  IsDate,
  IsDateString,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { BaseDto, IUpsertEntity, PaginationRequest } from '../dto';
import { IsFutureDate, SerializeAsISO } from '../decorators';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export class Reservation extends BaseDto {
  @IsDefined()
  @IsPositive()
  @ApiProperty()
  id: number;

  @IsDefined()
  @IsUUID()
  @ApiProperty()
  user_id: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty()
  reservation_date: Date;

  @IsEnum(ReservationStatus)
  @ApiProperty()
  status: ReservationStatus;

  @SerializeAsISO()
  @ApiProperty()
  created_at: Date | null;

  @SerializeAsISO()
  @ApiProperty()
  updated_at: Date | null;
}

export class CreateReservationRequest
  implements IUpsertEntity<Reservation, 'status' | 'user_id'>
{
  @IsDefined()
  // @IsDateString()
  @ApiProperty()
  @IsFutureDate()
  reservation_date: Date;

  @IsDefined()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @ApiProperty()
  slot_ids: number[];
}

export class GetReservationsRequest {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationRequest)
  pagination?: PaginationRequest;
}

/**
  For avilability filtering

  @IsDefined()
  city: string;
  
  @IsOptional()
  @IsDateString()
  dateFrom: Date;
  
  @IsDateString()
  @IsOptional()
  dateTo: Date;
 */
