import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, preferred_language?: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; resetToken?: string; error?: string }>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; preferred_language?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('dealnest_token');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const { setLanguage } = useLanguage();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // If user has a preferred language and localstorage doesn't conflict, apply it
          if (data.user.preferred_language) {
            setLanguage(data.user.preferred_language, false);
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem('dealnest_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify session token:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('dealnest_token', data.token);
      setToken(data.token);
      setUser(data.user);

      if (data.user.preferred_language) {
        setLanguage(data.user.preferred_language, false);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (name: string, email: string, password: string, preferred_language = 'en') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, preferred_language }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      localStorage.setItem('dealnest_token', data.token);
      setToken(data.token);
      setUser(data.user);

      if (data.user.preferred_language) {
        setLanguage(data.user.preferred_language, false);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error during registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem('dealnest_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; preferred_language?: string }) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Profile update failed' };
      }

      if (resData.token) {
        localStorage.setItem('dealnest_token', resData.token);
        setToken(resData.token);
      }
      setUser(resData.user);

      if (data.preferred_language) {
        setLanguage(data.preferred_language, false);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error updating profile' };
    }
  };

  const adminLogin = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Admin authentication failed' };
      }

      localStorage.setItem('dealnest_token', data.token);
      setToken(data.token);
      setUser(data.user);

      if (data.user.preferred_language) {
        setLanguage(data.user.preferred_language, false);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error during admin login' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to process request' };
      }
      return { success: true, message: data.message, resetToken: data.resetToken };
    } catch (err) {
      return { success: false, error: 'Network error requesting password reset' };
    }
  };

  const resetPassword = async (email: string, resetToken: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: resetToken, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reset password' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: 'Network error resetting password' };
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        adminLogin,
        register,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
