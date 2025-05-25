import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      const userData = authService.getUser();

      if (token && userData) {
        const isValid = await authService.verifyToken(token);
        if (isValid) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          authService.logout();
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    if (result.success) {
      const userData = authService.getUser();
      setUser(userData);
      setIsAuthenticated(true);
    }
    return result;
  };

  const register = async (email: string, password: string) => {
    const result = await authService.register({ email, password });
    if (result.success) {
      const userData = authService.getUser();
      setUser(userData);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
};
