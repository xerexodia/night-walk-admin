'use client';
import FullScreenLoader from '@/components/ui/loader/FullScreenLoader';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { UserStatusEnum } from '@/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
type AuthContextType = {
  user: {
    id: string;
    username: string;
    email: string;
    token: string;
    status: UserStatusEnum;
  } | null;
  loading: boolean;
  error: string | null;
  setUser: React.Dispatch<
    React.SetStateAction<{
      id: string;
      username: string;
      email: string;
      token: string;
      status: UserStatusEnum;
    } | null>
  >;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string;
    token: string;
    status: UserStatusEnum;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🚀 ~ AuthProvider ~ token:', token);
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}auth/me`,
        );
        if (!response.ok) {
          // Clear stale tokens so ProtectedRoutes redirects to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          throw new Error(`auth/me returned ${response.status}`);
        }
        const data = await response.json();
        setUser({
          id: data.data.id,
          username: data.data.firstName + ' ' + data.data.lastName,
          email: data.data.email,
          status: data.data.status,
          token: token!,
        });
      } catch (error) {
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <FullScreenLoader />;
  }
  return (
    <AuthContext.Provider value={{ user, loading, error, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
