import { IsOptional, IsPositive, Min } from 'class-validator';

export class BaseDto<T> {
  static fromObject<T extends object>(this: new () => T, obj: Partial<T>): T {
    const instance = new this();
    return Object.assign(instance, obj) as T;
  }
}

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
