import { db } from "../db";
import { 
  users, products, categories, cartItems, wishlistItems, orders,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Category, type InsertCategory,
  type CartItem, type InsertCartItem,
  type WishlistItem, type InsertWishlistItem,
  type Order, type InsertOrder
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  getWishlistItems(userId: string): Promise<WishlistItem[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: string): Promise<void>;
  
  getOrders(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const affiliateCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const result = await db.insert(users).values({ ...insertUser, affiliateCode }).returning();
    return result[0];
  }

  async getCategories(): Promise<Category[]> {
    const result = await db.execute<Category>(sql`SELECT id::text as id, name, icon, description FROM categories`);
    return result.rows as Category[];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async getProducts(): Promise<Product[]> {
    const result = await db.execute<Product>(
      sql`SELECT id::text as id, name, category_id::text as category_id, price, description, 
          image_url, rating, package_options, in_stock, created_at 
          FROM products ORDER BY created_at DESC`
    );
    return result.rows.map(row => ({
      ...row,
      categoryId: (row as any).category_id,
      imageUrl: (row as any).image_url,
      packageOptions: (row as any).package_options,
      inStock: (row as any).in_stock,
      createdAt: (row as any).created_at,
    })) as Product[];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.execute<Product>(
      sql`SELECT id::text as id, name, category_id::text as category_id, price, description, 
          image_url, rating, package_options, in_stock, created_at 
          FROM products WHERE id = ${id}::uuid LIMIT 1`
    );
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0];
    return {
      ...row,
      categoryId: (row as any).category_id,
      imageUrl: (row as any).image_url,
      packageOptions: (row as any).package_options,
      inStock: (row as any).in_stock,
      createdAt: (row as any).created_at,
    } as Product;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existing = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.userId, item.userId),
        eq(cartItems.productId, item.productId)
      ))
      .limit(1);

    if (existing.length > 0) {
      const newQuantity = (existing[0].quantity || 0) + (item.quantity || 1);
      const updated = await db.update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const result = await db.insert(cartItems).values(item).returning();
    return result[0];
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const result = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return result[0];
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const result = await db.insert(wishlistItems).values(item).returning();
    return result[0];
  }

  async removeFromWishlist(id: string): Promise<void> {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }

  async getOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }
}

export const storage = new DatabaseStorage();
