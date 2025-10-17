import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertWishlistItemSchema, insertOrderSchema, insertUserSchema, insertAddressSchema, walletTransactions } from "@shared/schema";
import { z } from "zod";
import { db } from "../db";

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
      res.json(userWithoutPassword);
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

  const httpServer = createServer(app);
  return httpServer;
}
