import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './services/logger.service';
import { ConfigService } from '@nestjs/config';

const LOGGER = new LoggerService();
const config = new ConfigService();
LOGGER.setContext('APP');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LOGGER,
  });
  const PORT = config.get('PORT') || 3030;
  await app.listen(PORT);
  LOGGER.log(`🚀 Server started on http://localhost:${PORT}`);
}

void bootstrap();
