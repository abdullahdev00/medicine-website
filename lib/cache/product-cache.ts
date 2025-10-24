/**
 * Product Cache - Optimized product data caching with search indexing
 * Features: Full-text search, Category filtering, Price indexing, Batch operations
 */

import { cacheManager } from './cache-manager';
import { imageCacheManager } from './image-cache';
import type { Product, Category } from '@/shared/schema';

interface ProductSearchIndex {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  rating: number;
  searchText: string;
}

class ProductCache {
  private searchIndex: Map<string, ProductSearchIndex> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private priceIndex: Map<number, Set<string>> = new Map();
  private isIndexBuilt = false;

  /**
   * Get all products with caching
   */
  async getProducts(forceRefresh = false): Promise<Product[]> {
    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await cacheManager.getAll<Product>('products');
        if (cached.length > 0) {
          // Build search index if needed
          if (!this.isIndexBuilt) {
            await this.buildSearchIndex(cached);
          }
          return cached;
        }
      }

      // Fetch from API
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const products = await response.json();

      // Cache products
      await this.cacheProducts(products);

      // Build search index
      await this.buildSearchIndex(products);

      // Preload images
      this.preloadProductImages(products);

      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      
      // Return cached data as fallback
      const cached = await cacheManager.getAll<Product>('products');
      return cached;
    }
  }

  /**
   * Get single product
   */
  async getProduct(id: string, forceRefresh = false): Promise<Product | null> {
    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await cacheManager.get<Product>('products', id);
        if (cached) {
          return cached;
        }
      }

      // Fetch from API
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const product = await response.json();

      // Cache product
      await cacheManager.set('products', id, product, {
        priority: 'medium',
        ttl: 60 * 60 * 1000 // 1 hour
      });

      // Preload images
      if (product.images && product.images.length > 0) {
        await imageCacheManager.preloadImages(product.images);
      }

      return product;
    } catch (error) {
      console.error(`Failed to get product ${id}:`, error);
      
      // Return cached data as fallback
      return await cacheManager.get<Product>('products', id);
    }
  }

  /**
   * Cache multiple products
   */
  private async cacheProducts(products: Product[]): Promise<void> {
    const promises = products.map(product =>
      cacheManager.set('products', product.id, product, {
        priority: 'medium',
        ttl: 60 * 60 * 1000 // 1 hour
      })
    );

    await Promise.all(promises);
  }

  /**
   * Build search index
   */
  private async buildSearchIndex(products: Product[]): Promise<void> {
    console.log('Building product search index...');

    this.searchIndex.clear();
    this.categoryIndex.clear();
    this.priceIndex.clear();

    for (const product of products) {
      // Create search index entry
      const searchText = `${product.name} ${product.description}`.toLowerCase();
      const price = parseFloat(product.variants?.[0]?.price || '0');
      const rating = parseFloat(product.rating || '0');

      const indexEntry: ProductSearchIndex = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        categoryId: product.categoryId,
        price,
        rating,
        searchText
      };

      this.searchIndex.set(product.id, indexEntry);

      // Update category index
      if (!this.categoryIndex.has(product.categoryId)) {
        this.categoryIndex.set(product.categoryId, new Set());
      }
      this.categoryIndex.get(product.categoryId)!.add(product.id);

      // Update price index (group by price range)
      const priceRange = Math.floor(price / 100) * 100;
      if (!this.priceIndex.has(priceRange)) {
        this.priceIndex.set(priceRange, new Set());
      }
      this.priceIndex.get(priceRange)!.add(product.id);
    }

    this.isIndexBuilt = true;
    console.log(`Search index built for ${products.length} products`);
  }

  /**
   * Search products locally
   */
  async searchProducts(
    query: string,
    filters?: {
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
    }
  ): Promise<Product[]> {
    // Ensure we have products and index
    const products = await this.getProducts();
    
    if (!query && !filters) {
      return products;
    }

    const results: Set<string> = new Set();
    const searchQuery = query.toLowerCase();

    // Text search
    if (query) {
      for (const [id, index] of this.searchIndex) {
        if (index.searchText.includes(searchQuery)) {
          results.add(id);
        }
      }
    } else {
      // If no query, include all products
      for (const id of this.searchIndex.keys()) {
        results.add(id);
      }
    }

    // Apply filters
    if (filters) {
      const filtered = new Set<string>();

      for (const id of results) {
        const index = this.searchIndex.get(id);
        if (!index) continue;

        let include = true;

        // Category filter
        if (filters.categoryId && index.categoryId !== filters.categoryId) {
          include = false;
        }

        // Price filter
        if (filters.minPrice !== undefined && index.price < filters.minPrice) {
          include = false;
        }
        if (filters.maxPrice !== undefined && index.price > filters.maxPrice) {
          include = false;
        }

        // Rating filter
        if (filters.minRating !== undefined && index.rating < filters.minRating) {
          include = false;
        }

        if (include) {
          filtered.add(id);
        }
      }

      // Get full product objects
      const filteredProducts: Product[] = [];
      for (const id of filtered) {
        const product = products.find(p => p.id === id);
        if (product) {
          filteredProducts.push(product);
        }
      }

      return filteredProducts;
    }

    // Get full product objects for results
    const resultProducts: Product[] = [];
    for (const id of results) {
      const product = products.find(p => p.id === id);
      if (product) {
        resultProducts.push(product);
      }
    }

    return resultProducts;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.getProducts();
    
    if (!this.categoryIndex.has(categoryId)) {
      return [];
    }

    const productIds = this.categoryIndex.get(categoryId)!;
    return products.filter(p => productIds.has(p.id));
  }

  /**
   * Get categories with caching
   */
  async getCategories(forceRefresh = false): Promise<Category[]> {
    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await cacheManager.getAll<Category>('categories');
        if (cached.length > 0) {
          return cached;
        }
      }

      // Fetch from API
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const categories = await response.json();

      // Cache categories
      await this.cacheCategories(categories);

      return categories;
    } catch (error) {
      console.error('Failed to get categories:', error);
      
      // Return cached data as fallback
      const cached = await cacheManager.getAll<Category>('categories');
      return cached;
    }
  }

  /**
   * Cache categories
   */
  private async cacheCategories(categories: Category[]): Promise<void> {
    const promises = categories.map(category =>
      cacheManager.set('categories', category.id, category, {
        priority: 'high',
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      })
    );

    await Promise.all(promises);
  }

  /**
   * Preload product images
   */
  private async preloadProductImages(products: Product[]): Promise<void> {
    // Collect all image URLs
    const imageUrls: string[] = [];
    
    for (const product of products.slice(0, 20)) { // Limit to first 20 products
      if (product.images && product.images.length > 0) {
        imageUrls.push(product.images[0]); // Just the first image
      }
    }

    // Preload in background
    if (imageUrls.length > 0) {
      imageCacheManager.preloadImages(imageUrls).catch(error => {
        console.error('Failed to preload images:', error);
      });
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    const products = await this.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return [];
    }

    // Get products from same category
    const related = products.filter(p => 
      p.id !== productId && 
      p.categoryId === product.categoryId
    );

    // Sort by rating and return limited results
    return related
      .sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'))
      .slice(0, limit);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const products = await this.getProducts();
    
    // Sort by rating and return top products
    return products
      .sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'))
      .slice(0, limit);
  }

  /**
   * Clear product cache
   */
  async clearCache(): Promise<void> {
    await cacheManager.clear('products');
    await cacheManager.clear('categories');
    this.searchIndex.clear();
    this.categoryIndex.clear();
    this.priceIndex.clear();
    this.isIndexBuilt = false;
    console.log('Product cache cleared');
  }

  /**
   * Warm cache with initial data
   */
  async warmCache(): Promise<void> {
    console.log('Warming product cache...');
    
    // Fetch and cache products and categories
    const [products, categories] = await Promise.all([
      this.getProducts(true),
      this.getCategories(true)
    ]);

    console.log(`Cached ${products.length} products and ${categories.length} categories`);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    products: number;
    categories: number;
    searchIndexSize: number;
  }> {
    const products = await cacheManager.getAll<Product>('products');
    const categories = await cacheManager.getAll<Category>('categories');

    return {
      products: products.length,
      categories: categories.length,
      searchIndexSize: this.searchIndex.size
    };
  }
}

// Export singleton instance
export const productCache = new ProductCache();
export default productCache;
