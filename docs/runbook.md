# Runbook

## Health & signals

| Check                  | How                              | Healthy                                                   |
| ---------------------- | -------------------------------- | --------------------------------------------------------- |
| API liveness/readiness | `GET /api/health`                | `200 {"status":"ok"}`. `503` lists the failing dependency |
| Container health       | `docker compose ps`              | `healthy`                                                 |
| Logs                   | `docker compose logs -f backend` | JSON lines, one per request, with `req.id`                |

Correlate a user report with logs through the `requestId` in the error body (also the
`x-request-id` response header).

## Common incidents

### API won't start: "Invalid environment configuration"

The message lists every invalid variable. Fix the env (see [deployment.md](./deployment.md#environment-variables-backend)) and restart.

### `/api/health` returns 503 (mongodb down)

1. `docker compose ps mongo`, then `docker compose logs mongo`.
2. Check `MONGODB_URI`, network and credentials.
3. The API recovers automatically once Mongo is reachable (Mongoose reconnects).

### Users are logged out unexpectedly

- **All users at once**: `JWT_REFRESH_SECRET` changed, or the API clock is skewed. Check deploy history and NTP.
- **One user, often**: logs show `Refresh token reuse detected`. Either a token replay (possible theft, so ask the user to sign in again and review their activity) or two clients sharing a session. Expected after signing in on a second device (one session per user).

### Many `429` responses

The rate limit was hit (10/min/IP on auth). Behind a proxy, confirm `X-Forwarded-For` is passed
(nginx config) so users aren't grouped under the proxy IP. Raise `THROTTLE_LIMIT` only with care.

### Login always fails with "Invalid email or password"

Confirm the account exists (`db.users.findOne({ email: "<lowercase email>" })`). Emails are stored
lower-cased. Check the logs for `Failed sign-in attempt` volume, which may indicate an attack.

## Secret rotation

| Secret               | Effect                                               | Procedure                                           |
| -------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| `JWT_ACCESS_SECRET`  | Access tokens invalid. Clients refresh automatically | Update + rolling restart                            |
| `JWT_REFRESH_SECRET` | Everyone signed out                                  | Update + restart during a quiet window. Announce it |

## Backup / restore (MongoDB)

```bash
docker compose exec mongo mongodump --archive=/data/db/backup.archive --db easygenerator-auth
docker compose exec mongo mongorestore --archive=/data/db/backup.archive --drop
```
