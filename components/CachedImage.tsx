import { useState, useEffect } from 'react';
import { useCachedImage } from '@/hooks/use-cached-image';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CachedImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  productId?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  showLoader?: boolean;
  loaderClassName?: string;
  quality?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function CachedImage({
  src,
  alt,
  className,
  fallbackSrc,
  productId,
  width,
  height,
  priority = false,
  onLoad,
  onError,
  showLoader = true,
  loaderClassName,
  quality = 0.9,
  objectFit = 'cover',
}: CachedImageProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { imageUrl, isLoading, error, isCached } = useCachedImage(src, {
    fallbackUrl: fallbackSrc,
    productId,
    preload: true,
    quality,
  });

  useEffect(() => {
    if (error) {
      setHasError(true);
      onError?.(error);
    }
  }, [error, onError]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    if (!error) {
      onError?.(new Error('Image failed to load'));
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading indicator */}
      {showLoader && isLoading && !isImageLoaded && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-muted/50',
          loaderClassName
        )}>
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Main image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            isImageLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          style={{ objectFit }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Cache indicator (optional - for debugging) */}
      {process.env.NODE_ENV === 'development' && isCached && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
          Cached
        </div>
      )}
    </div>
  );
}

/**
 * Optimized Product Image Component
 */
export function ProductImage({
  product,
  imageIndex = 0,
  className,
  ...props
}: {
  product: { id: string; images?: string[]; name: string };
  imageIndex?: number;
} & Omit<CachedImageProps, 'src' | 'alt' | 'productId'>) {
  const imageUrl = product.images?.[imageIndex];
  
  return (
    <CachedImage
      src={imageUrl}
      alt={product.name}
      productId={product.id}
      className={className}
      {...props}
    />
  );
}

/**
 * Image Gallery with Caching
 */
export function CachedImageGallery({
  images,
  productId,
  className,
}: {
  images: string[];
  productId?: string;
  className?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Preload all images
  useEffect(() => {
    images.forEach((url, index) => {
      if (index !== selectedIndex) {
        // Preload other images in background
        const img = new Image();
        img.src = url;
      }
    });
  }, [images, selectedIndex]);

  if (!images.length) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
        <CachedImage
          src={images[selectedIndex]}
          alt={`Product image ${selectedIndex + 1}`}
          productId={productId}
          className="w-full h-full"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((url, index) => (
            <button
              key={url}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0',
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <CachedImage
                src={url}
                alt={`Thumbnail ${index + 1}`}
                productId={productId}
                className="w-full h-full"
                showLoader={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
