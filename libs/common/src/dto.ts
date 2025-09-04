import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationRequest {
  @IsOptional()
  @IsPositive()
  limit?: number;
  @IsOptional()
  @Min(0)
  offset?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
}
