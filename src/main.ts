/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // autorise uniquement ton front
    credentials: true, // si tu envoies des cookies ou des headers d'auth
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
