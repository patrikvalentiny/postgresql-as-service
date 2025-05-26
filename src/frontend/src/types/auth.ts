export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user_id?: string;
  email?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}
