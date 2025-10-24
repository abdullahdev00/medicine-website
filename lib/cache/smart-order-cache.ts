/**
 * Smart Order Cache - Intelligent order management with static/dynamic separation
 * Features: Static completed orders, Dynamic pending orders, Smart status checking
 */

import { cacheManager } from './cache-manager';
import { dbManager } from './db-manager';

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  shippingAddress: any;
  billingAddress: any;
  paymentInfo: any;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  cancelledAt?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantIndex: number;
  quantity: number;
  price: number;
  total: number;
}

export interface PendingOrderRef {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped';
  total: number;
  createdAt: number;
  lastChecked: number;
  needsUpdate: boolean;
}

class SmartOrderCache {
  private pendingOrdersCache: Map<string, Order> = new Map();
  private lastFetchTime: number = 0;
  private fetchCooldown: number = 30000; // 30 seconds

  /**
   * Get all orders for user with smart caching
   */
  async getUserOrders(userId: string, forceRefresh = false): Promise<Order[]> {
    const allOrders: Order[] = [];

    try {
      // 1. Get completed/cancelled orders from cache (static data)
      const completedOrders = await this.getCompletedOrders(userId);
      allOrders.push(...completedOrders);

      // 2. Get pending orders with smart fetching
      const pendingOrders = await this.getPendingOrders(userId, forceRefresh);
      allOrders.push(...pendingOrders);

      // Sort by creation date (newest first)
      return allOrders.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Failed to get user orders:', error);
      return allOrders; // Return what we have
    }
  }

  /**
   * Get completed/cancelled orders from cache (never expires)
   */
  private async getCompletedOrders(userId: string): Promise<Order[]> {
    try {
      const cached = await dbManager.getAll<Order>('completed_orders');
      return cached.filter(order => order.userId === userId);
    } catch (error) {
      console.error('Failed to get completed orders:', error);
      return [];
    }
  }

  /**
   * Get pending orders with smart fetching
   */
  private async getPendingOrders(userId: string, forceRefresh = false): Promise<Order[]> {
    try {
      // Check if we need to fetch from API
      const shouldFetch = forceRefresh || 
                         (Date.now() - this.lastFetchTime > this.fetchCooldown) ||
                         await this.hasPendingOrdersNeedingUpdate(userId);

      if (shouldFetch && navigator.onLine) {
        return await this.fetchPendingOrdersFromAPI(userId);
      } else {
        // Return from memory cache if available
        const memoryOrders = Array.from(this.pendingOrdersCache.values())
          .filter(order => order.userId === userId);
        
        if (memoryOrders.length > 0) {
          return memoryOrders;
        }

        // Fallback: try to fetch if we have no data
        if (navigator.onLine) {
          return await this.fetchPendingOrdersFromAPI(userId);
        }
      }

      return [];
    } catch (error) {
      console.error('Failed to get pending orders:', error);
      return [];
    }
  }

  /**
   * Check if we have pending orders that need status updates
   */
  private async hasPendingOrdersNeedingUpdate(userId: string): Promise<boolean> {
    try {
      const refs = await dbManager.getAll<PendingOrderRef>('pending_order_refs');
      const userRefs = refs.filter(ref => ref.userId === userId);
      
      // Check if any pending order hasn't been checked recently
      const staleThreshold = Date.now() - 60000; // 1 minute
      return userRefs.some(ref => ref.lastChecked < staleThreshold);
    } catch (error) {
      return true; // Assume we need update on error
    }
  }

  /**
   * Fetch pending orders from API
   */
  private async fetchPendingOrdersFromAPI(userId: string): Promise<Order[]> {
    try {
      console.log('Fetching pending orders from API...');
      
      const response = await fetch(`/api/orders?userId=${userId}&status=pending,processing,shipped`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const orders: Order[] = await response.json();
      this.lastFetchTime = Date.now();

      // Process each order
      const pendingOrders: Order[] = [];
      const completedOrders: Order[] = [];

      for (const order of orders) {
        if (order.status === 'completed' || order.status === 'cancelled') {
          // Move to completed orders cache
          completedOrders.push(order);
          await this.cacheCompletedOrder(order);
          
          // Remove from pending refs
          await dbManager.delete('pending_order_refs', order.id);
        } else {
          // Keep as pending
          pendingOrders.push(order);
          await this.updatePendingOrderRef(order);
          
          // Cache in memory for quick access
          this.pendingOrdersCache.set(order.id, order);
        }
      }

      console.log(`Processed ${pendingOrders.length} pending, ${completedOrders.length} completed orders`);
      return pendingOrders;
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
      throw error;
    }
  }

  /**
   * Cache completed order permanently
   */
  private async cacheCompletedOrder(order: Order): Promise<void> {
    try {
      // Set completion timestamp
      if (order.status === 'completed' && !order.completedAt) {
        order.completedAt = Date.now();
      }
      if (order.status === 'cancelled' && !order.cancelledAt) {
        order.cancelledAt = Date.now();
      }

      // Store in completed orders (permanent cache)
      await dbManager.put('completed_orders', order, order.id, 365 * 24 * 60 * 60 * 1000); // 1 year

      console.log(`Cached completed order: ${order.id}`);
    } catch (error) {
      console.error(`Failed to cache completed order ${order.id}:`, error);
    }
  }

  /**
   * Update pending order reference
   */
  private async updatePendingOrderRef(order: Order): Promise<void> {
    try {
      const ref: PendingOrderRef = {
        id: order.id,
        userId: order.userId,
        status: order.status as 'pending' | 'processing' | 'shipped',
        total: order.total,
        createdAt: order.createdAt,
        lastChecked: Date.now(),
        needsUpdate: false
      };

      await dbManager.put('pending_order_refs', ref, order.id);
    } catch (error) {
      console.error(`Failed to update pending order ref ${order.id}:`, error);
    }
  }

  /**
   * Get single order with smart caching
   */
  async getOrder(orderId: string, userId: string): Promise<Order | null> {
    try {
      // First check completed orders cache
      const completed = await dbManager.get<Order>('completed_orders', orderId);
      if (completed && completed.userId === userId) {
        return completed;
      }

      // Check memory cache for pending orders
      const pending = this.pendingOrdersCache.get(orderId);
      if (pending && pending.userId === userId) {
        return pending;
      }

      // Check if it's a known pending order
      const ref = await dbManager.get<PendingOrderRef>('pending_order_refs', orderId);
      if (ref && ref.userId === userId) {
        // Fetch from API
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const order = await response.json();
          
          // Update cache based on status
          if (order.status === 'completed' || order.status === 'cancelled') {
            await this.cacheCompletedOrder(order);
            await dbManager.delete('pending_order_refs', orderId);
          } else {
            this.pendingOrdersCache.set(orderId, order);
            await this.updatePendingOrderRef(order);
          }
          
          return order;
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to get order ${orderId}:`, error);
      return null;
    }
  }

  /**
   * Mark order for status check
   */
  async markOrderForUpdate(orderId: string): Promise<void> {
    try {
      const ref = await dbManager.get<PendingOrderRef>('pending_order_refs', orderId);
      if (ref) {
        ref.needsUpdate = true;
        ref.lastChecked = 0; // Force update
        await dbManager.put('pending_order_refs', ref, orderId);
      }
    } catch (error) {
      console.error(`Failed to mark order for update ${orderId}:`, error);
    }
  }

  /**
   * Clean up old pending order references
   */
  async cleanupOldRefs(): Promise<void> {
    try {
      const refs = await dbManager.getAll<PendingOrderRef>('pending_order_refs');
      const oldThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
      
      let deletedCount = 0;
      for (const ref of refs) {
        if (ref.lastChecked < oldThreshold) {
          await dbManager.delete('pending_order_refs', ref.id);
          this.pendingOrdersCache.delete(ref.id);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old pending order references`);
      }
    } catch (error) {
      console.error('Failed to cleanup old refs:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    completedOrders: number;
    pendingOrderRefs: number;
    memoryCache: number;
  }> {
    try {
      const completed = await dbManager.getAll('completed_orders');
      const pending = await dbManager.getAll('pending_order_refs');

      return {
        completedOrders: completed.length,
        pendingOrderRefs: pending.length,
        memoryCache: this.pendingOrdersCache.size
      };
    } catch (error) {
      console.error('Failed to get order cache stats:', error);
      return {
        completedOrders: 0,
        pendingOrderRefs: 0,
        memoryCache: 0
      };
    }
  }

  /**
   * Clear all order caches
   */
  async clearCache(): Promise<void> {
    try {
      await dbManager.clear('completed_orders');
      await dbManager.clear('pending_order_refs');
      this.pendingOrdersCache.clear();
      this.lastFetchTime = 0;
      console.log('Order cache cleared');
    } catch (error) {
      console.error('Failed to clear order cache:', error);
    }
  }
}

// Export singleton instance
export const smartOrderCache = new SmartOrderCache();
export default smartOrderCache;
