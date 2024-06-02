import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './services/logger.service';

const LOGGER = new LoggerService();
LOGGER.setContext('APP');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LOGGER,
  });
  const PORT = process.env.PORT || 3030;
  await app.listen(PORT);
  LOGGER.log(`🚀 Server started on http://localhost:${PORT}}`);
}

void bootstrap();
