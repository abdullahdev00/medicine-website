import { db } from "../db";
import { 
  users, products, categories, wishlistItems, orders, addresses, walletTransactions,
  paymentAccounts, paymentRequests,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Category, type InsertCategory,
  type WishlistItem, type InsertWishlistItem,
  type Order, type InsertOrder,
  type Address, type InsertAddress,
  type WalletTransaction, type InsertWalletTransaction,
  type PaymentAccount, type InsertPaymentAccount,
  type PaymentRequest, type InsertPaymentRequest
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined>;
  
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  getWishlistItems(userId: string): Promise<WishlistItem[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: string): Promise<void>;
  
  getOrders(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;
  
  getWalletTransactions(userId: string): Promise<WalletTransaction[]>;
  
  getAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, updates: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<void>;
  
  getPaymentAccounts(): Promise<PaymentAccount[]>;
  
  getPaymentRequests(userId: string): Promise<PaymentRequest[]>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  updatePaymentRequestStatus(id: string, status: string, adminNotes?: string): Promise<PaymentRequest | undefined>;
  
  clearCart(userId: string): Promise<void>;
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
    let affiliateCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      affiliateCode = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await db.select().from(users).where(eq(users.affiliateCode, affiliateCode)).limit(1);
      if (existing.length === 0) {
        isUnique = true;
      }
    }
    
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({ 
      ...insertUser, 
      password: hashedPassword,
      affiliateCode: affiliateCode!
    }).returning();
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
      sql`SELECT id::text as id, name, category_id::text as category_id, description, 
          image_url, rating, variants, in_stock::boolean as in_stock, created_at 
          FROM products ORDER BY created_at DESC`
    );
    return result.rows.map(row => ({
      ...row,
      categoryId: (row as any).category_id,
      imageUrl: (row as any).image_url,
      variants: (row as any).variants,
      inStock: (row as any).in_stock === true || (row as any).in_stock === 't',
      createdAt: (row as any).created_at,
    })) as Product[];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.execute<Product>(
      sql`SELECT id::text as id, name, category_id::text as category_id, description, 
          image_url, rating, variants, in_stock::boolean as in_stock, created_at 
          FROM products WHERE id = ${id}::uuid LIMIT 1`
    );
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0];
    return {
      ...row,
      categoryId: (row as any).category_id,
      imageUrl: (row as any).image_url,
      variants: (row as any).variants,
      inStock: (row as any).in_stock === true || (row as any).in_stock === 't',
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

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
    return await db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt));
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const result = await db.insert(addresses).values(address).returning();
    return result[0];
  }

  async updateAddress(id: string, updates: Partial<InsertAddress>): Promise<Address | undefined> {
    const result = await db.update(addresses)
      .set(updates)
      .where(eq(addresses.id, id))
      .returning();
    return result[0];
  }

  async deleteAddress(id: string): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  async getPaymentAccounts(): Promise<PaymentAccount[]> {
    return await db.select().from(paymentAccounts).where(eq(paymentAccounts.isActive, true));
  }

  async getPaymentRequests(userId: string): Promise<PaymentRequest[]> {
    return await db.select().from(paymentRequests).where(eq(paymentRequests.userId, userId)).orderBy(desc(paymentRequests.createdAt));
  }

  async createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest> {
    const result = await db.insert(paymentRequests).values(request).returning();
    return result[0];
  }

  async updatePaymentRequestStatus(id: string, status: string, adminNotes?: string): Promise<PaymentRequest | undefined> {
    const result = await db.update(paymentRequests)
      .set({ status, adminNotes, updatedAt: new Date() })
      .where(eq(paymentRequests.id, id))
      .returning();
    return result[0];
  }

  async clearCart(userId: string): Promise<void> {
  }
}

export const storage = new DatabaseStorage();
