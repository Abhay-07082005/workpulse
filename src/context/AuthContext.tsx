import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LeaveBalance, Role } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  leaveBalance: LeaveBalance | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  quickDemoLogin: (type: 'HR' | 'EMPLOYEE') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error: toastError, info } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      if (data.leaveBalance) {
        setLeaveBalance(data.leaveBalance);
      }
    } catch (e) {
      setUser(null);
      setLeaveBalance(null);
      localStorage.removeItem('workpulse_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`, `Signed in as ${res.user.role === 'HR_ADMIN' ? 'HR Admin' : 'Employee'}`);
      await refreshUser();
    } catch (err: any) {
      toastError('Login Failed', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      success('Account Created!', `Welcome to WorkPulse, ${res.user.name}`);
      await refreshUser();
    } catch (err: any) {
      toastError('Registration Failed', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setLeaveBalance(null);
      info('Logged Out', 'You have been safely signed out.');
    } catch (err) {
      setUser(null);
      setLeaveBalance(null);
    }
  };

  const quickDemoLogin = async (type: 'HR' | 'EMPLOYEE') => {
    if (type === 'HR') {
      await login('hr@workpulse.io', 'password123');
    } else {
      await login('alex@workpulse.io', 'password123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        leaveBalance,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role || null,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
