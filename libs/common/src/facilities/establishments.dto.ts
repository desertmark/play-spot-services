import {
  IsDefined,
  IsPositive,
  IsTimeZone,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BaseDto, IUpsertEntity, PaginationRequest } from '../dto';
import { SerializeAsISO } from '../decorators';
import { Type } from 'class-transformer';

export class Establishment extends BaseDto {
  id: number;
  owner_id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  tz: string;
  active: boolean;
  @SerializeAsISO()
  created_at: Date | null;
  @SerializeAsISO()
  updated_at: Date | null;
}

export class CreateEstablishmentRequest
  implements IUpsertEntity<Establishment>
{
  @MinLength(3)
  name: string;
  @MinLength(3)
  description: string;
  @MinLength(3)
  address: string;
  @MinLength(3)
  city: string;
  @MinLength(3)
  state: string;
  @MinLength(3)
  zip_code: string;
  @IsTimeZone()
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
  pagination?: PaginationRequest;
}
