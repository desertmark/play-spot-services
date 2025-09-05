import { IsTimeZone, MinLength } from 'class-validator';
import { BaseDto, PaginationRequest } from '../dto';
import { SerializeAsISO } from '../decorators';

export class Establishment extends BaseDto<Establishment> {
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
  implements
    Omit<
      Establishment,
      'id' | 'created_at' | 'updated_at' | 'owner_id' | 'active' | 'fromObject'
    >
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

export class GetEstablishmentsRequest {
  pagination?: PaginationRequest;
}
