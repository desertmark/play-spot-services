import { IsOptional } from 'class-validator';
import { BaseDto } from '../dto';

export class UpdateUserRequest extends BaseDto {
  @IsOptional()
  firstName?: string;
  @IsOptional()
  lastName?: string;
}

export class GetUserByIdRequest {
  userId: string;
}

export class UserProfile extends UpdateUserRequest {
  id: string;
  email: string;
}

export interface ValidateJwtRequest {
  jwt: string;
}
export interface ValidateJwtResponse {
  isValid: boolean;
  userId: string;
  error?: string;
}
