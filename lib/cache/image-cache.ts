/**
 * Image Cache Manager - Optimized image caching with blob storage and progressive loading
 * Features: Blob storage, Thumbnail generation, Progressive loading, Memory cache
 */

import { dbManager } from './db-manager';

interface CachedImage {
  url: string;
  blob: Blob;
  thumbnail?: Blob;
  timestamp: number;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

interface ImageCacheOptions {
  generateThumbnail?: boolean;
  thumbnailSize?: number;
  quality?: number;
  maxSize?: number;
}

class ImageCacheManager {
  private memoryCache: Map<string, Blob> = new Map();
  private pendingFetches: Map<string, Promise<Blob | null>> = new Map();
  private maxMemoryCacheSize = 50 * 1024 * 1024; // 50MB
  private currentMemorySize = 0;
  private defaultThumbnailSize = 150;
  private maxImageSize = 5 * 1024 * 1024; // 5MB per image

  /**
   * Get image from cache or fetch
   */
  async getImage(
    url: string,
    options: ImageCacheOptions = {}
  ): Promise<string | null> {
    try {
      // Check memory cache first
      const memCached = this.memoryCache.get(url);
      if (memCached) {
        return URL.createObjectURL(memCached);
      }

      // Check IndexedDB
      const cached = await dbManager.get<CachedImage>('images', url);
      if (cached) {
        // Add to memory cache
        this.addToMemoryCache(url, cached.blob);
        return URL.createObjectURL(cached.blob);
      }

      // Fetch if online
      if (navigator.onLine) {
        const blob = await this.fetchAndCacheImage(url, options);
        return blob ? URL.createObjectURL(blob) : null;
      }

      return null;
    } catch (error) {
      console.error(`Failed to get image ${url}:`, error);
      return null;
    }
  }

  /**
   * Fetch and cache image
   */
  private async fetchAndCacheImage(
    url: string,
    options: ImageCacheOptions
  ): Promise<Blob | null> {
    // Check if already fetching
    const pending = this.pendingFetches.get(url);
    if (pending) {
      return pending;
    }

    // Create fetch promise
    const fetchPromise = this.performFetch(url, options);
    this.pendingFetches.set(url, fetchPromise);

    try {
      const blob = await fetchPromise;
      this.pendingFetches.delete(url);
      return blob;
    } catch (error) {
      this.pendingFetches.delete(url);
      throw error;
    }
  }

  /**
   * Perform actual fetch
   */
  private async performFetch(
    url: string,
    options: ImageCacheOptions
  ): Promise<Blob | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      let blob = await response.blob();

      // Check size limit
      if (blob.size > this.maxImageSize) {
        console.warn(`Image too large (${blob.size} bytes), compressing...`);
        blob = await this.compressImage(blob, options.quality || 0.8);
      }

      // Generate thumbnail if requested
      let thumbnail: Blob | undefined;
      if (options.generateThumbnail) {
        thumbnail = await this.generateThumbnail(
          blob,
          options.thumbnailSize || this.defaultThumbnailSize
        );
      }

      // Get image dimensions
      const dimensions = await this.getImageDimensions(blob);

      // Create cached image object
      const cachedImage: CachedImage = {
        url,
        blob,
        thumbnail,
        timestamp: Date.now(),
        size: blob.size,
        type: blob.type,
        ...dimensions
      };

      // Store in IndexedDB
      await dbManager.put('images', cachedImage, url, 7 * 24 * 60 * 60 * 1000); // 7 days

      // Add to memory cache
      this.addToMemoryCache(url, blob);

      return blob;
    } catch (error) {
      console.error(`Failed to fetch image ${url}:`, error);
      return null;
    }
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(blob: Blob, size: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        // Calculate thumbnail dimensions
        const aspectRatio = img.width / img.height;
        let width = size;
        let height = size;

        if (aspectRatio > 1) {
          height = size / aspectRatio;
        } else {
          width = size * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw thumbnail
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (thumbnailBlob) => {
            if (thumbnailBlob) {
              resolve(thumbnailBlob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          0.7
        );

        // Clean up
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Compress image
   */
  private async compressImage(blob: Blob, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Convert to blob with compression
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob && compressedBlob.size < blob.size) {
              resolve(compressedBlob);
            } else {
              resolve(blob); // Return original if compression didn't help
            }
          },
          'image/jpeg',
          quality
        );

        // Clean up
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(blob); // Return original on error
      };

      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        resolve({ width: 0, height: 0 });
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Add to memory cache with LRU eviction
   */
  private addToMemoryCache(url: string, blob: Blob): void {
    // Check if already in cache
    if (this.memoryCache.has(url)) {
      return;
    }

    // Check if we need to evict
    if (this.currentMemorySize + blob.size > this.maxMemoryCacheSize) {
      this.evictFromMemoryCache(blob.size);
    }

    // Add to cache
    this.memoryCache.set(url, blob);
    this.currentMemorySize += blob.size;
  }

  /**
   * Evict from memory cache (LRU)
   */
  private evictFromMemoryCache(neededSize: number): void {
    const entries = Array.from(this.memoryCache.entries());
    let freedSize = 0;

    for (const [url, blob] of entries) {
      if (freedSize >= neededSize) break;

      this.memoryCache.delete(url);
      freedSize += blob.size;
      this.currentMemorySize -= blob.size;
    }
  }

  /**
   * Preload images
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.getImage(url, { generateThumbnail: true }));
    await Promise.allSettled(promises);
  }

  /**
   * Get thumbnail
   */
  async getThumbnail(url: string): Promise<string | null> {
    try {
      const cached = await dbManager.get<CachedImage>('images', url);
      
      if (cached?.thumbnail) {
        return URL.createObjectURL(cached.thumbnail);
      }

      // Generate thumbnail if image exists but no thumbnail
      if (cached?.blob) {
        const thumbnail = await this.generateThumbnail(cached.blob, this.defaultThumbnailSize);
        cached.thumbnail = thumbnail;
        await dbManager.put('images', cached, url);
        return URL.createObjectURL(thumbnail);
      }

      // Fetch and generate
      const blob = await this.fetchAndCacheImage(url, { generateThumbnail: true });
      if (blob) {
        const cached = await dbManager.get<CachedImage>('images', url);
        return cached?.thumbnail ? URL.createObjectURL(cached.thumbnail) : null;
      }

      return null;
    } catch (error) {
      console.error(`Failed to get thumbnail for ${url}:`, error);
      return null;
    }
  }

  /**
   * Clear image cache
   */
  async clearCache(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    this.currentMemorySize = 0;

    // Clear IndexedDB
    await dbManager.clear('images');
  }

  /**
   * Clean up old images
   */
  async cleanupOldImages(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const images = await dbManager.getAll<CachedImage>('images');
    const now = Date.now();
    let deletedCount = 0;

    for (const image of images) {
      if (now - image.timestamp > maxAge) {
        await dbManager.delete('images', image.url);
        this.memoryCache.delete(image.url);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old images`);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalImages: number;
    totalSize: number;
    memoryImages: number;
    memorySize: number;
  }> {
    const images = await dbManager.getAll<CachedImage>('images');
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);

    return {
      totalImages: images.length,
      totalSize,
      memoryImages: this.memoryCache.size,
      memorySize: this.currentMemorySize
    };
  }

  /**
   * Convert blob to base64
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert base64 to blob
   */
  async base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return response.blob();
  }
}

// Export singleton instance
export const imageCacheManager = new ImageCacheManager();
export default imageCacheManager;
