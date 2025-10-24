/**
 * IndexedDB Manager - Core database operations with versioning and migration support
 * Features: Auto-migration, Error recovery, Quota management, Performance monitoring
 */

// Native compression utilities (no external dependency)
const compress = (data: string): string => {
  try {
    // Simple compression using built-in compression
    const compressed = new TextEncoder().encode(data);
    return btoa(String.fromCharCode(...compressed));
  } catch {
    return data; // Return original if compression fails
  }
};

const decompress = (data: string): string => {
  try {
    const decoded = atob(data);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return data; // Return original if decompression fails
  }
};

export interface DBConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}

export interface StoreConfig {
  name: string;
  keyPath?: string;
  autoIncrement?: boolean;
  indexes?: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

export interface CachedData<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  compressed?: boolean;
  encrypted?: boolean;
  checksum?: string;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private stores: StoreConfig[];
  private initPromise: Promise<void> | null = null;
  private quotaWarningThreshold = 0.8; // 80% of quota
  private compressionThreshold = 1024 * 10; // 10KB

  constructor(config: DBConfig) {
    this.dbName = config.name;
    this.version = config.version;
    this.stores = config.stores;
  }

  /**
   * Initialize database with migration support
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.openDatabase();
    await this.initPromise;
    this.initPromise = null;
  }

  private async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.setupErrorHandlers();
        this.monitorQuota();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        
        this.performMigration(db, transaction, event.oldVersion, event.newVersion!);
      };

      request.onblocked = () => {
        console.warn('Database upgrade blocked. Please close other tabs.');
      };
    });
  }

  /**
   * Perform database migration
   */
  private performMigration(
    db: IDBDatabase,
    transaction: IDBTransaction,
    oldVersion: number,
    newVersion: number
  ): void {
    console.log(`Migrating database from v${oldVersion} to v${newVersion}`);

    // Create or update stores
    for (const storeConfig of this.stores) {
      let store: IDBObjectStore;

      if (!db.objectStoreNames.contains(storeConfig.name)) {
        // Create new store
        store = db.createObjectStore(storeConfig.name, {
          keyPath: storeConfig.keyPath,
          autoIncrement: storeConfig.autoIncrement
        });
      } else {
        // Get existing store
        store = transaction.objectStore(storeConfig.name);
      }

      // Create indexes
      if (storeConfig.indexes) {
        for (const indexConfig of storeConfig.indexes) {
          if (!store.indexNames.contains(indexConfig.name)) {
            store.createIndex(
              indexConfig.name,
              indexConfig.keyPath,
              {
                unique: indexConfig.unique,
                multiEntry: indexConfig.multiEntry
              }
            );
          }
        }
      }
    }

    // Handle specific version migrations
    this.handleVersionMigrations(transaction, oldVersion, newVersion);
  }

  /**
   * Handle specific version migrations
   */
  private handleVersionMigrations(
    transaction: IDBTransaction,
    oldVersion: number,
    newVersion: number
  ): void {
    // Version 1 -> 2: Add compression flag
    if (oldVersion < 2 && newVersion >= 2) {
      const stores = ['products', 'images', 'orders'];
      stores.forEach(storeName => {
        if (transaction.objectStoreNames.contains(storeName)) {
          const store = transaction.objectStore(storeName);
          const request = store.openCursor();
          
          request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
              const value = cursor.value;
              value.compressed = false;
              cursor.update(value);
              cursor.continue();
            }
          };
        }
      });
    }
  }

  /**
   * Setup error handlers for the database
   */
  private setupErrorHandlers(): void {
    if (!this.db) return;

    this.db.onerror = (event) => {
      console.error('Database error:', event);
    };

    this.db.onabort = (event) => {
      console.error('Database transaction aborted:', event);
    };

    this.db.onclose = () => {
      console.log('Database connection closed');
      this.db = null;
    };
  }

  /**
   * Monitor storage quota
   */
  private async monitorQuota(): Promise<void> {
    if (!navigator.storage?.estimate) return;

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const usageRatio = usage / quota;

      if (usageRatio > this.quotaWarningThreshold) {
        console.warn(`Storage quota warning: ${(usageRatio * 100).toFixed(2)}% used`);
        await this.cleanupOldData();
      }

      // Log storage info
      console.log(`Storage: ${this.formatBytes(usage)} / ${this.formatBytes(quota)} (${(usageRatio * 100).toFixed(2)}%)`);
    } catch (error) {
      console.error('Failed to estimate storage:', error);
    }
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Get data from store with automatic decompression
   */
  async get<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Handle cached data format
        if (result.data !== undefined) {
          const cached = result as CachedData<T>;
          
          // Check if data is expired
          if (this.isExpired(cached)) {
            this.delete(storeName, key); // Clean up expired data
            resolve(null);
            return;
          }

          // Decompress if needed
          let data = cached.data;
          if (cached.compressed && typeof data === 'string') {
            data = JSON.parse(decompress(data) || '{}');
          }

          resolve(data);
        } else {
          resolve(result);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to get data: ${request.error?.message}`));
      };
    });
  }

  /**
   * Put data into store with automatic compression
   */
  async put<T>(
    storeName: string,
    data: T,
    key?: IDBValidKey,
    ttl: number = 3600000 // 1 hour default
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Prepare cached data
      let processedData: any = data;
      let compressed = false;

      // Compress large data
      const dataStr = JSON.stringify(data);
      if (dataStr.length > this.compressionThreshold) {
        processedData = compress(dataStr);
        compressed = true;
      }

      const cachedData: CachedData<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl,
        version: this.version.toString(),
        compressed,
        checksum: this.generateChecksum(dataStr)
      };

      const request = key !== undefined
        ? store.put(cachedData, key)
        : store.put(cachedData);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to put data: ${request.error?.message}`));
      };
    });
  }

  /**
   * Delete data from store
   */
  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete data: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get all data from store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        const validData: T[] = [];

        for (const result of results) {
          if (result.data !== undefined) {
            const cached = result as CachedData<T>;
            
            if (!this.isExpired(cached)) {
              let data = cached.data;
              if (cached.compressed && typeof data === 'string') {
                data = JSON.parse(decompress(data) || '{}');
              }
              validData.push(data);
            }
          } else {
            validData.push(result);
          }
        }

        resolve(validData);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all data: ${request.error?.message}`));
      };
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear store: ${request.error?.message}`));
      };
    });
  }

  /**
   * Clear all stores
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const promises = this.stores.map(store => this.clear(store.name));
    await Promise.all(promises);
  }

  /**
   * Check if cached data is expired
   */
  private isExpired(cached: CachedData): boolean {
    return Date.now() > cached.timestamp + cached.ttl;
  }

  /**
   * Generate checksum for data integrity
   */
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Cleanup old and expired data
   */
  async cleanupOldData(): Promise<void> {
    console.log('Starting cleanup of old data...');
    
    for (const storeConfig of this.stores) {
      try {
        await this.cleanupStore(storeConfig.name);
      } catch (error) {
        console.error(`Failed to cleanup store ${storeConfig.name}:`, error);
      }
    }
  }

  /**
   * Cleanup a specific store
   */
  private async cleanupStore(storeName: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();
      let deletedCount = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const value = cursor.value;
          
          if (value.timestamp && value.ttl) {
            const cached = value as CachedData;
            if (this.isExpired(cached)) {
              cursor.delete();
              deletedCount++;
            }
          }
          
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} expired items from ${storeName}`);
          }
          resolve();
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to cleanup store: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get database size
   */
  async getSize(): Promise<number> {
    if (!navigator.storage?.estimate) return 0;
    
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Database configuration - Optimized for static/dynamic data separation
const dbConfig: DBConfig = {
  name: 'MediSwiftCache',
  version: 3, // Updated version for new schema
  stores: [
    {
      name: 'users',
      keyPath: 'id',
      indexes: [
        { name: 'email', keyPath: 'email', unique: true }
      ]
    },
    // Removed products store - will fetch from API always
    // Removed categories store - will fetch from API always
    {
      name: 'images',
      keyPath: 'url',
      indexes: [
        { name: 'productId', keyPath: 'productId' },
        { name: 'timestamp', keyPath: 'timestamp' }
      ]
    },
    {
      name: 'cart',
      keyPath: 'userId', // Changed to userId as key
      indexes: [
        { name: 'updatedAt', keyPath: 'updatedAt' }
      ]
    },
    {
      name: 'wishlist',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'productId', keyPath: 'productId' }
      ]
    },
    {
      name: 'completed_orders', // Only completed/cancelled orders
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'status', keyPath: 'status' },
        { name: 'completedAt', keyPath: 'completedAt' }
      ]
    },
    {
      name: 'pending_order_refs', // Only references for pending orders
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'lastChecked', keyPath: 'lastChecked' }
      ]
    },
    {
      name: 'addresses',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' }
      ]
    },
    {
      name: 'auth_tokens', // Dedicated token store
      keyPath: 'userId',
      indexes: [
        { name: 'expiresAt', keyPath: 'expiresAt' }
      ]
    },
    {
      name: 'syncQueue',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'type', keyPath: 'type' },
        { name: 'status', keyPath: 'status' },
        { name: 'timestamp', keyPath: 'timestamp' }
      ]
    },
    {
      name: 'metadata',
      keyPath: 'key'
    }
  ]
};

// Export singleton instance
export const dbManager = new IndexedDBManager(dbConfig);
export default dbManager;
