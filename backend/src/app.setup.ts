import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { AppConfig } from './config/configuration.js';

/**
 * Everything that configures the HTTP layer, shared by `main.ts` and the e2e tests so the tests
 * exercise exactly what production runs.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  // Behind nginx / a load balancer: trust private-network proxies so rate limiting sees real IPs.
  (app as NestExpressApplication).set('trust proxy', 'loopback, linklocal, uniquelocal');

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: config.get('corsOrigins', { infer: true }),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown props
      forbidNonWhitelisted: true, // ...and reject them (mass-assignment guard)
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  if (config.get('swaggerEnabled', { infer: true })) {
    SwaggerModule.setup('api/docs', app, buildOpenApiDocument(app), {
      swaggerOptions: { persistAuthorization: true },
    });
  }
}

/** Single source of the OpenAPI contract: served at /api/docs and exported by `npm run openapi`. */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const doc = new DocumentBuilder()
    .setTitle('Easygenerator Auth API')
    .setDescription('Sign up / sign in with JWT access tokens and rotating refresh cookies.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .build();
  return SwaggerModule.createDocument(app, doc);
}
