'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { storage, User } from '@/services/storage';

type AuthContextType = {
  user: User | null;
  isAuthorized: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Используем setTimeout или Promise.resolve для асинхронного обновления
    const loadUserData = () => {
      const userData = storage.getUser();
      if (userData) {
        setUser(userData);
        setIsAuthorized(true);
      }
      setIsLoading(false);
    };
    
    loadUserData();
  }, []);

  const login = (userData: User) => {
    storage.setUser(userData);
    setUser(userData);
    setIsAuthorized(true);
  };

  const logout = () => {
    storage.clearAll();
    setUser(null);
    setIsAuthorized(false);
  };

  // Показываем загрузку, если данные еще не загружены
  if (isLoading) {
    return null; // или компонент загрузки
  }

  return (
    <AuthContext.Provider value={{ user, isAuthorized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};