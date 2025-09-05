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

type IEntryNestModule = Parameters<typeof NestFactory.createMicroservice>[0];
export interface IGrpcMicroserviceOptions {
  module: IEntryNestModule;
  packageName: string;
  protos: string[];
}

const PROTO_BASE_PATH = 'libs/common/proto';

const VALIDATION_PIPE = new ValidationPipe({
  transform: true,
  exceptionFactory: (errors) => {
    return new RpcException({
      code: status.INVALID_ARGUMENT,
      message: errors
        .map((err) => Object.values(err.constraints || []))
        .flat()
        .join(', '),
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
      new ClassSerializerInterceptor(app.get('Reflector')),
    );
    return app;
  }
}
