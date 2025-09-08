import { Inject, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GRPC_USERS_CLIENT, GRPC_FACILITIES_CLIENT } from './constants';
import { Metadata as GrpcMetadata } from '@grpc/grpc-js';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  Matches,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { DayOfWeek } from './dto';
import { ApiProperty } from '@nestjs/swagger';

export const InjectUsersClient = () => Inject(GRPC_USERS_CLIENT);
export const InjectFacilitiesClient = () => Inject(GRPC_FACILITIES_CLIENT);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentMeta = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const meta = new GrpcMetadata();
    meta.set('authorization', request.headers?.authorization);
    meta.set('userId', request?.userId);
    return meta;
  },
);

export const SerializeAsISO = () =>
  Transform(({ value }) => value?.toISOString(), { toPlainOnly: true });
/**
 * Validates that a string represents a valid time in HH:MM format (24-hour format)
 * @param validationOptions - Optional validation options
 * @returns Property decorator for time validation
 */
export const IsTime = (validationOptions?: ValidationOptions) =>
  Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format (24-hour)',
    ...validationOptions,
  });
/**
 * Validates that the the input value is a value that matches one of the DayOfWeek enum values.
 */
export const IsDayOfWeek = () =>
  IsEnum(DayOfWeek, {
    message:
      'day_of_week must be a valid DayOfWeek enum value. Valid values are 0 (Sunday) to 6 (Saturday).',
  });
/**
 * Swagger documentation decorator
 */
export const DayOfWeekApiProperty = () =>
  ApiProperty({
    required: false,
    enum: DayOfWeek,
    enumName: 'DayOfWeek',
    description: 'Filter by day of week (0=Sunday, 1=Monday, ... 6=Saturday)',
    example: DayOfWeek.MONDAY,
  });

export const IsAfterTime = ({
  targetField,
}: {
  targetField: string;
}): PropertyDecorator => {
  return function (target: Object, propertyKey: string) {
    registerDecorator({
      name: 'isAfterTime',
      target: target.constructor,
      propertyName: propertyKey,
      constraints: [targetField],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [targetField] = args.constraints;
          const targetFieldValue = args.object[targetField];
          const [target_HH, target_mm] = targetFieldValue.split(':');
          const targetFieldValueAsDate = new Date(
            2025,
            0,
            0,
            target_HH,
            target_mm,
          );
          const [value_HH, value_mm] = value.split(':');
          const valueAsDate = new Date(2025, 0, 0, value_HH, value_mm);
          return valueAsDate > targetFieldValueAsDate;
        },

        defaultMessage(args: ValidationArguments) {
          const [targetField] = args.constraints;
          return `${args.property} must be after ${targetField}`;
        },
      },
    });
  };
};
