/** Mirrors backend `UserResponseDto` / `AuthResponseDto` (see Swagger at /api/docs). */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: User;
}
