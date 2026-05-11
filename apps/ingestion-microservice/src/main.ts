/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { getEnvironmentConfig } from './infrastructure/config/environment.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug'];
  
  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = getEnvironmentConfig().port;
  await app.listen(port);
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
