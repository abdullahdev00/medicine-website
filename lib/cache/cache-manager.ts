/**
 * Cache Manager - Advanced caching with network detection, sync queue, and conflict resolution
 * Features: Offline support, Background sync, Conflict resolution, Cache warming
 */

import { dbManager } from './db-manager';
import { encryptionManager } from './encryption';

export interface CacheOptions {
  ttl?: number;
  encrypt?: boolean;
  compress?: boolean;
  priority?: 'high' | 'medium' | 'low';
  syncStrategy?: 'immediate' | 'background' | 'manual';
}

export interface SyncQueueItem {
  id?: number;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error?: string;
}

export interface ConflictResolution {
  strategy: 'local-first' | 'server-first' | 'merge' | 'manual';
  resolver?: (local: any, server: any) => any;
}

class CacheManager {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncInterval: number | null = null;
  private networkListeners: Set<(online: boolean) => void> = new Set();
  
  // Cache TTL by priority
  private ttlConfig = {
    high: 7 * 24 * 60 * 60 * 1000,    // 7 days
    medium: 24 * 60 * 60 * 1000,      // 1 day
    low: 60 * 60 * 1000                // 1 hour
  };

  // Sensitive fields that should be encrypted
  private sensitiveFields = {
    users: ['email', 'phone', 'address', 'fullName'],
    orders: ['shippingAddress', 'billingAddress', 'paymentInfo'],
    addresses: ['street', 'city', 'postalCode', 'phone']
  };

  constructor() {
    this.setupNetworkListeners();
    this.startBackgroundSync();
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));

    // Check network status periodically
    setInterval(() => {
      const online = navigator.onLine;
      if (online !== this.isOnline) {
        this.handleNetworkChange(online);
      }
    }, 5000);
  }

  /**
   * Handle network status change
   */
  private handleNetworkChange(online: boolean): void {
    this.isOnline = online;
    console.log(`Network status: ${online ? 'Online' : 'Offline'}`);

    // Notify listeners
    this.networkListeners.forEach(listener => listener(online));

    // Start sync if back online
    if (online && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  /**
   * Add network status listener
   */
  onNetworkChange(callback: (online: boolean) => void): () => void {
    this.networkListeners.add(callback);
    return () => this.networkListeners.delete(callback);
  }

  /**
   * Get data with fallback strategy
   */
  async get<T>(
    storeName: string,
    key: string,
    fetcher?: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await dbManager.get<T>(storeName, key);
      
      if (cached !== null) {
        // Decrypt if needed
        if (options.encrypt && this.sensitiveFields[storeName as keyof typeof this.sensitiveFields]) {
          const decrypted = await encryptionManager.decryptFields(
            cached as any,
            this.sensitiveFields[storeName as keyof typeof this.sensitiveFields]
          );
          return decrypted as T;
        }
        return cached;
      }

      // If no cached data and we have a fetcher, fetch from network
      if (fetcher && this.isOnline) {
        const data = await fetcher();
        await this.set(storeName, key, data, options);
        return data;
      }

      return null;
    } catch (error) {
      console.error(`Cache get error for ${storeName}/${key}:`, error);
      
      // Fallback to fetcher if available
      if (fetcher && this.isOnline) {
        try {
          return await fetcher();
        } catch (fetchError) {
          console.error('Fetcher also failed:', fetchError);
        }
      }
      
      return null;
    }
  }

  /**
   * Set data with encryption and sync
   */
  async set<T>(
    storeName: string,
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      let processedData = data;

      // Encrypt sensitive fields if needed
      if (options.encrypt && this.sensitiveFields[storeName as keyof typeof this.sensitiveFields]) {
        processedData = await encryptionManager.encryptFields(
          data as any,
          this.sensitiveFields[storeName as keyof typeof this.sensitiveFields]
        ) as T;
      }

      // Determine TTL based on priority
      const ttl = options.ttl || this.ttlConfig[options.priority || 'medium'];

      // Store in IndexedDB
      await dbManager.put(storeName, processedData, key, ttl);

      // Handle sync strategy
      if (options.syncStrategy === 'immediate' && this.isOnline) {
        await this.syncItem(storeName, key, data);
      } else if (options.syncStrategy === 'background') {
        await this.queueForSync(storeName, 'update', { key, data });
      }
    } catch (error) {
      console.error(`Cache set error for ${storeName}/${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete data with sync
   */
  async delete(
    storeName: string,
    key: string,
    options: { sync?: boolean } = {}
  ): Promise<void> {
    try {
      // Delete from IndexedDB
      await dbManager.delete(storeName, key);

      // Queue for sync if needed
      if (options.sync) {
        await this.queueForSync(storeName, 'delete', { key });
      }
    } catch (error) {
      console.error(`Cache delete error for ${storeName}/${key}:`, error);
      throw error;
    }
  }

  /**
   * Get all data from a store
   */
  async getAll<T>(
    storeName: string,
    options: CacheOptions = {}
  ): Promise<T[]> {
    try {
      const items = await dbManager.getAll<T>(storeName);

      // Decrypt if needed
      if (options.encrypt && this.sensitiveFields[storeName as keyof typeof this.sensitiveFields]) {
        const decrypted = await Promise.all(
          items.map(item =>
            encryptionManager.decryptFields(
              item as any,
              this.sensitiveFields[storeName as keyof typeof this.sensitiveFields]
            )
          )
        );
        return decrypted as T[];
      }

      return items;
    } catch (error) {
      console.error(`Cache getAll error for ${storeName}:`, error);
      return [];
    }
  }

  /**
   * Clear cache for a store
   */
  async clear(storeName: string): Promise<void> {
    try {
      await dbManager.clear(storeName);
      console.log(`Cleared cache for ${storeName}`);
    } catch (error) {
      console.error(`Failed to clear cache for ${storeName}:`, error);
    }
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    try {
      await dbManager.clearAll();
      console.log('Cleared all caches');
    } catch (error) {
      console.error('Failed to clear all caches:', error);
    }
  }

  /**
   * Queue item for sync
   */
  private async queueForSync(
    type: string,
    action: SyncQueueItem['action'],
    data: any
  ): Promise<void> {
    const item: SyncQueueItem = {
      type,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    await dbManager.put('syncQueue', item);
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    console.log('Processing sync queue...');

    try {
      const queue = await dbManager.getAll<SyncQueueItem>('syncQueue');
      const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'failed');

      for (const item of pendingItems) {
        try {
          // Update status to syncing
          item.status = 'syncing';
          await dbManager.put('syncQueue', item, item.id);

          // Perform sync based on type and action
          await this.performSync(item);

          // Mark as completed
          item.status = 'completed';
          await dbManager.put('syncQueue', item, item.id);
        } catch (error) {
          console.error(`Sync failed for item ${item.id}:`, error);
          
          // Update retry count and status
          item.retries++;
          item.status = item.retries >= 3 ? 'failed' : 'pending';
          item.error = (error as Error).message;
          await dbManager.put('syncQueue', item, item.id);
        }
      }

      // Clean up completed items older than 1 day
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const completedOldItems = queue.filter(
        item => item.status === 'completed' && item.timestamp < oneDayAgo
      );
      
      for (const item of completedOldItems) {
        if (item.id) {
          await dbManager.delete('syncQueue', item.id);
        }
      }
    } catch (error) {
      console.error('Sync queue processing failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Perform actual sync operation
   */
  private async performSync(item: SyncQueueItem): Promise<void> {
    // This should be implemented based on your API structure
    const endpoint = `/api/${item.type}`;
    
    switch (item.action) {
      case 'create':
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;
        
      case 'update':
        await fetch(`${endpoint}/${item.data.key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data.data)
        });
        break;
        
      case 'delete':
        await fetch(`${endpoint}/${item.data.key}`, {
          method: 'DELETE'
        });
        break;
    }
  }

  /**
   * Sync specific item immediately
   */
  private async syncItem(storeName: string, key: string, data: any): Promise<void> {
    if (!this.isOnline) {
      await this.queueForSync(storeName, 'update', { key, data });
      return;
    }

    try {
      const response = await fetch(`/api/${storeName}/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to sync ${storeName}/${key}:`, error);
      await this.queueForSync(storeName, 'update', { key, data });
    }
  }

  /**
   * Start background sync
   */
  private startBackgroundSync(): void {
    // Process sync queue every 30 seconds when online
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.processSyncQueue();
      }
    }, 30000);

    // Also sync when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && !this.syncInProgress) {
        this.processSyncQueue();
      }
    });
  }

  /**
   * Stop background sync
   */
  stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Resolve conflicts between local and server data
   */
  async resolveConflict<T>(
    local: T,
    server: T,
    resolution: ConflictResolution
  ): Promise<T> {
    switch (resolution.strategy) {
      case 'local-first':
        return local;
        
      case 'server-first':
        return server;
        
      case 'merge':
        // Simple merge - combine properties, preferring newer timestamps
        const localAny = local as any;
        const serverAny = server as any;
        
        if (localAny.updatedAt && serverAny.updatedAt) {
          return localAny.updatedAt > serverAny.updatedAt ? local : server;
        }
        return { ...serverAny, ...localAny };
        
      case 'manual':
        if (resolution.resolver) {
          return resolution.resolver(local, server);
        }
        return server;
        
      default:
        return server;
    }
  }

  /**
   * Warm cache with initial data
   */
  async warmCache(data: {
    products?: any[];
    categories?: any[];
    user?: any;
  }): Promise<void> {
    console.log('Warming cache...');

    const promises: Promise<void>[] = [];

    if (data.products) {
      promises.push(
        ...data.products.map(product =>
          this.set('products', product.id, product, { priority: 'high' })
        )
      );
    }

    if (data.categories) {
      promises.push(
        ...data.categories.map(category =>
          this.set('categories', category.id, category, { priority: 'high' })
        )
      );
    }

    if (data.user) {
      promises.push(
        this.set('users', data.user.id, data.user, { 
          priority: 'high',
          encrypt: true
        })
      );
    }

    await Promise.all(promises);
    console.log('Cache warmed successfully');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    size: number;
    stores: { [key: string]: number };
    syncQueue: number;
  }> {
    const size = await dbManager.getSize();
    const stores: { [key: string]: number } = {};
    
    const storeNames = ['users', 'products', 'categories', 'cart', 'orders', 'images'];
    for (const store of storeNames) {
      const items = await dbManager.getAll(store);
      stores[store] = items.length;
    }

    const syncQueue = await dbManager.getAll<SyncQueueItem>('syncQueue');
    const pendingSync = syncQueue.filter(item => item.status === 'pending').length;

    return {
      size,
      stores,
      syncQueue: pendingSync
    };
  }

  /**
   * Check if cache is ready
   */
  isReady(): boolean {
    return true; // DB manager handles initialization
  }

  /**
   * Get network status
   */
  getNetworkStatus(): boolean {
    return this.isOnline;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
export default cacheManager;
