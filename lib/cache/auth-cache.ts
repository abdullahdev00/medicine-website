/**
 * Auth Cache - Secure authentication caching with auto-login support
 * Features: Encrypted storage, Token management, Session persistence
 */

import { cacheManager } from './cache-manager';
import { encryptionManager } from './encryption';
import type { User } from '@/shared/schema';

interface AuthData {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: number;
  rememberMe: boolean;
}

class AuthCache {
  private currentUser: User | null = null;
  private authToken: string | null = null;
  private tokenExpiry: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize auth cache with user credentials
   */
  async initialize(email: string, password: string): Promise<void> {
    // Initialize encryption with user credentials
    await encryptionManager.initialize(password, email);
  }

  /**
   * Store authenticated user
   */
  async storeAuth(
    user: User,
    token: string,
    refreshToken?: string,
    rememberMe: boolean = false
  ): Promise<void> {
    try {
      // Calculate token expiry (default 24 hours)
      const expiresAt = Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);

      const authData: AuthData = {
        user,
        token,
        refreshToken,
        expiresAt,
        rememberMe
      };

      // Store in cache with encryption
      await cacheManager.set('users', user.id, authData, {
        encrypt: true,
        priority: 'high',
        ttl: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
      });

      // Store token separately for quick access
      await cacheManager.set('metadata', 'auth_token', {
        token,
        expiresAt,
        userId: user.id
      }, {
        priority: 'high'
      });

      // Update memory cache
      this.currentUser = user;
      this.authToken = token;
      this.tokenExpiry = expiresAt;

      // Setup auto-refresh if refresh token provided
      if (refreshToken) {
        this.setupTokenRefresh(expiresAt);
      }

      console.log('Auth stored successfully');
    } catch (error) {
      console.error('Failed to store auth:', error);
      throw error;
    }
  }

  /**
   * Get current user from cache
   */
  async getCurrentUser(): Promise<User | null> {
    // Return from memory if available
    if (this.currentUser && Date.now() < this.tokenExpiry) {
      return this.currentUser;
    }

    try {
      // Try to get from cache
      const cached = await cacheManager.get<AuthData>('users', 'current', undefined, {
        encrypt: true
      });

      if (cached && Date.now() < cached.expiresAt) {
        this.currentUser = cached.user;
        this.authToken = cached.token;
        this.tokenExpiry = cached.expiresAt;

        // Setup refresh if needed
        if (cached.refreshToken) {
          this.setupTokenRefresh(cached.expiresAt);
        }

        return cached.user;
      }

      // Check for any cached user
      const users = await cacheManager.getAll<AuthData>('users', { encrypt: true });
      if (users.length > 0) {
        const validUser = users.find(u => Date.now() < u.expiresAt);
        if (validUser) {
          this.currentUser = validUser.user;
          this.authToken = validUser.token;
          this.tokenExpiry = validUser.expiresAt;
          return validUser.user;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get auth token
   */
  async getToken(): Promise<string | null> {
    // Return from memory if valid
    if (this.authToken && Date.now() < this.tokenExpiry) {
      return this.authToken;
    }

    try {
      // Get from cache
      const tokenData = await cacheManager.get<{
        token: string;
        expiresAt: number;
        userId: string;
      }>('metadata', 'auth_token');

      if (tokenData && Date.now() < tokenData.expiresAt) {
        this.authToken = tokenData.token;
        this.tokenExpiry = tokenData.expiresAt;
        return tokenData.token;
      }

      return null;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(user: User): Promise<void> {
    try {
      // Get existing auth data
      const existing = await cacheManager.get<AuthData>('users', user.id, undefined, {
        encrypt: true
      });

      if (existing) {
        existing.user = user;
        await cacheManager.set('users', user.id, existing, {
          encrypt: true,
          priority: 'high',
          syncStrategy: 'immediate'
        });

        // Update memory cache
        this.currentUser = user;
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Setup token refresh
   */
  private setupTokenRefresh(expiresAt: number): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Calculate when to refresh (5 minutes before expiry)
    const refreshTime = expiresAt - Date.now() - 5 * 60 * 1000;

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  /**
   * Refresh auth token
   */
  private async refreshToken(): Promise<void> {
    try {
      const cached = await cacheManager.get<AuthData>('users', this.currentUser?.id || '', undefined, {
        encrypt: true
      });

      if (!cached?.refreshToken) {
        console.log('No refresh token available');
        return;
      }

      // Call refresh API
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: cached.refreshToken })
      });

      if (response.ok) {
        const { token, refreshToken, expiresIn } = await response.json();
        
        // Update stored auth
        await this.storeAuth(
          cached.user,
          token,
          refreshToken,
          cached.rememberMe
        );

        console.log('Token refreshed successfully');
      } else {
        console.error('Token refresh failed');
        await this.logout();
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Auto-login from cache
   */
  async autoLogin(): Promise<User | null> {
    try {
      const user = await this.getCurrentUser();
      
      if (user) {
        console.log('Auto-login successful');
        
        // Verify token with server in background
        this.verifyTokenInBackground();
        
        return user;
      }

      return null;
    } catch (error) {
      console.error('Auto-login failed:', error);
      return null;
    }
  }

  /**
   * Verify token with server
   */
  private async verifyTokenInBackground(): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) return;

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.log('Token verification failed, clearing auth');
        await this.logout();
      }
    } catch (error) {
      console.error('Token verification error:', error);
    }
  }

  /**
   * Logout and clear cache
   */
  async logout(): Promise<void> {
    try {
      // Clear memory
      this.currentUser = null;
      this.authToken = null;
      this.tokenExpiry = 0;

      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Clear encryption keys
      encryptionManager.clearKeys();

      // Clear cached data
      await cacheManager.clear('users');
      await cacheManager.delete('metadata', 'auth_token');

      // Clear other user-specific data
      await cacheManager.clear('cart');
      await cacheManager.clear('wishlist');
      await cacheManager.clear('addresses');
      await cacheManager.clear('orders');

      console.log('Logged out and cache cleared');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<any> {
    try {
      return await cacheManager.get('metadata', 'user_preferences') || {};
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return {};
    }
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: any): Promise<void> {
    try {
      await cacheManager.set('metadata', 'user_preferences', preferences, {
        priority: 'high'
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Handle session expiry
   */
  async handleSessionExpiry(): Promise<void> {
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Expired', {
        body: 'Your session has expired. Please login again.',
        icon: '/icon-192.png'
      });
    }

    // Clear auth
    await this.logout();

    // Redirect to login
    window.location.href = '/login';
  }
}

// Export singleton instance
export const authCache = new AuthCache();
export default authCache;
