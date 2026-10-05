# Deployment

## Docker Compose (reference deployment)

```bash
docker compose up --build -d
# App http://localhost:8080 · API http://localhost:3000/api · Swagger /api/docs
```

| Service    | Image                   | Notes                                                                      |
| ---------- | ----------------------- | -------------------------------------------------------------------------- |
| `mongo`    | `mongo:7`               | Volume `mongo-data`, healthcheck via `mongosh`                             |
| `backend`  | `./backend/Dockerfile`  | Multi-stage, prod deps only, non-root, `HEALTHCHECK /api/health`           |
| `frontend` | `./frontend/Dockerfile` | Vite build served by nginx. Proxies `/api` → `backend:3000`. CSP + caching |

Override secrets by putting a `.env` next to `docker-compose.yml`:

```env
JWT_ACCESS_SECRET=<48+ random chars>
JWT_REFRESH_SECRET=<different 48+ random chars>
```

## Environment variables (backend)

| Variable                             | Default                 | Required     | Description                                      |
| ------------------------------------ | ----------------------- | ------------ | ------------------------------------------------ |
| `NODE_ENV`                           | `development`           |              | `development` / `production` / `test`            |
| `PORT`                               | `3000`                  |              | HTTP port                                        |
| `CORS_ORIGINS`                       | `http://localhost:5173` |              | Comma-separated allow-list (credentials enabled) |
| `LOG_LEVEL`                          | `info`                  |              | pino level (`silent` in tests)                   |
| `SWAGGER_ENABLED`                    | `true`                  |              | Serve `/api/docs`                                |
| `DB_DRIVER`                          | `mongo`                 |              | `mongo` or `memory` (tests/demo only)            |
| `MONGODB_URI`                        | —                       | when `mongo` | `mongodb://` or `mongodb+srv://` URI             |
| `JWT_ACCESS_SECRET`                  | —                       | ✅           | ≥ 32 chars                                       |
| `JWT_ACCESS_TTL`                     | `15m`                   |              | Access token lifetime                            |
| `JWT_REFRESH_SECRET`                 | —                       | ✅           | ≥ 32 chars, must differ from the access secret   |
| `JWT_REFRESH_TTL`                    | `7d`                    |              | Refresh token lifetime                           |
| `COOKIE_SECURE`                      | `false`                 |              | **`true` in production (HTTPS)**                 |
| `THROTTLE_TTL_MS` / `THROTTLE_LIMIT` | `60000` / `10`          |              | Auth rate limit window / max requests            |

The process refuses to start if any value is invalid and lists every problem at once.

## Frontend build variables

| Variable                | Default                 | Description                                |
| ----------------------- | ----------------------- | ------------------------------------------ |
| `VITE_API_URL`          | empty (same origin)     | Only for a same-site API on another origin |
| `VITE_API_PROXY_TARGET` | `http://localhost:3000` | Dev server proxy target                    |

## Production checklist

- [ ] HTTPS terminated at the edge. `COOKIE_SECURE=true`
- [ ] Strong, distinct JWT secrets from a secret manager
- [ ] MongoDB with auth, TLS, backups, and a least-privilege user
- [ ] `SWAGGER_ENABLED=false` (or protected)
- [ ] Logs shipped as JSON (default in production) to your log platform
- [ ] Health check wired to the orchestrator (`/api/health`)
- [ ] Multiple API instances? Move throttler storage to Redis
- [ ] SPA and API on the same site ([ADR-0007](./adr/0007-same-origin-deployment.md))
