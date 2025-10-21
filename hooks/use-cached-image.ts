import { useState, useEffect, useCallback } from 'react';
import { imageCache } from '@/lib/image-cache/indexed-db';

interface UseCachedImageOptions {
  fallbackUrl?: string;
  productId?: string;
  preload?: boolean;
  quality?: number; // Image quality for compression (0-1)
}

interface UseCachedImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  isCached: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to load and cache images using IndexedDB
 */
export function useCachedImage(
  url: string | undefined | null,
  options: UseCachedImageOptions = {}
): UseCachedImageReturn {
  const {
    fallbackUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    productId,
    preload = true,
    quality = 0.9,
  } = options;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState(false);

  /**
   * Compress image blob if needed
   */
  const compressImage = useCallback(async (blob: Blob): Promise<Blob> => {
    // Skip compression for small images or non-JPEG/PNG
    if (blob.size < 100 * 1024 || !blob.type.match(/^image\/(jpeg|png)/)) {
      return blob;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        let { width, height } = img;
        const maxDimension = 1200;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (compressedBlob) => {
              resolve(compressedBlob || blob);
            },
            blob.type,
            quality
          );
        } else {
          resolve(blob);
        }
      };

      img.src = URL.createObjectURL(blob);
    });
  }, [quality]);

  /**
   * Fetch and cache image
   */
  const fetchAndCacheImage = useCallback(async (imageUrl: string): Promise<string> => {
    try {
      // Try to get from cache first
      const cachedBlob = await imageCache.get(imageUrl);
      
      if (cachedBlob) {
        setIsCached(true);
        return URL.createObjectURL(cachedBlob);
      }

      // Fetch from network
      setIsCached(false);
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Compress if needed
      const compressedBlob = await compressImage(blob);
      
      // Cache the compressed image
      await imageCache.set(imageUrl, compressedBlob, productId);
      
      return URL.createObjectURL(compressedBlob);
    } catch (err) {
      console.error('Failed to fetch/cache image:', err);
      throw err;
    }
  }, [productId, compressImage]);

  /**
   * Load image (from cache or network)
   */
  const loadImage = useCallback(async () => {
    if (!url) {
      setImageUrl(fallbackUrl);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const objectUrl = await fetchAndCacheImage(url);
      setImageUrl(objectUrl);
    } catch (err) {
      setError(err as Error);
      setImageUrl(fallbackUrl);
    } finally {
      setIsLoading(false);
    }
  }, [url, fallbackUrl, fetchAndCacheImage]);

  /**
   * Refresh image (bypass cache)
   */
  const refresh = useCallback(async () => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      // Delete from cache first
      await imageCache.delete(url);
      
      // Fetch fresh image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const compressedBlob = await compressImage(blob);
      
      // Cache the new image
      await imageCache.set(url, compressedBlob, productId);
      
      const objectUrl = URL.createObjectURL(compressedBlob);
      setImageUrl(objectUrl);
      setIsCached(false);
    } catch (err) {
      setError(err as Error);
      setImageUrl(fallbackUrl);
    } finally {
      setIsLoading(false);
    }
  }, [url, fallbackUrl, productId, compressImage]);

  // Load image on mount or URL change
  useEffect(() => {
    if (preload) {
      loadImage();
    }
  }, [url, preload]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return {
    imageUrl,
    isLoading,
    error,
    isCached,
    refresh,
  };
}

/**
 * Hook to preload multiple images
 */
export function usePreloadImages(urls: string[], productId?: string) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const preloadAll = useCallback(async () => {
    if (!urls.length) return;

    setIsLoading(true);
    let loaded = 0;

    for (const url of urls) {
      try {
        const cachedBlob = await imageCache.get(url);
        
        if (!cachedBlob) {
          const response = await fetch(url);
          if (response.ok) {
            const blob = await response.blob();
            await imageCache.set(url, blob, productId);
          }
        }
        
        loaded++;
        setProgress((loaded / urls.length) * 100);
      } catch (err) {
        console.error(`Failed to preload ${url}:`, err);
      }
    }

    setIsLoading(false);
  }, [urls, productId]);

  useEffect(() => {
    preloadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { progress, isLoading };
}
