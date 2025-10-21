# Image Caching System Documentation

## Overview
A comprehensive client-side image caching system using IndexedDB to improve performance and reduce bandwidth usage.

## Features

### 1. **IndexedDB Storage**
- Stores images as Blobs in browser's IndexedDB
- Persistent across sessions
- 50MB default cache size
- Automatic cleanup of old entries

### 2. **Smart Caching Strategy**
- **Cache-First**: Check cache before network
- **Background Updates**: Refresh stale cache in background
- **Automatic Compression**: Reduces image size before caching
- **Expiration**: 7-day default cache lifetime

### 3. **Performance Optimizations**
- **Lazy Loading**: Load images only when needed
- **Preloading**: Intelligent preloading based on viewport
- **Network-Aware**: Adjusts behavior based on connection speed
- **Progressive Enhancement**: Falls back gracefully

## Architecture

```
┌─────────────────┐
│   Component     │
│  (CachedImage)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useCachedImage │
│     (Hook)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ImageCacheService│
│   (IndexedDB)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    IndexedDB    │
│   (Browser DB)  │
└─────────────────┘
```

## Usage Examples

### Basic Usage
```tsx
import { CachedImage } from '@/components/CachedImage';

<CachedImage
  src={imageUrl}
  alt="Product"
  productId={productId}
  className="w-full h-full"
/>
```

### Product Image
```tsx
import { ProductImage } from '@/components/CachedImage';

<ProductImage
  product={product}
  imageIndex={0}
  priority={true}
/>
```

### Image Gallery
```tsx
import { CachedImageGallery } from '@/components/CachedImage';

<CachedImageGallery
  images={product.images}
  productId={product.id}
/>
```

### Hook Usage
```tsx
import { useCachedImage } from '@/hooks/use-cached-image';

const { imageUrl, isLoading, isCached } = useCachedImage(url, {
  productId: 'product-123',
  quality: 0.9,
  preload: true
});
```

### Preloading
```tsx
import { CacheManager } from '@/lib/image-cache/cache-manager';

// Preload product images
await CacheManager.preloadProductImages(products);

// Smart preload (network-aware)
await CacheManager.smartPreload(imageUrls, productIds);
```

## Configuration

### Cache Settings
```typescript
const config = {
  dbName: 'MedicineWebsiteImageCache',
  version: 1,
  storeName: 'images',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxSize: 50 * 1024 * 1024, // 50MB
};
```

### Image Compression
```typescript
// Quality settings (0-1)
quality: 0.9  // 90% quality (default)
quality: 0.7  // 70% quality (smaller size)
quality: 1.0  // 100% quality (no compression)
```

## Cache Management

### View Cache Statistics
```typescript
const stats = await CacheManager.getCacheStats();
console.log(stats);
// {
//   count: 42,
//   size: 12582912,
//   sizeFormatted: "12 MB",
//   maxSize: 52428800,
//   maxSizeFormatted: "50 MB",
//   usage: 24,
//   usageFormatted: "24.0%"
// }
```

### Clear Cache
```typescript
// Clear entire cache
await CacheManager.clearCache();

// Clear specific image
await imageCache.delete(imageUrl);

// Clear product images
const productImages = await imageCache.getProductImages(productId);
for (const img of productImages) {
  await imageCache.delete(img.url);
}
```

### Automatic Cleanup
- Runs on page load
- Periodic cleanup every hour
- Removes expired entries (> 7 days old)
- Evicts oldest entries when cache is full

## Network Optimization

### Connection-Aware Loading
```typescript
// Automatically adjusts based on network
// - 4G/WiFi: Full preloading
// - 3G: Limited preloading (first 3 images)
// - 2G/Slow: No preloading
// - Data Saver: No preloading
```

### Viewport-Based Loading
```typescript
// Setup intersection observer
CacheManager.setupIntersectionObserver('[data-preload-image]');

// Images load when 200px from viewport
<div data-preload-image={imageUrl} data-product-id={productId}>
  ...
</div>
```

## Performance Benefits

### Before (No Caching)
- Every page load fetches from server
- Network latency on each image
- Bandwidth usage on repeat visits
- Slow on poor connections

### After (With Caching)
- First load: Fetch and cache
- Subsequent loads: Instant from IndexedDB
- 70-90% reduction in network requests
- Works offline for cached images
- Faster page loads

## Browser Support

- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (14+)
- Edge: ✅ Full support
- Mobile browsers: ✅ Full support

## Troubleshooting

### Cache Not Working
1. Check browser IndexedDB support
2. Verify storage quota not exceeded
3. Check console for errors
4. Clear cache and retry

### Images Not Loading
1. Check network connection
2. Verify image URLs are correct
3. Check CORS headers on image server
4. Inspect browser console

### Performance Issues
1. Reduce cache size if needed
2. Adjust image quality settings
3. Limit concurrent preloads
4. Use viewport-based loading

## Best Practices

1. **Use appropriate quality settings**
   - Product thumbnails: 0.7-0.8
   - Product details: 0.85-0.9
   - Hero images: 0.9-1.0

2. **Preload strategically**
   - Homepage: First 6-8 products
   - Category page: Visible products
   - Product detail: All product images

3. **Monitor cache size**
   - Regular cleanup
   - Set appropriate max size
   - Monitor usage statistics

4. **Handle errors gracefully**
   - Always provide fallback images
   - Show loading states
   - Log errors for debugging

## Migration Guide

### From Regular Images
```tsx
// Before
<img src={imageUrl} alt={product.name} />

// After
<CachedImage
  src={imageUrl}
  alt={product.name}
  productId={product.id}
/>
```

### From Next.js Image
```tsx
// Before
import Image from 'next/image';
<Image src={imageUrl} alt={product.name} width={400} height={400} />

// After
<CachedImage
  src={imageUrl}
  alt={product.name}
  width={400}
  height={400}
  productId={product.id}
/>
```

## Future Enhancements

1. **Service Worker Integration**
   - Offline support
   - Background sync
   - Push updates

2. **WebP Support**
   - Automatic format conversion
   - Smaller file sizes
   - Better compression

3. **CDN Integration**
   - Image optimization API
   - On-the-fly resizing
   - Global edge caching

4. **Analytics**
   - Cache hit rates
   - Performance metrics
   - User behavior tracking
