import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.setGlobalPrefix('api');

  // validaciones globales para los DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // elimina propiedades extra del body
    forbidNonWhitelisted: true,
    transform: true,          // convierte tipos (p.ej. string->number)
  }));

  await app.listen(3000);
}
bootstrap();