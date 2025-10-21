'use client';

import { useAuth } from '@/lib/providers';
import { UserRole } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [UserRole.USER], 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role-based access
    const userRole = (user as any)?.userType;
    if (allowedRoles.length > 0) {
      const hasAccess = allowedRoles.some(role => {
        if (role === UserRole.ADMIN && isAdmin) return true;
        if (role === UserRole.USER && userRole === 'user') return true;
        if (role === UserRole.BUYER && userRole === 'buyer') return true;
        if (role === UserRole.PARTNER && userRole === 'partner') return true;
        return false;
      });

      if (!hasAccess) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isAuthenticated, isAdmin, router, allowedRoles, redirectTo]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

// Specific role components
export const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={[UserRole.ADMIN]} redirectTo="/login">
    {children}
  </ProtectedRoute>
);

export const PartnerRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.PARTNER]} redirectTo="/login">
    {children}
  </ProtectedRoute>
);

export const UserRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.BUYER, UserRole.PARTNER, UserRole.ADMIN]}>
    {children}
  </ProtectedRoute>
);
