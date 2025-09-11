import { status } from '@grpc/grpc-js';
import {
  ClassSerializerInterceptor,
  INestMicroservice,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core/nest-factory';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { LoggerInterceptor } from './interceptors';
import { ModuleRef } from '@nestjs/core';
import { error } from 'console';
import { ValidationError } from 'class-validator';

type IEntryNestModule = Parameters<typeof NestFactory.createMicroservice>[0];
export interface IGrpcMicroserviceOptions {
  module: IEntryNestModule;
  packageName: string;
  protos: string[];
}

const PROTO_BASE_PATH = 'libs/common/proto';
/**
 * Serializes validation errors into a readable string.
 * i.e: `model: name must be longer than or equal to 3 characters, model: surface_type must be one of the following values: artificial_grass, clay, hard, natural_grass, wood`
 * @param errors
 * @param parentPath
 * @returns
 */
function serializeValidationErrors(
  errors: ValidationError[],
  parentPath: string = '',
): string {
  return errors
    .map((error) => {
      if (error.children?.length) {
        return serializeValidationErrors(error.children, error.property);
      }
      return Object.values(error.constraints || {}).map((s) =>
        parentPath ? `${parentPath}: ${s}` : s,
      );
    })
    .flat()
    .join(', ');
}

const VALIDATION_PIPE = new ValidationPipe({
  whitelist: true,
  transform: true, // <- ESTO es lo que hace que plain objects se vuelvan instancias de clase
  validateCustomDecorators: true,
  transformOptions: {
    enableImplicitConversion: true, // <- Ayuda con la conversión de tipos
  },
  exceptionFactory: (errors) => {
    return new RpcException({
      code: status.INVALID_ARGUMENT,
      message: serializeValidationErrors(errors),
    });
  },
});

export class GrpcNestFactory {
  static async createGrpcMicroservice({
    module,
    packageName,
    protos,
  }: IGrpcMicroserviceOptions): Promise<INestMicroservice> {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      module,
      {
        transport: Transport.GRPC,
        options: {
          package: packageName,
          protoPath: [
            join(PROTO_BASE_PATH, 'common.proto'),
            ...(protos?.map((proto) => join(PROTO_BASE_PATH, proto)) || []),
          ],
          url: `0.0.0.0:${process.env.PORT || 50051}`,
          loader: {
            keepCase: true,
          },
        },
      },
    );
    app.useGlobalPipes(VALIDATION_PIPE);
    app.useGlobalInterceptors(
      new LoggerInterceptor(app.get(ModuleRef)),
      new ClassSerializerInterceptor(app.get('Reflector')),
    );
    return app;
  }
}
