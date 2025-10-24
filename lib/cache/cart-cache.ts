/**
 * Cart Cache - Persistent cart with offline support and sync
 * Features: Local-first updates, Background sync, Conflict resolution, Optimistic updates
 */

import { cacheManager } from './cache-manager';
import type { Product } from '@/shared/schema';

export interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  variantIndex: number;
  quantity: number;
  price: number;
  addedAt: number;
  updatedAt: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

class CartCache {
  private currentCart: Cart | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private optimisticUpdates: Map<string, CartItem> = new Map();

  /**
   * Get or create cart
   */
  async getCart(userId: string): Promise<Cart> {
    // Return from memory if available
    if (this.currentCart && this.currentCart.userId === userId) {
      return this.currentCart;
    }

    try {
      // Try to get from cache
      const cached = await cacheManager.get<Cart>('cart', userId);
      
      if (cached) {
        this.currentCart = cached;
        
        // Sync with server in background
        this.syncInBackground(userId);
        
        return cached;
      }

      // Create new cart
      const newCart: Cart = {
        id: `cart_${userId}_${Date.now()}`,
        userId,
        items: [],
        total: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        updatedAt: Date.now(),
        syncStatus: 'synced'
      };

      await this.saveCart(newCart);
      return newCart;
    } catch (error) {
      console.error('Failed to get cart:', error);
      return this.createEmptyCart(userId);
    }
  }

  /**
   * Add item to cart with optimistic update
   */
  async addItem(
    userId: string,
    product: Product,
    variantIndex: number = 0,
    quantity: number = 1
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    
    // Check if item already exists
    const existingIndex = cart.items.findIndex(
      item => item.productId === product.id && item.variantIndex === variantIndex
    );

    const variant = product.variants?.[variantIndex];
    const price = parseFloat(variant?.price || '0');

    if (existingIndex >= 0) {
      // Update quantity
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].updatedAt = Date.now();
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `item_${Date.now()}`,
        productId: product.id,
        product,
        variantIndex,
        quantity,
        price,
        addedAt: Date.now(),
        updatedAt: Date.now()
      };

      cart.items.push(newItem);
      
      // Store optimistic update
      this.optimisticUpdates.set(newItem.id, newItem);
    }

    // Recalculate totals
    this.calculateTotals(cart);
    cart.updatedAt = Date.now();
    cart.syncStatus = 'pending';

    // Save locally immediately
    await this.saveCart(cart);

    // Sync with server
    this.scheduleSync(cart);

    return cart;
  }

  /**
   * Update item quantity
   */
  async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find(i => i.id === itemId);

    if (!item) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0
      return this.removeItem(userId, itemId);
    }

    // Update quantity
    item.quantity = quantity;
    item.updatedAt = Date.now();

    // Recalculate totals
    this.calculateTotals(cart);
    cart.updatedAt = Date.now();
    cart.syncStatus = 'pending';

    // Save and sync
    await this.saveCart(cart);
    this.scheduleSync(cart);

    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    
    // Remove item
    cart.items = cart.items.filter(item => item.id !== itemId);
    
    // Remove from optimistic updates
    this.optimisticUpdates.delete(itemId);

    // Recalculate totals
    this.calculateTotals(cart);
    cart.updatedAt = Date.now();
    cart.syncStatus = 'pending';

    // Save and sync
    await this.saveCart(cart);
    this.scheduleSync(cart);

    return cart;
  }

  /**
   * Clear cart
   */
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    
    cart.items = [];
    cart.total = 0;
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.discount = 0;
    cart.couponCode = undefined;
    cart.updatedAt = Date.now();
    cart.syncStatus = 'pending';

    // Clear optimistic updates
    this.optimisticUpdates.clear();

    // Save and sync
    await this.saveCart(cart);
    this.scheduleSync(cart);

    return cart;
  }

  /**
   * Apply coupon
   */
  async applyCoupon(userId: string, couponCode: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    try {
      // Validate coupon with server
      const response = await fetch(`/api/vouchers/${couponCode}`);
      if (!response.ok) {
        throw new Error('Invalid coupon code');
      }

      const coupon = await response.json();
      
      // Apply discount
      cart.couponCode = couponCode;
      cart.discount = this.calculateDiscount(cart.subtotal, coupon);
      
      // Recalculate totals
      this.calculateTotals(cart);
      cart.updatedAt = Date.now();
      cart.syncStatus = 'pending';

      // Save and sync
      await this.saveCart(cart);
      this.scheduleSync(cart);

      return cart;
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      throw error;
    }
  }

  /**
   * Calculate cart totals
   */
  private calculateTotals(cart: Cart): void {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate tax (10% for example)
    cart.tax = cart.subtotal * 0.1;
    
    // Calculate shipping (free above 500, else 50)
    cart.shipping = cart.subtotal > 500 ? 0 : 50;
    
    // Calculate total
    cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount;
  }

  /**
   * Calculate discount from coupon
   */
  private calculateDiscount(subtotal: number, coupon: any): number {
    if (coupon.type === 'percentage') {
      return subtotal * (coupon.value / 100);
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.value, subtotal);
    }
    return 0;
  }

  /**
   * Save cart to cache
   */
  private async saveCart(cart: Cart): Promise<void> {
    this.currentCart = cart;
    
    await cacheManager.set('cart', cart.userId, cart, {
      priority: 'high',
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  /**
   * Schedule sync with debounce
   */
  private scheduleSync(cart: Cart): void {
    // Clear existing timer
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    // Schedule sync after 2 seconds of inactivity
    this.syncTimer = setTimeout(() => {
      this.syncWithServer(cart);
    }, 2000);
  }

  /**
   * Sync cart with server
   */
  private async syncWithServer(cart: Cart): Promise<void> {
    if (!navigator.onLine) {
      console.log('Offline, cart sync queued');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
      });

      if (response.ok) {
        const serverCart = await response.json();
        
        // Merge with server cart
        const mergedCart = await this.mergeCart(cart, serverCart);
        mergedCart.syncStatus = 'synced';
        
        await this.saveCart(mergedCart);
        console.log('Cart synced successfully');
      } else {
        console.error('Cart sync failed:', response.statusText);
        cart.syncStatus = 'conflict';
        await this.saveCart(cart);
      }
    } catch (error) {
      console.error('Cart sync error:', error);
      cart.syncStatus = 'pending';
      await this.saveCart(cart);
    }
  }

  /**
   * Sync in background
   */
  private async syncInBackground(userId: string): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const response = await fetch(`/api/cart?userId=${userId}`);
      if (response.ok) {
        const serverCart = await response.json();
        
        if (this.currentCart && this.currentCart.updatedAt < serverCart.updatedAt) {
          // Server cart is newer, update local
          this.currentCart = serverCart;
          await this.saveCart(serverCart);
        }
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Merge local and server cart
   */
  private async mergeCart(local: Cart, server: Cart): Promise<Cart> {
    // Simple merge strategy: combine items, prefer local for conflicts
    const mergedItems = new Map<string, CartItem>();

    // Add server items
    for (const item of server.items) {
      const key = `${item.productId}_${item.variantIndex}`;
      mergedItems.set(key, item);
    }

    // Add/update with local items (local wins)
    for (const item of local.items) {
      const key = `${item.productId}_${item.variantIndex}`;
      const serverItem = mergedItems.get(key);
      
      if (serverItem) {
        // Merge quantities or use most recent
        if (item.updatedAt > serverItem.updatedAt) {
          mergedItems.set(key, item);
        }
      } else {
        mergedItems.set(key, item);
      }
    }

    // Create merged cart
    const merged: Cart = {
      ...local,
      items: Array.from(mergedItems.values()),
      updatedAt: Date.now()
    };

    // Recalculate totals
    this.calculateTotals(merged);

    return merged;
  }

  /**
   * Create empty cart
   */
  private createEmptyCart(userId: string): Cart {
    return {
      id: `cart_${userId}_${Date.now()}`,
      userId,
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      updatedAt: Date.now(),
      syncStatus: 'synced'
    };
  }

  /**
   * Get cart count
   */
  async getCartCount(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get cart value
   */
  async getCartValue(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.total;
  }

  /**
   * Migrate guest cart to user cart
   */
  async migrateGuestCart(guestId: string, userId: string): Promise<Cart> {
    const guestCart = await this.getCart(guestId);
    const userCart = await this.getCart(userId);

    if (guestCart.items.length > 0) {
      // Merge guest items into user cart
      for (const item of guestCart.items) {
        const existingIndex = userCart.items.findIndex(
          i => i.productId === item.productId && i.variantIndex === item.variantIndex
        );

        if (existingIndex >= 0) {
          userCart.items[existingIndex].quantity += item.quantity;
        } else {
          userCart.items.push(item);
        }
      }

      // Recalculate and save
      this.calculateTotals(userCart);
      userCart.updatedAt = Date.now();
      userCart.syncStatus = 'pending';
      
      await this.saveCart(userCart);
      this.scheduleSync(userCart);

      // Clear guest cart
      await cacheManager.delete('cart', guestId);
    }

    return userCart;
  }
}

// Export singleton instance
export const cartCache = new CartCache();
export default cartCache;
