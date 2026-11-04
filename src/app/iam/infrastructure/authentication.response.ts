import type { UserResponse } from './user.response';

export interface AuthenticationResponse {
  token: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: UserResponse;
}
