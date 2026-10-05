import Joi from 'joi';

/**
 * Fail fast at boot: the process refuses to start with a missing/weak secret or a malformed
 * value instead of failing on the first request.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),
  SWAGGER_ENABLED: Joi.boolean().default(true),

  DB_DRIVER: Joi.string().valid('mongo', 'memory').default('mongo'),
  MONGODB_URI: Joi.when('DB_DRIVER', {
    is: 'mongo',
    then: Joi.string()
      .uri({ scheme: ['mongodb', 'mongodb+srv'] })
      .required(),
    otherwise: Joi.string().optional(),
  }),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().invalid(Joi.ref('JWT_ACCESS_SECRET')),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
  COOKIE_SECURE: Joi.boolean().default(false),

  THROTTLE_TTL_MS: Joi.number().integer().positive().default(60_000),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(10),
});

/**
 * `ConfigModule.validate` hook. Reports every invalid variable at once (abortEarly: false),
 * ignores unrelated variables, and returns the coerced values (numbers/booleans/defaults).
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const result = envValidationSchema.validate(config, { abortEarly: false, allowUnknown: true });
  if (result.error) {
    const problems = result.error.details.map((d) => d.message).join('\n- ');
    throw new Error(`Invalid environment configuration:\n- ${problems}`);
  }
  return result.value as Record<string, unknown>;
}
