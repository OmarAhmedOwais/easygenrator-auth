import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import type { AppConfig } from './config/configuration.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule.forRoot(), { bufferLogs: true });
  app.useLogger(app.get(Logger));
  configureApp(app);

  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const port = config.get('port', { infer: true });
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`API listening on http://localhost:${port}/api`);
  if (config.get('swaggerEnabled', { infer: true })) {
    logger.log(`Swagger docs on http://localhost:${port}/api/docs`);
  }
}

await bootstrap();
