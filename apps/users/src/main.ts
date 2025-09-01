import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { UsersModule } from './users.module';
import { GRPC_USERS_PACKAGE } from '@app/common/constants';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.GRPC,
      options: {
        package: GRPC_USERS_PACKAGE,
        protoPath: join(__dirname, '../../../libs/common/proto/users.proto'),
        url: `0.0.0.0:${process.env.PORT || 50051}`,
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
}
bootstrap();
