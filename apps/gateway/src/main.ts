import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Play Spot')
    .setDescription('Play Spot API Reference')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(process.env.PORT ?? 80);
  Logger.log(
    `🚀 Gateway service is running on: http://localhost:${process.env.PORT ?? 80}`,
  );
}
bootstrap();
