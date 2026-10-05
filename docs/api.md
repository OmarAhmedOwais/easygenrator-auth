# API reference

- Base URL: `/api` (same origin as the SPA). Interactive docs: **`/api/docs`** (Swagger UI).
- Machine-readable contract: [`specs/001-auth-module/contracts/openapi.json`](../specs/001-auth-module/contracts/openapi.json). Regenerate it with `npm run openapi` in `backend/`.
- Content type: `application/json`. Every response carries `x-request-id`.

## Authentication

| Credential                | Transport                                                                         | Lifetime                               | Used by                          |
| ------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------- |
| Access token (JWT HS256)  | `Authorization: Bearer <token>`                                                   | 15 min (`JWT_ACCESS_TTL`)              | every protected route            |
| Refresh token (JWT HS256) | `refresh_token` cookie: httpOnly, SameSite=Strict, Path=/api/auth, Secure in prod | 7 days (`JWT_REFRESH_TTL`), single use | `/auth/refresh`, `/auth/signout` |

Send requests with `credentials: 'include'` so the browser attaches the cookie on `/api/auth/*`.

## Endpoints

### `POST /api/auth/signup`

```json
{ "email": "jane@example.com", "name": "Jane Doe", "password": "Passw0rd!" }
```

| Field    | Rules                                                                         |
| -------- | ----------------------------------------------------------------------------- |
| email    | valid email, ≤ 254 chars. Trimmed + lower-cased                               |
| name     | 3–50 chars, trimmed                                                           |
| password | 8–128 chars, ≥ 1 letter, ≥ 1 digit, ≥ 1 special (non-alphanumeric, non-space) |

`201` →

```json
{
  "accessToken": "eyJ…",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "6700…",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "createdAt": "2026-10-05T12:00:00.000Z"
  }
}
```

plus `Set-Cookie: refresh_token=…`. Errors: `400` validation (incl. unknown fields), `409` email
already registered, `429` rate limit.

### `POST /api/auth/signin`

`{ "email", "password" }` → `200` same body as sign-up + cookie. `401 "Invalid email or password"`
for an unknown email **or** a wrong password.

### `POST /api/auth/refresh`

No body. Needs the cookie. → `200` new access token + **rotated** cookie. `401` if the cookie is
missing, invalid, expired, revoked or **already used** (which revokes the session).

### `POST /api/auth/signout`

No body. → `204`. Revokes the session server-side and clears the cookie. Idempotent.

### `GET /api/users/me` 🔒

`Authorization: Bearer <accessToken>` → `200 { id, email, name, createdAt }`. `401` without a
valid token.

### `GET /api/health`

`200 { "status": "ok", "details": { "mongodb": { "status": "up" } } }` · `503` when MongoDB is down.

## Error format

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["Please provide a valid email address"],
  "path": "/api/auth/signup",
  "timestamp": "2026-10-05T12:00:00.000Z",
  "requestId": "1b4e…"
}
```

`message` is a `string[]` for validation errors and a `string` otherwise. 5xx responses never
include internal details. Quote the `requestId` when reporting an issue.

## Rate limits

`/api/auth/*`: **10 requests per minute per IP** (`THROTTLE_LIMIT`, `THROTTLE_TTL_MS`). Over the
limit you get `429`.

## cURL walkthrough

```bash
API=http://localhost:3000/api
curl -s -c jar -H 'content-type: application/json' \
  -d '{"email":"jane@example.com","name":"Jane Doe","password":"Passw0rd!"}' $API/auth/signup
TOKEN=$(curl -s -b jar -c jar -X POST $API/auth/refresh | jq -r .accessToken)
curl -s -H "authorization: Bearer $TOKEN" $API/users/me
curl -s -b jar -c jar -X POST $API/auth/signout -o /dev/null -w '%{http_code}\n'   # 204
```
