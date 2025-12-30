'use client';
import { useAuth } from '@/context/AuthContext';
import { UserStatusEnum } from '@/types';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FullScreenLoader from '../ui/loader/FullScreenLoader';

export default function ProtectedRoute({
  children,
  requiredStatus,
}: {
  children: React.ReactNode;
  requiredStatus?: UserStatusEnum;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (pathname.includes('dashboard')) {
          router.replace('/signin');
        } else {
          router.replace(pathname);
        }
      } else {
        if(pathname.includes('dashboard')){
          return;
        }
        router.replace('/dashboard');
      }
    }
  }, [loading, user, requiredStatus, router, pathname]);

  if (loading) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
