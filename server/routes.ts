import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertWishlistItemSchema, insertOrderSchema, insertUserSchema, insertAddressSchema, walletTransactions } from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { requireAdmin, type AdminRequest } from "./middleware/adminAuth";

interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  selectedPackage: { name: string; price: string };
}

const inMemoryCart = new Map<string, CartItem[]>();

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId } = req.query;
      let products;
      
      if (categoryId && typeof categoryId === 'string') {
        products = await storage.getProductsByCategory(categoryId);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/wishlist", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const items = await storage.getWishlistItems(userId);
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return { ...item, product };
        })
      );
      
      res.json(itemsWithProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const validatedData = insertWishlistItemSchema.parse(req.body);
      const item = await storage.addToWishlist(validatedData);
      res.status(201).json(item);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      await storage.removeFromWishlist(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.json([]);
      }
      
      const userCart = inMemoryCart.get(userId) || [];
      const cartWithProducts = await Promise.all(
        userCart.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return { ...item, product };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { userId, productId, quantity, selectedPackage } = req.body;
      
      if (!userId || !productId || !quantity || !selectedPackage) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const userCart = inMemoryCart.get(userId) || [];
      const existingItemIndex = userCart.findIndex(
        item => item.productId === productId && item.selectedPackage.name === selectedPackage.name
      );

      if (existingItemIndex >= 0) {
        userCart[existingItemIndex].quantity += quantity;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random()}`,
          userId,
          productId,
          quantity,
          selectedPackage,
        };
        userCart.push(newItem);
      }

      inMemoryCart.set(userId, userCart);
      res.json({ success: true, cart: userCart });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const userCart = inMemoryCart.get(userId) || [];
      const updatedCart = userCart.filter(item => item.id !== req.params.id);
      inMemoryCart.set(userId, updatedCart);
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      inMemoryCart.delete(userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const { quantity } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const userCart = inMemoryCart.get(userId) || [];
      const itemIndex = userCart.findIndex(item => item.id === req.params.id);
      
      if (itemIndex >= 0) {
        userCart[itemIndex].quantity = quantity;
        inMemoryCart.set(userId, userCart);
        res.json(userCart[itemIndex]);
      } else {
        res.status(404).json({ message: "Cart item not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      
      const expectedDelivery = new Date();
      expectedDelivery.setDate(expectedDelivery.getDate() + 3);
      
      // If payment is from wallet or online with wallet balance, deduct balance and create transaction
      const paidFromWallet = parseFloat(validatedData.paidFromWallet || "0");
      if (paidFromWallet > 0) {
        const user = await storage.getUser(validatedData.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        const currentBalance = parseFloat(user.walletBalance || "0");
        
        if (currentBalance < paidFromWallet) {
          return res.status(400).json({ message: "Insufficient wallet balance" });
        }
        
        // Deduct from wallet
        const newBalance = (currentBalance - paidFromWallet).toFixed(2);
        await storage.updateUser(validatedData.userId, {
          walletBalance: newBalance
        });
      }
      
      const order = await storage.createOrder({
        ...validatedData,
        expectedDelivery,
      });
      
      // Create wallet transaction if payment is from wallet
      if (paidFromWallet > 0) {
        await db.insert(walletTransactions).values({
          userId: validatedData.userId,
          type: "debit",
          amount: paidFromWallet.toString(),
          description: `Payment for Order #${order.id.slice(0, 8)}`,
          orderId: order.id,
          status: "completed"
        });
      }
      
      inMemoryCart.delete(validatedData.userId);
      
      res.status(201).json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // First check if this is an admin login
      const admin = await storage.getAdminByEmail(email);
      if (admin) {
        const bcrypt = await import("bcrypt");
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        await storage.updateAdminLastLogin(admin.id);
        const { password: _, ...adminWithoutPassword } = admin;
        return res.json({ ...adminWithoutPassword, userType: "admin" });
      }
      
      // Otherwise check regular user login
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const bcrypt = await import("bcrypt");
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, userType: "user" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/wallet/:userId", async (req, res) => {
    try {
      const transactions = await storage.getWalletTransactions(req.params.userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/addresses", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      const addresses = await storage.getAddresses(userId);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const validatedData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(validatedData);
      res.status(201).json(address);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/addresses/:id", async (req, res) => {
    try {
      const address = await storage.updateAddress(req.params.id, req.body);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      await storage.deleteAddress(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/payment-accounts", async (req, res) => {
    try {
      const accounts = await storage.getPaymentAccounts();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user-payment-accounts", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      const accounts = await storage.getUserPaymentAccounts(userId);
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user-payment-accounts", async (req, res) => {
    try {
      const account = await storage.createUserPaymentAccount(req.body);
      res.status(201).json(account);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user-payment-accounts/:id", async (req, res) => {
    try {
      const account = await storage.updateUserPaymentAccount(req.params.id, req.body);
      if (!account) {
        return res.status(404).json({ message: "User payment account not found" });
      }
      res.json(account);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/user-payment-accounts/:id", async (req, res) => {
    try {
      await storage.deleteUserPaymentAccount(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/payment-requests", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      const requests = await storage.getPaymentRequests(userId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payment-requests", async (req, res) => {
    try {
      console.log("Payment request received:", req.body);
      const request = await storage.createPaymentRequest(req.body);
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Payment request error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/payment-requests/:id", async (req, res) => {
    try {
      const { status, adminNotes, rejectionReason } = req.body;
      const request = await storage.updatePaymentRequestStatus(req.params.id, status, adminNotes, rejectionReason);
      if (!request) {
        return res.status(404).json({ message: "Payment request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Routes
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const orders = await storage.getAllOrders();
      const paymentRequests = await storage.getAllPaymentRequests();
      
      const totalRevenue = orders
        .filter(o => o.status === "delivered")
        .reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
      
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const pendingPayments = paymentRequests.filter(p => p.status === "pending").length;
      
      res.json({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        pendingPayments,
        recentOrders: orders.slice(0, 10),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/payment-requests", async (req, res) => {
    try {
      const requests = await storage.getAllPaymentRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/payment-requests/:id/status", async (req, res) => {
    try {
      const { status, adminNotes, rejectionReason } = req.body;
      const request = await storage.updatePaymentRequestStatus(
        req.params.id,
        status,
        adminNotes,
        rejectionReason
      );
      if (!request) {
        return res.status(404).json({ message: "Payment request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/user-payment-accounts", async (req, res) => {
    try {
      const accounts = await storage.getAllUserPaymentAccounts();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    try {
      const productData = { ...req.body };
      if (productData.imageUrl && !productData.images) {
        productData.images = [productData.imageUrl];
        delete productData.imageUrl;
      }
      const product = await storage.updateProduct(req.params.id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/products", async (req, res) => {
    try {
      const productData = { ...req.body };
      if (productData.imageUrl && !productData.images) {
        productData.images = [productData.imageUrl];
        delete productData.imageUrl;
      }
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/activity-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/activity-logs", async (req, res) => {
    try {
      const log = await storage.logActivity(req.body);
      res.status(201).json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Dashboard Stats (protected)
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Users Management (protected)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/users/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const { isActive } = req.body;
      await storage.toggleUserStatus(req.params.id, isActive);
      res.json({ message: "User status updated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Orders Management (protected)
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Payment Requests (protected)
  app.get("/api/admin/payment-requests", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getAllPaymentRequests();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/payment-requests/:id", requireAdmin, async (req, res) => {
    try {
      const { status, rejectionReason } = req.body;
      const payment = await storage.updatePaymentRequest(req.params.id, status, rejectionReason);
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Partners Management (protected)
  app.get("/api/admin/partners", requireAdmin, async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Login (unprotected)
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.adminLogin(email, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set admin session
      req.session.adminId = admin.id;
      req.session.isAdmin = true;
      
      // Don't send password hash to client
      const { password: _, ...adminData } = admin;
      res.json({ ...adminData, isAdmin: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    req.session.adminId = undefined;
    req.session.isAdmin = undefined;
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/admin/check", requireAdmin, async (req: AdminRequest, res) => {
    try {
      const admin = await storage.getAdminById(req.adminId!);
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
      const { password: _, ...adminData } = admin;
      res.json({ ...adminData, isAdmin: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
