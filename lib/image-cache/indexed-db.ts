/**
 * IndexedDB Image Cache Service
 * Provides efficient client-side caching for product images
 */

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  productId?: string;
}

interface ImageCacheConfig {
  dbName: string;
  version: number;
  storeName: string;
  maxAge: number; // Max age in milliseconds
  maxSize: number; // Max cache size in bytes
}

const DEFAULT_CONFIG: ImageCacheConfig = {
  dbName: 'MedicineWebsiteImageCache',
  version: 1,
  storeName: 'images',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxSize: 50 * 1024 * 1024, // 50MB
};

class ImageCacheService {
  private db: IDBDatabase | null = null;
  private config: ImageCacheConfig;
  private currentCacheSize: number = 0;
  private initPromise: Promise<void> | null = null;

  constructor(config: Partial<ImageCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize IndexedDB connection
   */
  private async init(): Promise<void> {
    if (this.db) return;
    
    // Return existing init promise if already initializing
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.calculateCacheSize().then(() => resolve());
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('productId', 'productId', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Calculate current cache size
   */
  private async calculateCacheSize(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.config.storeName], 'readonly');
    const store = transaction.objectStore(this.config.storeName);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const images = request.result as CachedImage[];
        this.currentCacheSize = images.reduce((total, img) => total + img.size, 0);
        resolve();
      };
    });
  }

  /**
   * Get cached image by URL
   */
  async get(url: string): Promise<Blob | null> {
    await this.init();
    if (!this.db) return null;

    const transaction = this.db.transaction([this.config.storeName], 'readonly');
    const store = transaction.objectStore(this.config.storeName);
    const request = store.get(url);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const cached = request.result as CachedImage | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        const age = Date.now() - cached.timestamp;
        if (age > this.config.maxAge) {
          // Remove expired cache
          this.delete(url);
          resolve(null);
          return;
        }

        resolve(cached.blob);
      };

      request.onerror = () => {
        console.error('Failed to get cached image:', request.error);
        resolve(null);
      };
    });
  }

  /**
   * Store image in cache
   */
  async set(url: string, blob: Blob, productId?: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const size = blob.size;

    // Check if adding this image would exceed max cache size
    if (this.currentCacheSize + size > this.config.maxSize) {
      await this.evictOldest(size);
    }

    const cachedImage: CachedImage = {
      url,
      blob,
      timestamp: Date.now(),
      size,
      productId,
    };

    const transaction = this.db.transaction([this.config.storeName], 'readwrite');
    const store = transaction.objectStore(this.config.storeName);
    const request = store.put(cachedImage);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        this.currentCacheSize += size;
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to cache image:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete cached image
   */
  async delete(url: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    // Get the size of the image being deleted
    const getTransaction = this.db.transaction([this.config.storeName], 'readonly');
    const getStore = getTransaction.objectStore(this.config.storeName);
    const getRequest = getStore.get(url);

    const size = await new Promise<number>((resolve) => {
      getRequest.onsuccess = () => {
        const cached = getRequest.result as CachedImage | undefined;
        resolve(cached?.size || 0);
      };
    });

    // Delete the image
    const deleteTransaction = this.db.transaction([this.config.storeName], 'readwrite');
    const deleteStore = deleteTransaction.objectStore(this.config.storeName);
    const deleteRequest = deleteStore.delete(url);

    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => {
        this.currentCacheSize -= size;
        resolve();
      };

      deleteRequest.onerror = () => {
        console.error('Failed to delete cached image:', deleteRequest.error);
        reject(deleteRequest.error);
      };
    });
  }

  /**
   * Evict oldest images to make room for new ones
   */
  private async evictOldest(requiredSpace: number): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.config.storeName], 'readwrite');
    const store = transaction.objectStore(this.config.storeName);
    const index = store.index('timestamp');
    const request = index.openCursor();

    let freedSpace = 0;
    const urlsToDelete: string[] = [];

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const cursor = request.result;
        
        if (cursor && freedSpace < requiredSpace) {
          const cached = cursor.value as CachedImage;
          urlsToDelete.push(cached.url);
          freedSpace += cached.size;
          cursor.continue();
        } else {
          // Delete the collected URLs
          Promise.all(urlsToDelete.map(url => this.delete(url)))
            .then(() => resolve());
        }
      };
    });
  }

  /**
   * Clear all cached images
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction([this.config.storeName], 'readwrite');
    const store = transaction.objectStore(this.config.storeName);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        this.currentCacheSize = 0;
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear cache:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    count: number;
    size: number;
    maxSize: number;
    usage: number; // Percentage
  }> {
    await this.init();
    if (!this.db) {
      return { count: 0, size: 0, maxSize: this.config.maxSize, usage: 0 };
    }

    const transaction = this.db.transaction([this.config.storeName], 'readonly');
    const store = transaction.objectStore(this.config.storeName);
    const countRequest = store.count();

    const count = await new Promise<number>((resolve) => {
      countRequest.onsuccess = () => resolve(countRequest.result);
    });

    return {
      count,
      size: this.currentCacheSize,
      maxSize: this.config.maxSize,
      usage: (this.currentCacheSize / this.config.maxSize) * 100,
    };
  }

  /**
   * Get all cached images for a product
   */
  async getProductImages(productId: string): Promise<CachedImage[]> {
    await this.init();
    if (!this.db) return [];

    const transaction = this.db.transaction([this.config.storeName], 'readonly');
    const store = transaction.objectStore(this.config.storeName);
    const index = store.index('productId');
    const request = index.getAll(productId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result as CachedImage[]);
      };

      request.onerror = () => {
        console.error('Failed to get product images:', request.error);
        resolve([]);
      };
    });
  }
}

// Export singleton instance
export const imageCache = new ImageCacheService();

// Export class for custom instances
export { ImageCacheService };
