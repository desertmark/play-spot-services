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
import { Transform, Type } from 'class-transformer';
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

  static fromObject<T extends object>(
    this: new () => T,
    obj: any & { reservationSlots: any },
  ): T {
    return super.fromObject<T>({
      ...obj,
      slots: obj.reservationSlots,
    });
  }
}

export class CreateReservationRequest
  implements IUpsertEntity<Reservation, 'status' | 'userId'>
{
  @IsDefined()
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

export class GetReservationsRequest extends PaginationRequest {
  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  userId?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  reservationDate?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  @ApiProperty({ required: false, enum: ReservationStatus })
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
