/**
 * Cache System - Main entry point and initialization
 * Features: Auto-initialization, Service worker integration, Performance monitoring
 */

import { dbManager } from './db-manager';
import { encryptionManager } from './encryption';
import { cacheManager } from './cache-manager';
import { imageCacheManager } from './image-cache';
import { authCache } from './auth-cache';
import { productCache } from './product-cache';
import { cartCache } from './cart-cache';

export interface CacheConfig {
  enableEncryption?: boolean;
  enableCompression?: boolean;
  enableOffline?: boolean;
  enableBackgroundSync?: boolean;
  maxCacheSize?: number;
  syncInterval?: number;
}

class CacheSystem {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private config: CacheConfig = {
    enableEncryption: true,
    enableCompression: true,
    enableOffline: true,
    enableBackgroundSync: true,
    maxCacheSize: 200 * 1024 * 1024, // 200MB
    syncInterval: 30000 // 30 seconds
  };

  /**
   * Initialize cache system
   */
  async initialize(config?: CacheConfig): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.performInitialization(config);
    await this.initPromise;
    this.initPromise = null;
  }

  private async performInitialization(config?: CacheConfig): Promise<void> {
    console.log('🚀 Initializing cache system...');

    // Merge config
    if (config) {
      this.config = { ...this.config, ...config };
    }

    try {
      // Initialize database
      await dbManager.init();
      console.log('✅ Database initialized');

      // Check for existing auth
      const user = await authCache.getCurrentUser();
      if (user) {
        console.log('✅ User session restored');
      }

      // Setup service worker if available
      if ('serviceWorker' in navigator && this.config.enableOffline) {
        await this.setupServiceWorker();
      }

      // Setup periodic cleanup
      this.setupPeriodicCleanup();

      // Monitor performance
      this.setupPerformanceMonitoring();

      // Warm cache with initial data
      if (navigator.onLine) {
        this.warmCache();
      }

      this.initialized = true;
      console.log('✅ Cache system initialized successfully');
    } catch (error) {
      console.error('❌ Cache initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup service worker
   */
  private async setupServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ Service worker registered:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('✅ Service worker updated');
              // Clear old cache
              this.clearOldCache();
            }
          });
        }
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated by service worker');
        break;
      case 'OFFLINE_MODE':
        console.log('Entering offline mode');
        break;
      case 'SYNC_REQUIRED':
        cacheManager.processSyncQueue();
        break;
    }
  }

  /**
   * Setup periodic cleanup
   */
  private setupPeriodicCleanup(): void {
    // Run cleanup every hour
    setInterval(async () => {
      try {
        console.log('🧹 Running periodic cleanup...');
        
        // Clean old data
        await dbManager.cleanupOldData();
        
        // Clean old images
        await imageCacheManager.cleanupOldImages();
        
        // Check storage quota
        await this.checkStorageQuota();
        
        console.log('✅ Cleanup completed');
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!window.performance || !window.PerformanceObserver) return;

    // Monitor cache performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('cache')) {
          console.log(`Cache operation: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          
          // Log slow operations
          if (entry.duration > 100) {
            console.warn(`Slow cache operation detected: ${entry.name}`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
  }

  /**
   * Warm cache with initial data
   */
  private async warmCache(): Promise<void> {
    console.log('🔥 Warming cache...');

    try {
      // Warm product cache in background
      setTimeout(() => {
        productCache.warmCache().catch(console.error);
      }, 1000);

      // Preload common images
      setTimeout(() => {
        const commonImages = [
          '/images/logo.png',
          '/images/placeholder.svg'
        ];
        imageCacheManager.preloadImages(commonImages).catch(console.error);
      }, 2000);
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  /**
   * Check storage quota
   */
  private async checkStorageQuota(): Promise<void> {
    if (!navigator.storage?.estimate) return;

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = (usage / quota) * 100;

      console.log(`📊 Storage: ${(usage / 1024 / 1024).toFixed(2)}MB / ${(quota / 1024 / 1024).toFixed(2)}MB (${percentage.toFixed(2)}%)`);

      // Warn if approaching limit
      if (percentage > 80) {
        console.warn('⚠️ Storage quota warning: Over 80% used');
        
        // Request persistent storage if not already granted
        if (navigator.storage.persist) {
          const isPersisted = await navigator.storage.persisted();
          if (!isPersisted) {
            const granted = await navigator.storage.persist();
            if (granted) {
              console.log('✅ Persistent storage granted');
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error);
    }
  }

  /**
   * Clear old cache (for updates)
   */
  private async clearOldCache(): Promise<void> {
    try {
      // Clear old service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => !name.includes('v2'));
        
        for (const cacheName of oldCaches) {
          await caches.delete(cacheName);
          console.log(`Deleted old cache: ${cacheName}`);
        }
      }
    } catch (error) {
      console.error('Failed to clear old cache:', error);
    }
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    try {
      console.log('🗑️ Clearing all caches...');

      // Clear IndexedDB
      await cacheManager.clearAll();

      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
      }

      // Clear session storage
      sessionStorage.clear();

      console.log('✅ All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getStatistics(): Promise<any> {
    const stats = {
      initialized: this.initialized,
      config: this.config,
      storage: null as any,
      caches: null as any,
      performance: null as any
    };

    try {
      // Get storage stats
      if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate();
        stats.storage = {
          usage: estimate.usage,
          quota: estimate.quota,
          percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
        };
      }

      // Get cache stats
      stats.caches = await cacheManager.getStats();

      // Get performance metrics
      if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        stats.performance = {
          pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart,
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
          cacheHitRate: 0 // Would need to track this
        };
      }
    } catch (error) {
      console.error('Failed to get statistics:', error);
    }

    return stats;
  }

  /**
   * Export cache data (for debugging)
   */
  async exportData(): Promise<any> {
    try {
      const data = {
        timestamp: Date.now(),
        version: '1.0.0',
        products: await cacheManager.getAll('products'),
        categories: await cacheManager.getAll('categories'),
        cart: await cacheManager.getAll('cart'),
        metadata: await cacheManager.getAll('metadata')
      };

      return data;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import cache data (for debugging)
   */
  async importData(data: any): Promise<void> {
    try {
      console.log('📥 Importing cache data...');

      // Validate data
      if (!data.version || !data.timestamp) {
        throw new Error('Invalid data format');
      }

      // Import products
      if (data.products) {
        for (const product of data.products) {
          await cacheManager.set('products', product.id, product);
        }
      }

      // Import categories
      if (data.categories) {
        for (const category of data.categories) {
          await cacheManager.set('categories', category.id, category);
        }
      }

      console.log('✅ Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Check if cache is ready
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Get network status
   */
  isOnline(): boolean {
    return cacheManager.getNetworkStatus();
  }
}

// Create and export singleton instance
const cacheSystem = new CacheSystem();

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    cacheSystem.initialize().catch(console.error);
  });
}

// Export everything
export {
  cacheSystem,
  dbManager,
  encryptionManager,
  cacheManager,
  imageCacheManager,
  authCache,
  productCache,
  cartCache
};

export default cacheSystem;
