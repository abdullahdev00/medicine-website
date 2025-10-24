/**
 * Token Manager - Secure token storage and management in IndexedDB
 * Features: Auto-refresh, Secure storage, Session persistence, Multi-device sync
 */

import { dbManager } from './db-manager';
import { encryptionManager } from './encryption';

export interface TokenData {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
  tokenType: 'Bearer';
  scope: string[];
  deviceId: string;
  lastRefresh: number;
  rememberMe: boolean;
}

class TokenManager {
  private currentToken: TokenData | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private refreshPromise: Promise<TokenData | null> | null = null;

  /**
   * Store token in IndexedDB
   */
  async storeToken(tokenData: Partial<TokenData>): Promise<void> {
    try {
      const deviceId = await this.getDeviceId();
      
      const fullTokenData: TokenData = {
        userId: tokenData.userId!,
        accessToken: tokenData.accessToken!,
        refreshToken: tokenData.refreshToken!,
        expiresAt: tokenData.expiresAt || (Date.now() + 60 * 60 * 1000), // 1 hour default
        refreshExpiresAt: tokenData.refreshExpiresAt || (Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        tokenType: 'Bearer',
        scope: tokenData.scope || ['read', 'write'],
        deviceId,
        lastRefresh: Date.now(),
        rememberMe: tokenData.rememberMe || false
      };

      // Encrypt sensitive token data
      const encryptedData = await encryptionManager.encryptFields(fullTokenData, [
        'accessToken',
        'refreshToken'
      ]);

      // Store in IndexedDB
      await dbManager.put(
        'auth_tokens',
        encryptedData,
        tokenData.userId!,
        fullTokenData.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 1 day
      );

      // Update memory cache
      this.currentToken = fullTokenData;

      // Setup auto-refresh
      this.setupAutoRefresh(fullTokenData);

      console.log('Token stored successfully');
    } catch (error) {
      console.error('Failed to store token:', error);
      throw error;
    }
  }

  /**
   * Get current valid token
   */
  async getToken(userId?: string): Promise<string | null> {
    try {
      // Return from memory if valid
      if (this.currentToken && this.isTokenValid(this.currentToken)) {
        return this.currentToken.accessToken;
      }

      // Try to get from IndexedDB
      if (userId) {
        const stored = await this.getStoredToken(userId);
        if (stored && this.isTokenValid(stored)) {
          this.currentToken = stored;
          this.setupAutoRefresh(stored);
          return stored.accessToken;
        }

        // Try to refresh if refresh token is valid
        if (stored && this.isRefreshTokenValid(stored)) {
          const refreshed = await this.refreshToken(stored);
          if (refreshed) {
            return refreshed.accessToken;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  /**
   * Get stored token from IndexedDB
   */
  private async getStoredToken(userId: string): Promise<TokenData | null> {
    try {
      const encrypted = await dbManager.get<TokenData>('auth_tokens', userId);
      if (!encrypted) return null;

      // Decrypt sensitive fields
      const decrypted = await encryptionManager.decryptFields(encrypted, [
        'accessToken',
        'refreshToken'
      ]);

      return decrypted;
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  /**
   * Check if access token is valid
   */
  private isTokenValid(tokenData: TokenData): boolean {
    return Date.now() < tokenData.expiresAt - 60000; // 1 minute buffer
  }

  /**
   * Check if refresh token is valid
   */
  private isRefreshTokenValid(tokenData: TokenData): boolean {
    return Date.now() < tokenData.refreshExpiresAt;
  }

  /**
   * Refresh access token
   */
  async refreshToken(tokenData?: TokenData): Promise<TokenData | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const currentTokenData = tokenData || this.currentToken;
    if (!currentTokenData || !this.isRefreshTokenValid(currentTokenData)) {
      console.log('No valid refresh token available');
      return null;
    }

    this.refreshPromise = this.performTokenRefresh(currentTokenData);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  private async performTokenRefresh(tokenData: TokenData): Promise<TokenData | null> {
    try {
      console.log('Refreshing access token...');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: tokenData.refreshToken,
          deviceId: tokenData.deviceId
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const refreshData = await response.json();

      // Update token data
      const newTokenData: TokenData = {
        ...tokenData,
        accessToken: refreshData.accessToken,
        refreshToken: refreshData.refreshToken || tokenData.refreshToken,
        expiresAt: Date.now() + (refreshData.expiresIn * 1000),
        refreshExpiresAt: refreshData.refreshExpiresIn 
          ? Date.now() + (refreshData.refreshExpiresIn * 1000)
          : tokenData.refreshExpiresAt,
        lastRefresh: Date.now()
      };

      // Store updated token
      await this.storeToken(newTokenData);

      console.log('Token refreshed successfully');
      return newTokenData;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear invalid token
      await this.clearToken(tokenData.userId);
      
      return null;
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupAutoRefresh(tokenData: TokenData): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Calculate when to refresh (5 minutes before expiry)
    const refreshTime = tokenData.expiresAt - Date.now() - 5 * 60 * 1000;

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken(tokenData).catch(error => {
          console.error('Auto-refresh failed:', error);
        });
      }, refreshTime);

      console.log(`Auto-refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
    }
  }

  /**
   * Get or generate device ID
   */
  private async getDeviceId(): Promise<string> {
    try {
      // Try to get existing device ID
      const stored = await dbManager.get<{ deviceId: string }>('metadata', 'device_id');
      if (stored?.deviceId) {
        return stored.deviceId;
      }

      // Generate new device ID
      const deviceId = this.generateDeviceId();
      
      // Store device ID
      await dbManager.put('metadata', { deviceId }, 'device_id', 365 * 24 * 60 * 60 * 1000); // 1 year

      return deviceId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return this.generateDeviceId();
    }
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    const userAgent = navigator.userAgent.replace(/\s+/g, '').substr(0, 10);
    
    return `${timestamp}-${random}-${btoa(userAgent).substr(0, 8)}`;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(userId?: string): Promise<boolean> {
    const token = await this.getToken(userId);
    return token !== null;
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(): number | null {
    return this.currentToken?.expiresAt || null;
  }

  /**
   * Get time until token expires
   */
  getTimeUntilExpiry(): number | null {
    if (!this.currentToken) return null;
    return Math.max(0, this.currentToken.expiresAt - Date.now());
  }

  /**
   * Clear token for user
   */
  async clearToken(userId: string): Promise<void> {
    try {
      // Clear from IndexedDB
      await dbManager.delete('auth_tokens', userId);

      // Clear memory cache if it's the same user
      if (this.currentToken?.userId === userId) {
        this.currentToken = null;
      }

      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      console.log('Token cleared for user:', userId);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  /**
   * Clear all tokens
   */
  async clearAllTokens(): Promise<void> {
    try {
      await dbManager.clear('auth_tokens');
      this.currentToken = null;
      
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      console.log('All tokens cleared');
    } catch (error) {
      console.error('Failed to clear all tokens:', error);
    }
  }

  /**
   * Get all stored tokens (for admin/debugging)
   */
  async getAllTokens(): Promise<TokenData[]> {
    try {
      const tokens = await dbManager.getAll<TokenData>('auth_tokens');
      
      // Decrypt tokens
      const decrypted = await Promise.all(
        tokens.map(token => 
          encryptionManager.decryptFields(token, ['accessToken', 'refreshToken'])
        )
      );

      return decrypted;
    } catch (error) {
      console.error('Failed to get all tokens:', error);
      return [];
    }
  }

  /**
   * Get token statistics
   */
  async getStats(): Promise<{
    totalTokens: number;
    validTokens: number;
    expiredTokens: number;
    currentUser: string | null;
  }> {
    try {
      const tokens = await this.getAllTokens();
      const now = Date.now();

      const validTokens = tokens.filter(t => t.expiresAt > now);
      const expiredTokens = tokens.filter(t => t.expiresAt <= now);

      return {
        totalTokens: tokens.length,
        validTokens: validTokens.length,
        expiredTokens: expiredTokens.length,
        currentUser: this.currentToken?.userId || null
      };
    } catch (error) {
      console.error('Failed to get token stats:', error);
      return {
        totalTokens: 0,
        validTokens: 0,
        expiredTokens: 0,
        currentUser: null
      };
    }
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
export default tokenManager;
