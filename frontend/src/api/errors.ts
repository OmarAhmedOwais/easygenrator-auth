/** Mirror of the backend's `ErrorBody` (AllExceptionsFilter). */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  requestId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, body?: Partial<ApiErrorBody>) {
    const messages = Array.isArray(body?.message)
      ? body.message
      : [body?.message ?? 'Something went wrong. Please try again.'];
    super(messages[0]);
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

/** Human message for any thrown value (network errors included). */
export function errorMessage(e: unknown): string {
  if (isApiError(e)) {
    if (e.status === 429) return 'Too many attempts. Please wait a minute and try again.';
    if (e.status >= 500) return 'The server had a problem. Please try again shortly.';
    return e.messages.join(' ');
  }
  return 'Cannot reach the server. Check your connection and try again.';
}
