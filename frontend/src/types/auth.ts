export interface AdminLoginRequest {
  email: string;
  password: string;
}

// Full shape actually returned by the backend today — not just { accessToken }
export interface AdminLoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  email: string;
  roles: string[];
}

