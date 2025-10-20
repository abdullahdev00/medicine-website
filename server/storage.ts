import { db } from "../db";
import { 
  users, products, categories, wishlistItems, orders, addresses, walletTransactions,
  paymentAccounts, paymentRequests, userPaymentAccounts, admins, activityLogs, partners,
  vouchers, userVouchers, partnerApplications,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Category, type InsertCategory,
  type WishlistItem, type InsertWishlistItem,
  type Order, type InsertOrder,
  type Address, type InsertAddress,
  type WalletTransaction, type InsertWalletTransaction,
  type PaymentAccount, type InsertPaymentAccount,
  type PaymentRequest, type InsertPaymentRequest,
  type UserPaymentAccount, type InsertUserPaymentAccount,
  type Admin, type InsertAdmin,
  type ActivityLog, type InsertActivityLog,
  type Partner,
  type Voucher, type InsertVoucher,
  type UserVoucher, type InsertUserVoucher,
  type PartnerApplication, type InsertPartnerApplication
} from "@shared/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import bcrypt from "bcrypt";
import { cache } from "./cache";

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
  
  getUserPaymentAccounts(userId: string): Promise<UserPaymentAccount[]>;
  getAllUserPaymentAccounts(): Promise<UserPaymentAccount[]>;
  createUserPaymentAccount(account: InsertUserPaymentAccount): Promise<UserPaymentAccount>;
  updateUserPaymentAccount(id: string, updates: Partial<InsertUserPaymentAccount>): Promise<UserPaymentAccount | undefined>;
  deleteUserPaymentAccount(id: string): Promise<void>;
  
  getPaymentRequests(userId: string): Promise<PaymentRequest[]>;
  getAllPaymentRequests(): Promise<PaymentRequest[]>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  updatePaymentRequestStatus(id: string, status: string, adminNotes?: string, rejectionReason?: string): Promise<PaymentRequest | undefined>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminById(id: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdminLastLogin(id: string): Promise<void>;
  
  logActivity(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  
  getAllUsers(): Promise<User[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  
  clearCart(userId: string): Promise<void>;
  
  getAdminStats(): Promise<any>;
  getAllPartners(): Promise<any[]>;
  toggleUserStatus(userId: string, isActive: boolean): Promise<void>;
  updatePaymentRequest(id: string, status: string, rejectionReason?: string): Promise<PaymentRequest | undefined>;
  adminLogin(email: string, password: string): Promise<Admin | null>;
  
  getActiveVouchers(): Promise<Voucher[]>;
  getVoucherByCode(code: string): Promise<Voucher | undefined>;
  getUserVouchers(userId: string): Promise<UserVoucher[]>;
  createUserVoucher(userVoucher: InsertUserVoucher): Promise<UserVoucher>;
  
  createPartnerApplication(application: InsertPartnerApplication): Promise<PartnerApplication>;
  getPartnerApplicationsByUser(userId: string): Promise<PartnerApplication[]>;
  getPartnerApplicationByUserAndProgram(userId: string, programType: string): Promise<PartnerApplication | undefined>;
  getAllPartnerApplications(): Promise<PartnerApplication[]>;
  updatePartnerApplicationStatus(id: string, status: string, rejectionReason?: string, adminNotes?: string): Promise<PartnerApplication | undefined>;
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
    const cacheKey = 'categories:all';
    const cached = cache.get<Category[]>(cacheKey);
    if (cached) return cached;
    
    const result = await db.select().from(categories);
    cache.set(cacheKey, result, 10 * 60 * 1000); // Cache for 10 minutes
    return result;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    cache.invalidate('categories:all'); // Invalidate cache when creating
    return result[0];
  }

  async getProducts(): Promise<Product[]> {
    const cacheKey = 'products:all';
    const cached = cache.get<Product[]>(cacheKey);
    if (cached) return cached;
    
    const result = await db.select().from(products).orderBy(desc(products.createdAt));
    cache.set(cacheKey, result, 5 * 60 * 1000); // Cache for 5 minutes
    return result;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const cacheKey = `product:${id}`;
    const cached = cache.get<Product>(cacheKey);
    if (cached) return cached;
    
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (result.length === 0) return undefined;
    const product = result[0];
    cache.set(cacheKey, product, 5 * 60 * 1000); // Cache for 5 minutes
    return product;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    cache.invalidate('products:all'); // Invalidate cache when creating
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

  async getUserPaymentAccounts(userId: string): Promise<UserPaymentAccount[]> {
    return await db.select().from(userPaymentAccounts).where(eq(userPaymentAccounts.userId, userId)).orderBy(desc(userPaymentAccounts.isDefault));
  }

  async getAllUserPaymentAccounts(): Promise<UserPaymentAccount[]> {
    return await db.select().from(userPaymentAccounts);
  }

  async createUserPaymentAccount(account: InsertUserPaymentAccount): Promise<UserPaymentAccount> {
    if (account.isDefault) {
      await db.update(userPaymentAccounts)
        .set({ isDefault: false })
        .where(eq(userPaymentAccounts.userId, account.userId));
    }
    const result = await db.insert(userPaymentAccounts).values(account).returning();
    return result[0];
  }

  async updateUserPaymentAccount(id: string, updates: Partial<InsertUserPaymentAccount>): Promise<UserPaymentAccount | undefined> {
    if (updates.isDefault) {
      const account = await db.select().from(userPaymentAccounts).where(eq(userPaymentAccounts.id, id)).limit(1);
      if (account[0]) {
        await db.update(userPaymentAccounts)
          .set({ isDefault: false })
          .where(eq(userPaymentAccounts.userId, account[0].userId));
      }
    }
    const result = await db.update(userPaymentAccounts)
      .set(updates)
      .where(eq(userPaymentAccounts.id, id))
      .returning();
    return result[0];
  }

  async deleteUserPaymentAccount(id: string): Promise<void> {
    await db.delete(userPaymentAccounts).where(eq(userPaymentAccounts.id, id));
  }

  async getPaymentRequests(userId: string): Promise<PaymentRequest[]> {
    return await db.select().from(paymentRequests).where(eq(paymentRequests.userId, userId)).orderBy(desc(paymentRequests.createdAt));
  }

  async createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest> {
    const result = await db.insert(paymentRequests).values(request).returning();
    
    // If this is a withdraw request, deduct from user's wallet balance
    if (request.type === "withdraw") {
      const user = await this.getUser(request.userId);
      if (user) {
        const newBalance = parseFloat(user.walletBalance) - parseFloat(request.amount);
        await db.update(users)
          .set({ walletBalance: newBalance.toString() })
          .where(eq(users.id, request.userId));
        
        // Create debit transaction
        await db.insert(walletTransactions).values({
          userId: request.userId,
          type: "debit",
          amount: request.amount,
          description: `Withdrawal request - ${request.paymentMethod}`,
          status: "completed",
        });
      }
    }
    
    return result[0];
  }

  async updatePaymentRequestStatus(id: string, status: string, adminNotes?: string, rejectionReason?: string): Promise<PaymentRequest | undefined> {
    const result = await db.update(paymentRequests)
      .set({ status, adminNotes, rejectionReason, updatedAt: new Date() })
      .where(eq(paymentRequests.id, id))
      .returning();
    return result[0];
  }

  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const result = await db.insert(walletTransactions).values(transaction).returning();
    return result[0];
  }

  async clearCart(userId: string): Promise<void> {
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    return result[0];
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
    return result[0];
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(insertAdmin.password, 10);
    const result = await db.insert(admins).values({ 
      ...insertAdmin, 
      password: hashedPassword
    }).returning();
    return result[0];
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await db.update(admins)
      .set({ lastLogin: new Date() })
      .where(eq(admins.id, id));
  }

  async logActivity(log: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs).values(log).returning();
    return result[0];
  }

  async getActivityLogs(limit: number = 100): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getAllPaymentRequests(): Promise<PaymentRequest[]> {
    return await db.select().from(paymentRequests).orderBy(desc(paymentRequests.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    
    // Invalidate caches
    cache.invalidate('products:all');
    cache.invalidate(`product:${id}`);
    
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
    
    // Invalidate caches
    cache.invalidate('products:all');
    cache.invalidate(`product:${id}`);
  }

  async getAdminStats(): Promise<any> {
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalProducts = await db.select({ count: count() }).from(products);
    const totalOrders = await db.select({ count: count() }).from(orders);
    const pendingOrders = await db.select({ count: count() }).from(orders).where(eq(orders.status, 'pending'));
    const pendingPayments = await db.select({ count: count() }).from(paymentRequests).where(eq(paymentRequests.status, 'pending'));
    const activePartners = await db.select({ count: count() }).from(partners).where(eq(partners.status, 'active'));

    const revenueResult = await db.execute<{ total: string }>(
      sql`SELECT COALESCE(SUM(total_price::numeric), 0)::text as total FROM orders WHERE status = 'delivered'`
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newUsersToday = await db.select({ count: count() }).from(users)
      .where(sql`${users.createdAt} >= ${todayStart}`);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalProducts: totalProducts[0]?.count || 0,
      totalOrders: totalOrders[0]?.count || 0,
      pendingOrders: pendingOrders[0]?.count || 0,
      totalRevenue: (revenueResult[0] as any)?.total || '0',
      pendingPayments: pendingPayments[0]?.count || 0,
      activePartners: activePartners[0]?.count || 0,
      newUsersToday: newUsersToday[0]?.count || 0,
    };
  }

  async getAllPartners(): Promise<any[]> {
    const result = await db.execute<any>(
      sql`SELECT 
        p.id::text as id,
        p.user_id::text as "userId",
        p.business_name as "businessName",
        p.business_type as "businessType",
        p.commission_rate as "commissionRate",
        p.total_sales as "totalSales",
        p.status,
        p.created_at as "createdAt",
        u.full_name,
        u.email,
        u.phone_number
      FROM partners p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC`
    );

    return (result as any[]).map((row: any) => ({
      id: row.id,
      userId: row.userId,
      businessName: row.businessName,
      businessType: row.businessType,
      commissionRate: row.commissionRate,
      totalSales: row.totalSales,
      status: row.status,
      createdAt: row.createdAt,
      user: {
        fullName: row.full_name,
        email: row.email,
        phoneNumber: row.phone_number,
      },
    }));
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    await db.update(users)
      .set({ isPartner: isActive })
      .where(eq(users.id, userId));
  }

  async updatePaymentRequest(id: string, status: string, rejectionReason?: string): Promise<PaymentRequest | undefined> {
    const result = await db.update(paymentRequests)
      .set({ 
        status, 
        rejectionReason: rejectionReason || null,
        updatedAt: new Date()
      })
      .where(eq(paymentRequests.id, id))
      .returning();
    return result[0];
  }

  async adminLogin(email: string, password: string): Promise<Admin | null> {
    const admin = await this.getAdminByEmail(email);
    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return null;
    }

    await this.updateAdminLastLogin(admin.id);
    return admin;
  }

  async getActiveVouchers(): Promise<Voucher[]> {
    return await db.select().from(vouchers)
      .where(and(
        eq(vouchers.isActive, true),
        sql`(expiry_date IS NULL OR expiry_date > NOW())`
      ))
      .orderBy(desc(vouchers.createdAt));
  }

  async getVoucherByCode(code: string): Promise<Voucher | undefined> {
    const result = await db.select().from(vouchers).where(eq(vouchers.code, code)).limit(1);
    return result[0];
  }

  async getUserVouchers(userId: string): Promise<UserVoucher[]> {
    return await db.select().from(userVouchers)
      .where(eq(userVouchers.userId, userId))
      .orderBy(desc(userVouchers.createdAt));
  }

  async createUserVoucher(userVoucher: InsertUserVoucher): Promise<UserVoucher> {
    const result = await db.insert(userVouchers).values(userVoucher).returning();
    return result[0];
  }

  async createPartnerApplication(application: InsertPartnerApplication): Promise<PartnerApplication> {
    const result = await db.insert(partnerApplications).values(application).returning();
    return result[0];
  }

  async getPartnerApplicationsByUser(userId: string): Promise<PartnerApplication[]> {
    return await db.select().from(partnerApplications)
      .where(eq(partnerApplications.userId, userId))
      .orderBy(desc(partnerApplications.createdAt));
  }

  async getPartnerApplicationByUserAndProgram(userId: string, programType: string): Promise<PartnerApplication | undefined> {
    const result = await db.select().from(partnerApplications)
      .where(and(
        eq(partnerApplications.userId, userId),
        eq(partnerApplications.programType, programType)
      ))
      .limit(1);
    return result[0];
  }

  async getAllPartnerApplications(): Promise<PartnerApplication[]> {
    return await db.select().from(partnerApplications)
      .orderBy(desc(partnerApplications.createdAt));
  }

  async updatePartnerApplicationStatus(
    id: string, 
    status: string, 
    rejectionReason?: string, 
    adminNotes?: string
  ): Promise<PartnerApplication | undefined> {
    const result = await db.update(partnerApplications)
      .set({ 
        status, 
        rejectionReason: rejectionReason || null,
        adminNotes: adminNotes || null,
        updatedAt: new Date()
      })
      .where(eq(partnerApplications.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
