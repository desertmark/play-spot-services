import {
  IsDefined,
  IsOptional,
  IsPositive,
  IsTimeZone,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BaseDto, IUpsertEntity, PaginationRequest } from '../dto';
import { SerializeAsISO } from '../decorators';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Establishment extends BaseDto {
  id: number;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  tz: string;
  active: boolean;
  @SerializeAsISO()
  createdAt: Date | null;
  @SerializeAsISO()
  updatedAt: Date | null;
}

export class CreateEstablishmentRequest
  implements IUpsertEntity<Establishment>
{
  @MinLength(3)
  @ApiProperty()
  name: string;

  @MinLength(3)
  @ApiProperty()
  description: string;

  @MinLength(3)
  @ApiProperty()
  address: string;

  @MinLength(3)
  @ApiProperty()
  city: string;

  @MinLength(3)
  @ApiProperty()
  state: string;

  @MinLength(3)
  @ApiProperty()
  zipCode: string;

  @IsTimeZone()
  @ApiProperty()
  tz: string;
}

export class UpdateEstablishmentRequest {
  @IsDefined()
  @IsPositive()
  id: number;
  @ValidateNested()
  @Type(() => CreateEstablishmentRequest)
  model: CreateEstablishmentRequest;
}

export class GetEstablishmentsRequest {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationRequest)
  pagination?: PaginationRequest;
}
