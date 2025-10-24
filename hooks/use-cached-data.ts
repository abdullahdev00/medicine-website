/**
 * React hooks for cached data access
 * Features: Automatic cache management, Real-time updates, Error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { authCache } from '@/lib/cache/auth-cache';
import { productCache } from '@/lib/cache/product-cache';
import { cartCache } from '@/lib/cache/cart-cache';
import { cacheManager } from '@/lib/cache/cache-manager';
import { imageCacheManager } from '@/lib/cache/image-cache';
import type { User, Product, Category } from '@/shared/schema';
import type { Cart } from '@/lib/cache/cart-cache';

/**
 * Hook for cached user authentication
 */
export function useCachedAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        const cachedUser = await authCache.getCurrentUser();
        
        if (mounted) {
          setUser(cachedUser);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error('Failed to load user:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      
      // Initialize encryption
      await authCache.initialize(email, password);
      
      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user, token, refreshToken } = await response.json();
      
      // Store auth
      await authCache.storeAuth(user, token, refreshToken, rememberMe);
      
      setUser(user);
      setError(null);
      
      return user;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authCache.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      await authCache.updateUser(updatedUser);
      setUser(updatedUser);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };
}

/**
 * Hook for cached products
 */
export function useCachedProducts(options?: {
  categoryId?: string;
  search?: string;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        
        let result: Product[];
        
        if (options?.search) {
          // Search products
          result = await productCache.searchProducts(options.search, {
            categoryId: options.categoryId
          });
        } else if (options?.categoryId) {
          // Get by category
          result = await productCache.getProductsByCategory(options.categoryId);
        } else {
          // Get all products
          result = await productCache.getProducts();
        }

        // Apply limit if specified
        if (options?.limit) {
          result = result.slice(0, options.limit);
        }

        if (mounted) {
          setProducts(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error('Failed to load products:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [options?.categoryId, options?.search, options?.limit]);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const result = await productCache.getProducts(true);
      setProducts(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    refreshing,
    refresh
  };
}

/**
 * Hook for single cached product
 */
export function useCachedProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      if (!productId) {
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await productCache.getProduct(productId);
        
        if (mounted) {
          setProduct(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error(`Failed to load product ${productId}:`, err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const refresh = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const result = await productCache.getProduct(productId, true);
      setProduct(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  return {
    product,
    loading,
    error,
    refresh
  };
}

/**
 * Hook for cached categories
 */
export function useCachedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        const result = await productCache.getCategories();
        
        if (mounted) {
          setCategories(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error('Failed to load categories:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    categories,
    loading,
    error
  };
}

/**
 * Hook for cached cart
 */
export function useCachedCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const userIdRef = useRef<string>('');

  useEffect(() => {
    let mounted = true;

    const loadCart = async () => {
      try {
        setLoading(true);
        
        // Get user ID (use guest ID if not logged in)
        const user = await authCache.getCurrentUser();
        const userId = user?.id || `guest_${localStorage.getItem('guestId') || Date.now()}`;
        
        if (!user && !localStorage.getItem('guestId')) {
          localStorage.setItem('guestId', userId);
        }
        
        userIdRef.current = userId;
        
        const result = await cartCache.getCart(userId);
        
        if (mounted) {
          setCart(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error('Failed to load cart:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      mounted = false;
    };
  }, []);

  const addItem = useCallback(async (product: Product, variantIndex = 0, quantity = 1) => {
    try {
      const result = await cartCache.addItem(userIdRef.current, product, variantIndex, quantity);
      setCart(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const result = await cartCache.updateQuantity(userIdRef.current, itemId, quantity);
      setCart(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const result = await cartCache.removeItem(userIdRef.current, itemId);
      setCart(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const result = await cartCache.clearCart(userIdRef.current);
      setCart(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const applyCoupon = useCallback(async (couponCode: string) => {
    try {
      const result = await cartCache.applyCoupon(userIdRef.current, couponCode);
      setCart(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    cart,
    loading,
    error,
    itemCount: cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    total: cart?.total || 0,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon
  };
}

/**
 * Hook for cached images
 */
export function useCachedImage(url: string | undefined, options?: {
  thumbnail?: boolean;
  placeholder?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string>(options?.placeholder || '');
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      if (!url) {
        setImageUrl(options?.placeholder || '');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const result = options?.thumbnail
          ? await imageCacheManager.getThumbnail(url)
          : await imageCacheManager.getImage(url);
        
        if (mounted && result) {
          setImageUrl(result);
          setError(null);
        } else if (mounted) {
          setImageUrl(options?.placeholder || url);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setImageUrl(options?.placeholder || url);
          console.error(`Failed to load image ${url}:`, err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
      // Clean up object URL if created
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [url, options?.thumbnail, options?.placeholder]);

  return {
    imageUrl,
    loading,
    error
  };
}

/**
 * Hook for network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribe = cacheManager.onNetworkChange(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

/**
 * Hook for cache statistics
 */
export function useCacheStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const [cacheStats, productStats, imageStats] = await Promise.all([
          cacheManager.getStats(),
          productCache.getStats(),
          imageCacheManager.getStats()
        ]);

        if (mounted) {
          setStats({
            ...cacheStats,
            products: productStats,
            images: imageStats
          });
        }
      } catch (error) {
        console.error('Failed to load cache stats:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    stats,
    loading
  };
}
