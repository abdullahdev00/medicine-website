import { db } from "../db";
import {
  users,
  categories,
  products,
  addresses,
  wishlistItems,
  orders,
  walletTransactions,
  partners,
  referralStats,
  paymentAccounts,
  admins,
} from "@shared/schema";
import { count } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("🌱 Starting database seed...");
    console.log("");

    // Check if database is already seeded
    const existingProducts = await db.select({ count: count() }).from(products);
    if (existingProducts[0]?.count && existingProducts[0].count > 0) {
      console.log("ℹ️  Database already contains data. Skipping seed...");
      console.log("💡 To re-seed, manually delete all data from tables first.");
      return;
    }

    // 1. Create Admin User
    console.log("Creating admin user...");
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const [admin] = await db
      .insert(admins)
      .values({
        fullName: "Admin User",
        email: "admin@karoo.com",
        password: hashedAdminPassword,
        isActive: true,
      })
      .returning();
    console.log(`✅ Admin created: ${admin.email} / admin123`);

    // 2. Create Test Users
    console.log("Creating test users...");
    const hashedUserPassword = await bcrypt.hash("test123", 10);

    const [testUser] = await db
      .insert(users)
      .values({
        fullName: "Test User",
        email: "test@karoo.com",
        password: hashedUserPassword,
        phoneNumber: "+92-300-1234567",
        whatsappNumber: "+92-300-1234567",
        address: "123 Main Street, Block A",
        city: "Karachi",
        province: "Sindh",
        postalCode: "75500",
        affiliateCode: "TEST123",
        walletBalance: "5000.00",
        totalEarnings: "12500.00",
        pendingEarnings: "2500.00",
        isPartner: true,
      })
      .returning();

    const [user2] = await db
      .insert(users)
      .values({
        fullName: "Ahmed Ali",
        email: "ahmed@karoo.com",
        password: hashedUserPassword,
        phoneNumber: "+92-301-9876543",
        whatsappNumber: "+92-301-9876543",
        address: "456 Green Avenue",
        city: "Lahore",
        province: "Punjab",
        postalCode: "54000",
        affiliateCode: "AHMED789",
        referredBy: testUser.id,
        walletBalance: "2500.00",
        totalEarnings: "8500.00",
        pendingEarnings: "1500.00",
        isPartner: false,
      })
      .returning();

    const [user3] = await db
      .insert(users)
      .values({
        fullName: "Fatima Khan",
        email: "fatima@karoo.com",
        password: hashedUserPassword,
        phoneNumber: "+92-333-5555555",
        whatsappNumber: "+92-333-5555555",
        address: "789 Park Road",
        city: "Islamabad",
        province: "Islamabad Capital Territory",
        postalCode: "44000",
        affiliateCode: "FATIMA456",
        referredBy: testUser.id,
        walletBalance: "3200.00",
        totalEarnings: "6800.00",
        pendingEarnings: "900.00",
        isPartner: false,
      })
      .returning();

    console.log(`✅ Created 3 test users (password: test123)`);

    // 3. Create Categories
    console.log("Creating product categories...");
    const categoriesData = [
      {
        name: "Pain Relief",
        icon: "pill",
        description: "Pain relief and anti-inflammatory medications",
      },
      {
        name: "Vitamins & Supplements",
        icon: "capsule",
        description: "Essential vitamins and dietary supplements",
      },
      {
        name: "First Aid",
        icon: "bandage",
        description: "First aid supplies and wound care",
      },
      {
        name: "Cold & Flu",
        icon: "thermometer",
        description: "Cold, flu, and allergy relief",
      },
      {
        name: "Digestive Health",
        icon: "stomach",
        description: "Digestive aids and stomach care",
      },
      {
        name: "Personal Care",
        icon: "heart",
        description: "Personal hygiene and wellness products",
      },
    ];

    const insertedCategories = await db
      .insert(categories)
      .values(categoriesData)
      .returning();
    console.log(`✅ Created ${insertedCategories.length} categories`);

    // 4. Create Products
    console.log("Creating products...");
    const productsData = [
      {
        name: "Paracetamol Extra Strength",
        categoryId: insertedCategories[0].id,
        description:
          "Extra strength pain relief for headaches, muscle aches, and fever. Fast-acting formula provides effective relief.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.5",
        variants: [
          { name: "24 Tablets", price: "89.99", wholesalePrice: "65.00" },
          { name: "48 Tablets", price: "159.99", wholesalePrice: "120.00" },
        ],
        inStock: true,
      },
      {
        name: "Ibuprofen 400mg",
        categoryId: insertedCategories[0].id,
        description:
          "Anti-inflammatory pain relief for arthritis, back pain, and inflammation.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.7",
        variants: [
          { name: "20 Tablets", price: "99.99", wholesalePrice: "75.00" },
          { name: "40 Tablets", price: "179.99", wholesalePrice: "135.00" },
        ],
        inStock: true,
      },
      {
        name: "Multivitamin Daily",
        categoryId: insertedCategories[1].id,
        description:
          "Complete daily multivitamin with essential vitamins and minerals for overall health and wellness.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.6",
        variants: [
          { name: "30 Capsules", price: "249.99", wholesalePrice: "180.00" },
          { name: "60 Capsules", price: "449.99", wholesalePrice: "320.00" },
        ],
        inStock: true,
      },
      {
        name: "Vitamin C 1000mg",
        categoryId: insertedCategories[1].id,
        description:
          "High-potency vitamin C for immune support and antioxidant protection.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.8",
        variants: [
          { name: "30 Tablets", price: "199.99", wholesalePrice: "145.00" },
          { name: "60 Tablets", price: "359.99", wholesalePrice: "260.00" },
        ],
        inStock: true,
      },
      {
        name: "First Aid Kit Premium",
        categoryId: insertedCategories[2].id,
        description:
          "Comprehensive first aid kit with bandages, antiseptics, and essential medical supplies.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.9",
        variants: [
          { name: "Small Kit", price: "599.99", wholesalePrice: "450.00" },
          { name: "Large Kit", price: "999.99", wholesalePrice: "750.00" },
        ],
        inStock: true,
      },
      {
        name: "Antiseptic Spray",
        categoryId: insertedCategories[2].id,
        description:
          "Fast-acting antiseptic spray for cleaning wounds and preventing infection.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.4",
        variants: [
          { name: "50ml", price: "89.99", wholesalePrice: "65.00" },
          { name: "100ml", price: "149.99", wholesalePrice: "110.00" },
        ],
        inStock: true,
      },
      {
        name: "Cold & Flu Relief",
        categoryId: insertedCategories[3].id,
        description:
          "Multi-symptom cold and flu relief for congestion, cough, and fever.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.5",
        variants: [
          { name: "24 Tablets", price: "129.99", wholesalePrice: "95.00" },
          { name: "48 Tablets", price: "229.99", wholesalePrice: "170.00" },
        ],
        inStock: true,
      },
      {
        name: "Cough Syrup",
        categoryId: insertedCategories[3].id,
        description:
          "Soothing cough syrup for dry and wet coughs with honey flavor.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.3",
        variants: [
          { name: "100ml", price: "119.99", wholesalePrice: "85.00" },
          { name: "200ml", price: "199.99", wholesalePrice: "145.00" },
        ],
        inStock: true,
      },
      {
        name: "Probiotic Digestive Support",
        categoryId: insertedCategories[4].id,
        description:
          "Advanced probiotic formula for digestive health and gut flora balance.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.7",
        variants: [
          { name: "30 Capsules", price: "299.99", wholesalePrice: "220.00" },
          { name: "60 Capsules", price: "549.99", wholesalePrice: "400.00" },
        ],
        inStock: true,
      },
      {
        name: "Antacid Tablets",
        categoryId: insertedCategories[4].id,
        description:
          "Fast-acting antacid for heartburn and acid indigestion relief.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.2",
        variants: [
          { name: "24 Tablets", price: "79.99", wholesalePrice: "55.00" },
          { name: "48 Tablets", price: "139.99", wholesalePrice: "100.00" },
        ],
        inStock: true,
      },
      {
        name: "Hand Sanitizer Gel",
        categoryId: insertedCategories[5].id,
        description:
          "70% alcohol hand sanitizer gel for effective germ protection.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.6",
        variants: [
          { name: "50ml", price: "49.99", wholesalePrice: "35.00" },
          { name: "250ml", price: "149.99", wholesalePrice: "110.00" },
          { name: "500ml", price: "249.99", wholesalePrice: "180.00" },
        ],
        inStock: true,
      },
      {
        name: "Face Masks (Surgical)",
        categoryId: insertedCategories[5].id,
        description:
          "Disposable 3-ply surgical face masks for everyday protection.",
        images: ["/placeholder-medicine.jpg"],
        rating: "4.5",
        variants: [
          { name: "50 Pack", price: "299.99", wholesalePrice: "220.00" },
          { name: "100 Pack", price: "549.99", wholesalePrice: "400.00" },
        ],
        inStock: true,
      },
    ];

    const insertedProducts = await db
      .insert(products)
      .values(productsData)
      .returning();
    console.log(`✅ Created ${insertedProducts.length} products`);

    // 5. Create Addresses
    console.log("Creating addresses...");
    await db.insert(addresses).values([
      {
        userId: testUser.id,
        label: "Home",
        address: "123 Main Street, Block A",
        city: "Karachi",
        province: "Sindh",
        postalCode: "75500",
        isDefault: true,
      },
      {
        userId: testUser.id,
        label: "Office",
        address: "456 Business Center, Floor 5",
        city: "Karachi",
        province: "Sindh",
        postalCode: "75600",
        isDefault: false,
      },
      {
        userId: user2.id,
        label: "Home",
        address: "456 Green Avenue",
        city: "Lahore",
        province: "Punjab",
        postalCode: "54000",
        isDefault: true,
      },
    ]);
    console.log("✅ Created 3 addresses");

    // 6. Create Wishlist Items
    console.log("Creating wishlist items...");
    await db.insert(wishlistItems).values([
      { userId: testUser.id, productId: insertedProducts[0].id },
      { userId: testUser.id, productId: insertedProducts[2].id },
      { userId: user2.id, productId: insertedProducts[1].id },
      { userId: user2.id, productId: insertedProducts[3].id },
    ]);
    console.log("✅ Created 4 wishlist items");

    // 7. Create Orders
    console.log("Creating sample orders...");
    const [order1] = await db
      .insert(orders)
      .values({
        userId: testUser.id,
        products: [
          {
            productId: insertedProducts[0].id,
            name: insertedProducts[0].name,
            quantity: 2,
            price: "89.99",
            variantName: "24 Tablets",
          },
          {
            productId: insertedProducts[1].id,
            name: insertedProducts[1].name,
            quantity: 1,
            price: "99.99",
            variantName: "20 Tablets",
          },
        ],
        totalPrice: "279.97",
        deliveryAddress: "123 Main Street, Block A, Karachi, Sindh - 75500",
        paymentMethod: "cod",
        status: "delivered",
        expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      })
      .returning();

    await db.insert(orders).values([
      {
        userId: testUser.id,
        products: [
          {
            productId: insertedProducts[2].id,
            name: insertedProducts[2].name,
            quantity: 1,
            price: "249.99",
            variantName: "30 Capsules",
          },
        ],
        totalPrice: "249.99",
        deliveryAddress: "123 Main Street, Block A, Karachi, Sindh - 75500",
        paymentMethod: "wallet",
        paidFromWallet: "249.99",
        status: "processing",
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user2.id,
        products: [
          {
            productId: insertedProducts[3].id,
            name: insertedProducts[3].name,
            quantity: 2,
            price: "199.99",
            variantName: "30 Tablets",
          },
        ],
        totalPrice: "399.98",
        deliveryAddress: "456 Green Avenue, Lahore, Punjab - 54000",
        paymentMethod: "cod",
        status: "pending",
        expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log("✅ Created 3 orders");

    // 8. Create Wallet Transactions
    console.log("Creating wallet transactions...");
    await db.insert(walletTransactions).values([
      {
        userId: testUser.id,
        type: "credit",
        amount: "5000.00",
        description: "Initial wallet balance",
        status: "completed",
      },
      {
        userId: testUser.id,
        type: "debit",
        amount: "249.99",
        description: "Payment for order",
        orderId: order1.id,
        status: "completed",
      },
      {
        userId: testUser.id,
        type: "credit",
        amount: "500.00",
        description: "Affiliate commission earned",
        status: "completed",
      },
      {
        userId: user2.id,
        type: "credit",
        amount: "2500.00",
        description: "Initial wallet balance",
        status: "completed",
      },
    ]);
    console.log("✅ Created 4 wallet transactions");

    // 9. Create Partner Record
    console.log("Creating partner records...");
    await db.insert(partners).values({
      userId: testUser.id,
      programType: "wholesale",
      businessName: "MediCare Pharmacy",
      businessType: "Pharmacy",
      commissionRate: "15.00",
      totalSales: "125000.00",
      status: "active",
    });
    console.log("✅ Created 1 partner record");

    // 10. Create Referral Stats
    console.log("Creating referral statistics...");
    await db.insert(referralStats).values([
      {
        userId: testUser.id,
        totalReferrals: 2,
        totalOrders: 5,
        totalCommission: "2500.00",
      },
      {
        userId: user2.id,
        totalReferrals: 0,
        totalOrders: 1,
        totalCommission: "0.00",
      },
    ]);
    console.log("✅ Created referral statistics");

    // 11. Create Payment Accounts
    console.log("Creating payment accounts...");
    await db.insert(paymentAccounts).values([
      {
        method: "Bank Transfer",
        accountName: "MediSwift Pakistan Ltd",
        accountNumber: "PK12BANK0000123456789012",
        isActive: true,
      },
      {
        method: "JazzCash",
        accountName: "MediSwift Pakistan",
        accountNumber: "03001234567",
        isActive: true,
      },
      {
        method: "EasyPaisa",
        accountName: "MediSwift Pakistan",
        accountNumber: "03009876543",
        isActive: true,
      },
    ]);
    console.log("✅ Created 3 payment accounts");

    console.log("");
    console.log("🎉 Database seeded successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  👤 Admin User:");
    console.log("     Email: admin@karoo.com");
    console.log("     Password: admin123");
    console.log("     Access: /admin");
    console.log("");
    console.log("  👥 Test Users (Password: test123):");
    console.log("     • test@karoo.com (Partner)");
    console.log("     • ahmed@karoo.com");
    console.log("     • fatima@karoo.com");
    console.log("");
    console.log(`  📦 Products: ${insertedProducts.length}`);
    console.log(`  🏷️  Categories: ${insertedCategories.length}`);
    console.log(`  📍 Addresses: 3`);
    console.log(`  ❤️  Wishlist Items: 4`);
    console.log(`  🛒 Orders: 3`);
    console.log(`  💰 Wallet Transactions: 4`);
    console.log(`  🤝 Partners: 1`);
    console.log(`  💳 Payment Accounts: 3`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
