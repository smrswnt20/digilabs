import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { loginApi, getMeApi, logoutApi, changePasswordApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tcet_auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { user: refreshed } = await getMeApi();
      setUser(refreshed);
    } catch (err) {
      console.warn('Session expired or user inactive');
      localStorage.removeItem('tcet_auth_token');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    async function loadInitialSession() {
      const savedToken = localStorage.getItem('tcet_auth_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { user: me } = await getMeApi();
        setUser(me);
        setToken(savedToken);
      } catch (err) {
        localStorage.removeItem('tcet_auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialSession();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await loginApi(email, pass);
      localStorage.setItem('tcet_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {}
    localStorage.removeItem('tcet_auth_token');
    setToken(null);
    setUser(null);
    // Push state to /login
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
    }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    await changePasswordApi(currentPass, newPass);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      logout, 
      refreshUser,
      changePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
