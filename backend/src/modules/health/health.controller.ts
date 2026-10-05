import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  type HealthIndicatorFunction,
} from '@nestjs/terminus';
import { Public } from '../auth/decorators/public.decorator';

export const HEALTH_INDICATORS = Symbol('HEALTH_INDICATORS');

@ApiTags('health')
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(HEALTH_INDICATORS) private readonly indicators: HealthIndicatorFunction[],
  ) {}

  /** Liveness + DB readiness, for Docker/K8s probes. */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check(this.indicators);
  }
}
