'use clien';

import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';
import { getMe } from '@/services/auth/authApi';

export function useAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = storage.getToken();
      if (token) {
        try {
          const response = await getMe();
          const userData = response.data;
          if (userData && userData.email) {
            setUser({
              name: userData.email.split('@')[0],
              email: userData.email,
            });
            setIsAuthorized(true);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          storage.clearAll();
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  return { isAuthorized, isLoading, user };
}