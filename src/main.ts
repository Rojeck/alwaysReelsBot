import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './modules/logger/logger.service';
import { ValidationPipe } from '@nestjs/common';

const LOGGER = new LoggerService();
LOGGER.setContext('APP');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LOGGER,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const PORT = process.env.PORT || 3030;
  await app.listen(PORT);
  LOGGER.log(`🚀 Server started on http://localhost:${PORT}}`);
}

void bootstrap();
