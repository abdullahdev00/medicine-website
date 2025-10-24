/**
 * Smart Product Cache - Images cached, details always fresh from API
 * Features: Permanent image caching, Dynamic product details, Smart preloading
 */

import { imageCacheManager } from './image-cache';
import { dbManager } from './db-manager';

export interface ProductImageCache {
  productId: string;
  mainImage: string; // URL to cached blob
  thumbnails: string[]; // URLs to cached thumbnail blobs
  cachedAt: number;
  urls: string[]; // Original URLs
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  variants: ProductVariant[];
  rating: string;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  brand: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  inStock: boolean;
  stockCount: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  parentId?: string;
  order: number;
}

class SmartProductCache {
  private productCache: Map<string, Product> = new Map();
  private categoryCache: Map<string, Category> = new Map();
  private lastProductFetch: number = 0;
  private lastCategoryFetch: number = 0;
  private fetchCooldown: number = 60000; // 1 minute for products
  private categoryCooldown: number = 300000; // 5 minutes for categories

  /**
   * Get products with cached images but fresh details
   */
  async getProducts(options?: {
    categoryId?: string;
    search?: string;
    limit?: number;
    forceRefresh?: boolean;
  }): Promise<Product[]> {
    try {
      // Check if we need to fetch fresh data
      const shouldFetch = options?.forceRefresh || 
                         (Date.now() - this.lastProductFetch > this.fetchCooldown) ||
                         this.productCache.size === 0;

      if (shouldFetch && navigator.onLine) {
        await this.fetchProductsFromAPI(options);
      }

      // Return filtered results from memory cache
      let products = Array.from(this.productCache.values());

      // Apply filters
      if (options?.categoryId) {
        products = products.filter(p => p.categoryId === options.categoryId);
      }

      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (options?.limit) {
        products = products.slice(0, options.limit);
      }

      // Preload images for visible products
      this.preloadProductImages(products.slice(0, 20));

      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return Array.from(this.productCache.values());
    }
  }

  /**
   * Get single product with cached images
   */
  async getProduct(productId: string, forceRefresh = false): Promise<Product | null> {
    try {
      // Check memory cache first
      if (!forceRefresh && this.productCache.has(productId)) {
        const product = this.productCache.get(productId)!;
        
        // Preload images
        this.preloadProductImages([product]);
        
        return product;
      }

      // Fetch from API
      if (navigator.onLine) {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const product = await response.json();
          
          // Cache in memory
          this.productCache.set(productId, product);
          
          // Preload images
          this.preloadProductImages([product]);
          
          return product;
        }
      }

      // Return cached version if available
      return this.productCache.get(productId) || null;
    } catch (error) {
      console.error(`Failed to get product ${productId}:`, error);
      return this.productCache.get(productId) || null;
    }
  }

  /**
   * Get categories with smart caching
   */
  async getCategories(forceRefresh = false): Promise<Category[]> {
    try {
      const shouldFetch = forceRefresh || 
                         (Date.now() - this.lastCategoryFetch > this.categoryCooldown) ||
                         this.categoryCache.size === 0;

      if (shouldFetch && navigator.onLine) {
        await this.fetchCategoriesFromAPI();
      }

      return Array.from(this.categoryCache.values())
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Failed to get categories:', error);
      return Array.from(this.categoryCache.values());
    }
  }

  /**
   * Fetch products from API
   */
  private async fetchProductsFromAPI(options?: any): Promise<void> {
    try {
      console.log('Fetching fresh product data from API...');
      
      let url = '/api/products';
      const params = new URLSearchParams();
      
      if (options?.categoryId) params.append('categoryId', options.categoryId);
      if (options?.search) params.append('search', options.search);
      if (options?.limit) params.append('limit', options.limit.toString());
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const products: Product[] = await response.json();
      
      // Update memory cache
      for (const product of products) {
        this.productCache.set(product.id, product);
      }

      this.lastProductFetch = Date.now();
      console.log(`Cached ${products.length} products in memory`);
    } catch (error) {
      console.error('Failed to fetch products from API:', error);
      throw error;
    }
  }

  /**
   * Fetch categories from API
   */
  private async fetchCategoriesFromAPI(): Promise<void> {
    try {
      console.log('Fetching fresh category data from API...');
      
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const categories: Category[] = await response.json();
      
      // Update memory cache
      this.categoryCache.clear();
      for (const category of categories) {
        this.categoryCache.set(category.id, category);
      }

      this.lastCategoryFetch = Date.now();
      console.log(`Cached ${categories.length} categories in memory`);
    } catch (error) {
      console.error('Failed to fetch categories from API:', error);
      throw error;
    }
  }

  /**
   * Preload product images in background
   */
  private async preloadProductImages(products: Product[]): Promise<void> {
    try {
      const imageUrls: string[] = [];
      
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          // Add main image and first few thumbnails
          imageUrls.push(...product.images.slice(0, 3));
        }
      }

      if (imageUrls.length > 0) {
        // Preload in background without blocking
        imageCacheManager.preloadImages(imageUrls).catch(error => {
          console.error('Failed to preload product images:', error);
        });
      }
    } catch (error) {
      console.error('Failed to preload product images:', error);
    }
  }

  /**
   * Get cached image for product
   */
  async getProductImage(imageUrl: string, thumbnail = false): Promise<string | null> {
    try {
      if (thumbnail) {
        return await imageCacheManager.getThumbnail(imageUrl);
      } else {
        return await imageCacheManager.getImage(imageUrl, {
          generateThumbnail: true
        });
      }
    } catch (error) {
      console.error(`Failed to get product image ${imageUrl}:`, error);
      return imageUrl; // Return original URL as fallback
    }
  }

  /**
   * Search products locally (from memory cache)
   */
  searchProducts(query: string, filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
  }): Product[] {
    const searchLower = query.toLowerCase();
    let results = Array.from(this.productCache.values());

    // Text search
    if (query) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.categoryId) {
        results = results.filter(p => p.categoryId === filters.categoryId);
      }
      
      if (filters.minPrice !== undefined) {
        results = results.filter(p => p.price >= filters.minPrice!);
      }
      
      if (filters.maxPrice !== undefined) {
        results = results.filter(p => p.price <= filters.maxPrice!);
      }
      
      if (filters.inStockOnly) {
        results = results.filter(p => p.inStock);
      }
    }

    return results;
  }

  /**
   * Get related products
   */
  getRelatedProducts(productId: string, limit = 4): Product[] {
    const product = this.productCache.get(productId);
    if (!product) return [];

    return Array.from(this.productCache.values())
      .filter(p => 
        p.id !== productId && 
        (p.categoryId === product.categoryId || p.brand === product.brand)
      )
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, limit);
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(limit = 8): Product[] {
    return Array.from(this.productCache.values())
      .filter(p => p.inStock)
      .sort((a, b) => {
        // Sort by rating and review count
        const ratingDiff = parseFloat(b.rating) - parseFloat(a.rating);
        if (ratingDiff !== 0) return ratingDiff;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, limit);
  }

  /**
   * Clear memory caches (keep image cache)
   */
  clearMemoryCache(): void {
    this.productCache.clear();
    this.categoryCache.clear();
    this.lastProductFetch = 0;
    this.lastCategoryFetch = 0;
    console.log('Product memory cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    products: number;
    categories: number;
    lastProductFetch: number;
    lastCategoryFetch: number;
  } {
    return {
      products: this.productCache.size,
      categories: this.categoryCache.size,
      lastProductFetch: this.lastProductFetch,
      lastCategoryFetch: this.lastCategoryFetch
    };
  }
}

// Export singleton instance
export const smartProductCache = new SmartProductCache();
export default smartProductCache;
