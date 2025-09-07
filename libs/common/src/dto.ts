import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsOptional, IsPositive, Min } from 'class-validator';

export class BaseDto {
  static fromObject<T extends object>(
    this: new () => T,
    obj: Partial<T> | any,
  ): T {
    const instance = new this();
    return Object.assign(instance, obj) as T;
  }
}

export class DeleteEntitytRequest {
  @IsDefined()
  id: number;
}

export type IUpsertEntity<T, K extends keyof any = ''> = Omit<
  T,
  'id' | 'created_at' | 'updated_at' | 'owner_id' | 'active' | 'fromObject' | K
>;

export class PaginationRequest {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({ name: 'limit', required: false })
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  @ApiProperty({ name: 'offset', required: false })
  offset?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
}
