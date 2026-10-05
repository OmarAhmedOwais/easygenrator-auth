/** Claims inside the short-lived access token (sent as `Authorization: Bearer`). */
export interface AccessTokenPayload {
  sub: string;
  email: string;
}

/** Claims inside the refresh token (httpOnly cookie only). `jti` makes every token unique. */
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

/** What `@CurrentUser()` hands to a controller once the JWT guard has passed. */
export interface AuthenticatedUser {
  userId: string;
  email: string;
}
