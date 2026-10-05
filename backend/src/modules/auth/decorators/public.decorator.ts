import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../auth.constants.js';

/**
 * Routes are protected by default (global JwtAuthGuard). Opt out explicitly - a forgotten
 * decorator fails closed (401), never open.
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
