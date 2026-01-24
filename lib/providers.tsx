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
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Fast auth check on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;
      
      console.log('🚀 Auth: Starting initialization');
      setIsHydrated(true);
      
      try {
        // Immediate localStorage check
        const stored = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (stored && isLoggedIn === 'true') {
          const userData = JSON.parse(stored);
          console.log('✅ Auth: Session restored from localStorage:', userData.email);
          setUser(userData);
          setAuthChecked(true);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        
        // No valid session found
        console.log('❌ Auth: No valid session found');
        setUser(null);
        setAuthChecked(true);
        setIsInitialized(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ Auth: Error during initialization:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        setUser(null);
        setAuthChecked(true);
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    if (!isHydrated) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'isLoggedIn') {
        console.log('🔄 Auth: Storage changed, re-checking auth');
        const stored = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (stored && isLoggedIn === 'true') {
          try {
            const userData = JSON.parse(stored);
            setUser(userData);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isHydrated]);

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

  const isAuthenticated = !!user && isInitialized && authChecked;
  const isAdmin = !!(user && (user as any).userType === 'admin' && isInitialized && authChecked);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated, isAdmin, isLoading, isInitialized }}>
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
