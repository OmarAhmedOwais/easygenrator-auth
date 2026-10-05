/**
 * Typed view over the (already validated) environment. Inject with
 * `ConfigService<AppConfig, true>` and read `config.get('auth', { infer: true })`.
 */
export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  corsOrigins: string[];
  logLevel: string;
  swaggerEnabled: boolean;
  db: { driver: 'mongo' | 'memory'; uri?: string };
  auth: {
    accessSecret: string;
    accessTtl: string;
    refreshSecret: string;
    refreshTtl: string;
    cookieSecure: boolean;
  };
  throttle: { ttlMs: number; limit: number };
}

const bool = (v: string | undefined, fallback: boolean): boolean =>
  v === undefined ? fallback : v === 'true' || v === '1';

export default (): AppConfig => ({
  env: (process.env.NODE_ENV ?? 'development') as AppConfig['env'],
  port: Number(process.env.PORT ?? 3000),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  swaggerEnabled: bool(process.env.SWAGGER_ENABLED, true),
  db: {
    driver: (process.env.DB_DRIVER ?? 'mongo') as AppConfig['db']['driver'],
    uri: process.env.MONGODB_URI,
  },
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
    cookieSecure: bool(process.env.COOKIE_SECURE, false),
  },
  throttle: {
    ttlMs: Number(process.env.THROTTLE_TTL_MS ?? 60_000),
    limit: Number(process.env.THROTTLE_LIMIT ?? 10),
  },
});
