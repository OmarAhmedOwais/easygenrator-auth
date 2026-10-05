import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import {
  type HealthIndicatorFunction,
  MongooseHealthIndicator,
  TerminusModule,
} from '@nestjs/terminus';
import type { DbDriver } from '../../persistence/persistence.module.js';
import { HEALTH_INDICATORS, HealthController } from './health.controller.js';

@Module({})
export class HealthModule {
  static forRoot(driver: DbDriver): DynamicModule {
    const indicators: Provider =
      driver === 'mongo'
        ? {
            provide: HEALTH_INDICATORS,
            inject: [MongooseHealthIndicator],
            useFactory: (mongo: MongooseHealthIndicator): HealthIndicatorFunction[] => [
              () => mongo.pingCheck('mongodb', { timeout: 1500 }),
            ],
          }
        : { provide: HEALTH_INDICATORS, useValue: [] };

    return {
      module: HealthModule,
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [indicators],
    };
  }
}
