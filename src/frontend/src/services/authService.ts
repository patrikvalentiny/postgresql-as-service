import axios, {type AxiosInstance} from 'axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';

class AuthService {
  private api: AxiosInstance;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user_data';

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_POSTGREST_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'auth',
        'Content-Profile': 'auth'
      },
    });

    // Add request interceptor to include JWT token
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/rpc/login', credentials);
      const authData: AuthResponse = response.data;

      if (authData.success && authData.token) {
        this.storeToken(authData.token);
        this.storeUser({
          user_id: authData.user_id!,
          email: authData.email!,
        });
      }

      return authData;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/rpc/register', credentials);
      const authData: AuthResponse = response.data;

      if (authData.success && authData.token) {
        this.storeToken(authData.token);
        this.storeUser({
          user_id: authData.user_id!,
          email: authData.email!,
        });
      }

      return authData;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.',
      };
    }
  }

  async verifyToken(token?: string): Promise<boolean> {
    try {
      const tokenToVerify = token || this.getToken();
      if (!tokenToVerify) return false;

      const response = await this.api.post('/rpc/verify_jwt', {
        token: tokenToVerify,
      });

      const result = response.data;
      return result.success;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}

export const authService = new AuthService();
export default authService;
