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
  userId: string;

  @IsDefined()
  @IsDateString()
  @SerializeAsISO()
  @ApiProperty()
  reservationDate: Date;

  @IsEnum(ReservationStatus)
  @ApiProperty()
  status: ReservationStatus;

  @SerializeAsISO()
  @ApiProperty()
  createdAt: Date | null;

  @SerializeAsISO()
  @ApiProperty()
  updatedAt: Date | null;

  static fromObject(obj: any & { reservationSlots: any }): Reservation {
    return super.fromObject<Reservation>({
      ...obj,
      slots: obj.reservationSlots,
    });
  }
}

export class CreateReservationRequest
  implements IUpsertEntity<Reservation, 'status' | 'userId'>
{
  @IsDefined()
  // @IsDateString()
  @ApiProperty()
  @IsFutureDate()
  reservationDate: Date;

  @IsDefined()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @ApiProperty()
  slotIds: number[];
}

export class GetReservationsRequest {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationRequest)
  pagination?: PaginationRequest;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    required: false,
    description: 'Filter by user ID',
  })
  userId?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    required: false,
    description: 'Filter by reservation date',
  })
  reservationDate?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  @ApiProperty({
    required: false,
    enum: ReservationStatus,
    description: 'Filter by reservation status',
  })
  status?: ReservationStatus;
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
