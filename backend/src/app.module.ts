import { randomUUID } from 'node:crypto';
import { type DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import configuration, { type AppConfig } from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { type DbDriver, PersistenceModule } from './persistence/persistence.module';

@Module({})
export class AppModule {
  /**
   * Dynamic so the persistence adapter is chosen once, at composition time. `ConfigModule.forRoot`
   * runs first and loads/validates `.env` synchronously, so DB_DRIVER is available here.
   */
  static forRoot(): DynamicModule {
    const configModule = ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      // Joi options: report every invalid variable at once, allow unrelated env vars.
      validationOptions: { abortEarly: false, allowUnknown: true },
    });
    const driver = (process.env.DB_DRIVER ?? 'mongo') as DbDriver;

    return {
      module: AppModule,
      imports: [
        configModule,
        LoggerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<AppConfig, true>) => ({
            pinoHttp: {
              level: config.get('logLevel', { infer: true }),
              // Pretty, single-line logs locally; raw JSON (for log shippers) in production.
              transport:
                config.get('env', { infer: true }) === 'development'
                  ? { target: 'pino-pretty', options: { singleLine: true } }
                  : undefined,
              genReqId: (req, res) => {
                const incoming = req.headers['x-request-id'];
                const id = typeof incoming === 'string' && incoming ? incoming : randomUUID();
                res.setHeader('x-request-id', id);
                return id;
              },
              // Never write credentials to logs.
              redact: {
                paths: [
                  'req.headers.authorization',
                  'req.headers.cookie',
                  'res.headers["set-cookie"]',
                ],
                censor: '[redacted]',
              },
              autoLogging: { ignore: (req) => req.url === '/api/health' },
            },
          }),
        }),
        ThrottlerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<AppConfig, true>) => {
            const { ttlMs, limit } = config.get('throttle', { infer: true });
            return [{ ttl: ttlMs, limit }];
          },
        }),
        PersistenceModule.forRoot(driver),
        HealthModule.forRoot(driver),
        UsersModule,
        AuthModule,
      ],
    };
  }
}
