'use client';
import FullScreenLoader from '@/components/ui/loader/FullScreenLoader';
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
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}auth/me`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('🚀 ~ fetchUser ~ data:', data);
        setUser({
          id: data.data.id,
          username: data.data.firstName + ' ' + data.data.lastName,
          email: data.data.email,
          status: data.data.status,
          token: token!,
        });
      } catch (error) {
        setError('Failed to fetch user');
        console.log(error);
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
