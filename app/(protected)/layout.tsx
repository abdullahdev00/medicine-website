'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers";
import type { ReactNode } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    console.log('🔍 Protected Layout - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'isInitialized:', isInitialized);
    
    // Only redirect after auth is fully initialized
    if (isInitialized && !isLoading && !isAuthenticated) {
      console.log('❌ Auth initialized, not authenticated, redirecting to login');
      router.push("/login");
    } else if (isAuthenticated) {
      console.log('✅ User is authenticated, allowing access');
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  // Show loading while auth is being initialized
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show loading while redirecting
  if (isInitialized && !isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
