import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  await app.listen(process.env.PORT ?? 80);
  Logger.log(
    `🚀 Gateway service is running on: http://localhost:${process.env.PORT ?? 80}`,
  );
}
bootstrap();
