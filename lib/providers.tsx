'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { queryClient } from './queryClient'
import type { User, Admin } from '@shared/schema'

interface AuthContextType {
  user: (User & { userType?: string }) | (Admin & { userType?: string }) | null;
  login: (user: any) => void;
  logout: () => void;
  updateUser: (updates: any) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check localStorage on mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        setIsHydrated(true);
        const stored = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (stored && isLoggedIn === 'true') {
          try {
            const userData = JSON.parse(stored);
            if (!user || user.id !== userData.id) {
              console.log('🔄 User session restored:', userData);
              setUser(userData);
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
          }
        } else if (user && isHydrated) {
          // Only clear user after hydration is complete
          console.log('⚠️ No valid session found, clearing user');
          setUser(null);
        }
      }
    };

    // Check on mount
    checkAuth();
    
    // Mark as initialized after hydration
    const initTimer = setTimeout(() => {
      setIsInitialized(true);
      setIsLoading(false);
    }, isHydrated ? 100 : 1000); // Faster if already hydrated

    return () => clearTimeout(initTimer);

    // Listen for storage changes (e.g., login in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'isLoggedIn') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const login = (userData: User) => {
    console.log('🔐 Login function called with:', userData);
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      console.log('✅ User logged in and stored in localStorage:', userData);
      
      // Verify storage was set
      const stored = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      console.log('🔍 Verification - Stored user:', stored);
      console.log('🔍 Verification - IsLoggedIn:', isLoggedIn);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      console.log('User logged out and localStorage cleared');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  const isAuthenticated = !!user && isInitialized;
  const isAdmin = !!(user && (user as any).userType === 'admin' && isInitialized);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
