import { BaseDto, IUpsertEntity, PaginationRequest } from '../dto';
import { SerializeAsISO } from '../decorators';
import {
  IsDefined,
  IsEnum,
  IsOptional,
  IsPositive,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UnitType {
  FOOTBALL = 'football',
  PADDLE = 'paddle',
}

export enum SurfaceType {
  ARTIFICIAL_GRASS = 'artificial_grass',
  CLAY = 'clay',
  HARD = 'hard',
  NATURAL_GRASS = 'natural_grass',
  WOOD = 'wood',
}

export class Unit extends BaseDto {
  id: number;
  establishmentId: number;
  name: string;
  @IsEnum(UnitType)
  type: UnitType;
  @IsEnum(SurfaceType)
  surfaceType: SurfaceType | null;
  indoor: boolean;
  @IsOptional()
  @IsPositive()
  capacity: number | null;
  active: boolean;
  @SerializeAsISO()
  createdAt: Date | null;
  @SerializeAsISO()
  updatedAt: Date | null;
}

export class CreateUnitRequest implements IUpsertEntity<Unit> {
  @IsDefined()
  @IsPositive()
  @ApiProperty()
  establishmentId: number;

  @MinLength(3)
  @ApiProperty()
  name: string;

  @IsEnum(UnitType)
  @ApiProperty({
    enum: UnitType,
    enumName: 'UnitType',
  })
  type: UnitType;

  @IsEnum(SurfaceType)
  @ApiProperty({
    enum: SurfaceType,
    enumName: 'SurfaceType',
    required: false,
  })
  surfaceType: SurfaceType | null;

  @Type(() => Boolean)
  @ApiProperty()
  indoor: boolean;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    type: Number,
    required: false,
  })
  capacity: number | null;
}

export class UpdateUnitRequest extends BaseDto {
  @IsDefined()
  @IsPositive()
  id: number;
  @ValidateNested()
  @Type(() => CreateUnitRequest)
  model: CreateUnitRequest;
}
export class GetUnitsRequest extends PaginationRequest {}
