'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login', 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after component has mounted and auth is initialized
    if (requireAuth && !isAuthenticated && typeof window !== 'undefined') {
      // Add small delay to ensure localStorage has been checked
      const timer = setTimeout(() => {
        const stored = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        // Double check localStorage before redirecting
        if (!stored || isLoggedIn !== 'true') {
          console.log('🔒 Protected route: Redirecting to login');
          router.push(redirectTo);
        }
      }, 200); // Small delay to prevent premature redirects

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, requireAuth, redirectTo, router]);

  // Show loading state while auth is being determined
  if (requireAuth && !isAuthenticated) {
    // Check if we have localStorage data before showing login redirect
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (stored && isLoggedIn === 'true') {
        // User data exists in localStorage, show loading
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        );
      }
    }
    
    // No user data, will redirect to login
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
