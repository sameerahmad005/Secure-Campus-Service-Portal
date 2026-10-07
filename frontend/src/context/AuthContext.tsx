import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { authService } from '../services';
import { mockStorage } from '../services/mockStorage';

interface AuthContextType {
  currentUser: User | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, roleHint?: Role) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  resetMockData: () => void;
  availableAccounts: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableAccounts, setAvailableAccounts] = useState<User[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        const accounts = await authService.getMockAccounts();
        setCurrentUser(user);
        setAvailableAccounts(accounts);
      } catch (err) {
        console.error('Failed to initialize mock session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, roleHint?: Role) => {
    setIsLoading(true);
    try {
      const session = await authService.login({ email, roleHint });
      setCurrentUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: Role) => {
    setIsLoading(true);
    try {
      const user = await authService.switchMockRole(targetRole);
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const resetMockData = () => {
    mockStorage.resetStore();
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isLoading,
        login,
        logout,
        switchRole,
        resetMockData,
        availableAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
