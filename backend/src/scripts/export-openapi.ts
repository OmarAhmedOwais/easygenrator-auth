/**
 * Writes the OpenAPI contract to specs/001-auth-module/contracts/openapi.json so the spec, the
 * Swagger UI and the code can never drift. Boots the app with the in-memory adapter (no DB).
 *   npm run openapi
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

process.env.DB_DRIVER = 'memory';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_ACCESS_SECRET ??= 'openapi-export-access-secret-0123456789';
process.env.JWT_REFRESH_SECRET ??= 'openapi-export-refresh-secret-0123456789';

const { NestFactory } = await import('@nestjs/core');
const { AppModule } = await import('../app.module.js');
const { buildOpenApiDocument } = await import('../app.setup.js');

const app = await NestFactory.create(AppModule.forRoot(), { logger: false });
app.setGlobalPrefix('api');
const document = buildOpenApiDocument(app);
await app.close();

const out = resolve(process.argv[2] ?? '../specs/001-auth-module/contracts/openapi.json');
await mkdir(dirname(out), { recursive: true });
await writeFile(out, `${JSON.stringify(document, null, 2)}\n`);
console.log(`OpenAPI written to ${out}`);
