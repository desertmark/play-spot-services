import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'users',
        protoPath: 'apps/users/src/users.proto',
        url: `0.0.0.0:${process.env.PORT || 50051}`,
      },
    },
  );
  await app.listen();
}
bootstrap();
