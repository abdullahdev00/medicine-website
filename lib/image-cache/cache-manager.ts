import { imageCache } from './indexed-db';

/**
 * Image Cache Manager
 * Provides utilities for managing the image cache
 */
export class CacheManager {
  /**
   * Preload all product images
   */
  static async preloadProductImages(products: Array<{
    id: string;
    images?: string[];
  }>): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const product of products) {
      if (product.images && product.images.length > 0) {
        // Preload first image of each product
        const imageUrl = product.images[0];
        
        promises.push(
          (async () => {
            try {
              // Check if already cached
              const cached = await imageCache.get(imageUrl);
              if (cached) return;

              // Fetch and cache
              const response = await fetch(imageUrl);
              if (response.ok) {
                const blob = await response.blob();
                await imageCache.set(imageUrl, blob, product.id);
              }
            } catch (err) {
              console.error(`Failed to preload image for product ${product.id}:`, err);
            }
          })()
        );
      }
    }

    await Promise.all(promises);
  }

  /**
   * Clean up expired cache entries
   */
  static async cleanupExpiredCache(): Promise<number> {
    const stats = await imageCache.getStats();
    let cleaned = 0;

    // This would need to be implemented in the IndexedDB service
    // For now, we'll just clear if cache is too large
    if (stats.usage > 80) {
      // Clear oldest 20% of cache
      const targetSize = stats.maxSize * 0.6;
      // Implementation would go here
      console.log(`Cache cleanup: ${stats.usage}% full, cleaning...`);
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    const stats = await imageCache.getStats();
    
    return {
      ...stats,
      sizeFormatted: this.formatBytes(stats.size),
      maxSizeFormatted: this.formatBytes(stats.maxSize),
      usageFormatted: `${stats.usage.toFixed(1)}%`,
    };
  }

  /**
   * Clear entire cache
   */
  static async clearCache(): Promise<void> {
    await imageCache.clear();
    console.log('Image cache cleared');
  }

  /**
   * Format bytes to human readable
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Intelligent preloading based on viewport
   */
  static setupIntersectionObserver(
    selector: string = '[data-preload-image]'
  ): IntersectionObserver {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const imageUrl = element.dataset.preloadImage;
            const productId = element.dataset.productId;

            if (imageUrl) {
              // Preload image when element comes into view
              (async () => {
                const cached = await imageCache.get(imageUrl);
                if (!cached) {
                  try {
                    const response = await fetch(imageUrl);
                    if (response.ok) {
                      const blob = await response.blob();
                      await imageCache.set(imageUrl, blob, productId);
                    }
                  } catch (err) {
                    console.error('Failed to preload image:', err);
                  }
                }
              })();

              // Stop observing this element
              observer.unobserve(element);
            }
          }
        });
      },
      {
        // Start loading when element is 200px away from viewport
        rootMargin: '200px',
      }
    );

    // Start observing all matching elements
    document.querySelectorAll(selector).forEach((element) => {
      observer.observe(element);
    });

    return observer;
  }

  /**
   * Network-aware preloading
   */
  static async smartPreload(urls: string[], productIds?: string[]): Promise<void> {
    // Check network connection type
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType;
      const saveData = connection.saveData;

      // Don't preload on slow connections or data saver mode
      if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
        console.log('Skipping preload due to slow connection or data saver');
        return;
      }

      // Limit preload on 3G
      if (effectiveType === '3g') {
        urls = urls.slice(0, 3); // Only preload first 3 images
      }
    }

    // Preload images
    const promises = urls.map(async (url, index) => {
      try {
        const cached = await imageCache.get(url);
        if (cached) return;

        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const productId = productIds?.[index];
          await imageCache.set(url, blob, productId);
        }
      } catch (err) {
        console.error(`Failed to preload ${url}:`, err);
      }
    });

    await Promise.all(promises);
  }
}

/**
 * Auto cleanup on page load
 */
if (typeof window !== 'undefined') {
  // Clean up expired cache on page load
  window.addEventListener('load', () => {
    CacheManager.cleanupExpiredCache();
  });

  // Set up periodic cleanup (every hour)
  setInterval(() => {
    CacheManager.cleanupExpiredCache();
  }, 60 * 60 * 1000);
}
