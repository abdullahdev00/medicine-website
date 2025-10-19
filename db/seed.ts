import { db } from "./index";
import {
  categories,
  products,
  users,
  admins,
  addresses,
  wishlistItems,
  orders,
  walletTransactions,
  partners,
  referralStats,
  paymentAccounts,
  userPaymentAccounts,
  paymentRequests,
} from "@shared/schema";
import { count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Check if data already exists
    const productCount = await db.select({ count: count() }).from(products);
    if (productCount[0]?.count && productCount[0].count > 0) {
      console.log("ℹ️  Database already seeded. Skipping...");
      return;
    }

    // 1. Create Admin User
    console.log("Creating admin user...");
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const adminResult = await db.insert(admins).values({
      fullName: "Admin User",
      email: "admin@example.com",
      password: hashedAdminPassword,
      isActive: true,
    }).returning();
    console.log(`✅ Created admin user: ${adminResult[0].email}`);

    // 2. Create Test Users
    console.log("Creating test users...");
    const hashedUserPassword = await bcrypt.hash("test123", 10);
    const hashedPartnerPassword = await bcrypt.hash("partner123", 10);

    const testUser = await db.insert(users).values({
      fullName: "Test User",
      email: "test@example.com",
      password: hashedUserPassword,
      phoneNumber: "+92-300-1234567",
      whatsappNumber: "+92-300-1234567",
      affiliateCode: "TEST2024",
      walletBalance: "5000.00",
      totalEarnings: "2500.00",
      pendingEarnings: "500.00",
      isPartner: true,
    }).returning();
    console.log(`✅ Created test user: ${testUser[0].email}`);

    const partnerUser = await db.insert(users).values({
      fullName: "Partner User",
      email: "partner@example.com",
      password: hashedPartnerPassword,
      phoneNumber: "+92-300-9876543",
      whatsappNumber: "+92-300-9876543",
      affiliateCode: "PARTNER2024",
      walletBalance: "10000.00",
      totalEarnings: "5000.00",
      pendingEarnings: "1000.00",
      isPartner: true,
    }).returning();
    console.log(`✅ Created partner user: ${partnerUser[0].email}`);

    // 3. Create Categories
    console.log("Creating categories...");
    const mockCategories = [
      { name: "Pain Relief", icon: "Pill", description: "Medications for pain management" },
      { name: "Vitamins & Supplements", icon: "Heart", description: "Essential vitamins and nutritional supplements" },
      { name: "Cold & Flu", icon: "Thermometer", description: "Medicines for cold and flu symptoms" },
      { name: "First Aid", icon: "Activity", description: "Emergency medical supplies and bandages" },
      { name: "Diabetes Care", icon: "Droplet", description: "Products for diabetes management" },
      { name: "Personal Care", icon: "Sparkles", description: "Personal hygiene and care products" },
    ];

    const createdCategories = await db.insert(categories).values(mockCategories).returning();
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create category map
    const categoryMap = new Map<string, string>();
    createdCategories.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    // 4. Create Products with Variants
    console.log("Creating products...");
    const mockProducts = [
      {
        name: "Panadol Extra",
        categoryId: categoryMap.get("Pain Relief")!,
        description: "Fast relief for headaches, fever, and body aches",
        images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400", "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"],
        rating: "4.5",
        variants: [
          { name: "10 Tablets", price: "150", wholesalePrice: "130" },
          { name: "20 Tablets", price: "280", wholesalePrice: "250" },
          { name: "30 Tablets", price: "400", wholesalePrice: "360" },
        ],
        inStock: true,
      },
      {
        name: "Brufen 400mg",
        categoryId: categoryMap.get("Pain Relief")!,
        description: "Effective pain relief and anti-inflammatory",
        images: ["https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"],
        rating: "4.6",
        variants: [
          { name: "10 Tablets", price: "180", wholesalePrice: "160" },
          { name: "20 Tablets", price: "340", wholesalePrice: "300" },
        ],
        inStock: true,
      },
      {
        name: "Multivitamin Complex",
        categoryId: categoryMap.get("Vitamins & Supplements")!,
        description: "Complete daily multivitamin for overall health",
        images: ["https://images.unsplash.com/photo-1550572017-4257a8c37e4f?w=400", "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400"],
        rating: "4.8",
        variants: [
          { name: "30 Capsules", price: "850", wholesalePrice: "750" },
          { name: "60 Capsules", price: "1500", wholesalePrice: "1350" },
          { name: "90 Capsules", price: "2100", wholesalePrice: "1900" },
        ],
        inStock: true,
      },
      {
        name: "Vitamin D3 5000 IU",
        categoryId: categoryMap.get("Vitamins & Supplements")!,
        description: "Essential vitamin D for bone and immune health",
        images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400", "https://images.unsplash.com/photo-1550572017-4257a8c37e4f?w=400"],
        rating: "4.7",
        variants: [
          { name: "30 Tablets", price: "650", wholesalePrice: "580" },
          { name: "60 Tablets", price: "1200", wholesalePrice: "1080" },
        ],
        inStock: true,
      },
      {
        name: "Cold Relief Syrup",
        categoryId: categoryMap.get("Cold & Flu")!,
        description: "Effective relief for cold and cough symptoms",
        images: ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"],
        rating: "4.4",
        variants: [
          { name: "60ml", price: "220", wholesalePrice: "190" },
          { name: "120ml", price: "390", wholesalePrice: "350" },
        ],
        inStock: true,
      },
      {
        name: "Antihistamine Tablets",
        categoryId: categoryMap.get("Cold & Flu")!,
        description: "Relief from allergies and hay fever",
        images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"],
        rating: "4.5",
        variants: [
          { name: "10 Tablets", price: "170", wholesalePrice: "150" },
          { name: "20 Tablets", price: "320", wholesalePrice: "280" },
        ],
        inStock: true,
      },
      {
        name: "Blood Glucose Monitor Kit",
        categoryId: categoryMap.get("Diabetes Care")!,
        description: "Complete kit for blood sugar monitoring",
        images: ["https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400", "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400"],
        rating: "4.9",
        variants: [
          { name: "With 50 Strips", price: "3500", wholesalePrice: "3200" },
          { name: "With 100 Strips", price: "5200", wholesalePrice: "4800" },
        ],
        inStock: true,
      },
      {
        name: "Insulin Syringes 1ml",
        categoryId: categoryMap.get("Diabetes Care")!,
        description: "Sterile syringes for insulin injection",
        images: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400"],
        rating: "4.6",
        variants: [
          { name: "10 Pack", price: "450", wholesalePrice: "400" },
          { name: "30 Pack", price: "1250", wholesalePrice: "1100" },
        ],
        inStock: true,
      },
      {
        name: "First Aid Kit Complete",
        categoryId: categoryMap.get("First Aid")!,
        description: "Comprehensive first aid supplies",
        images: ["https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"],
        rating: "4.7",
        variants: [
          { name: "Basic", price: "1200", wholesalePrice: "1050" },
          { name: "Premium", price: "2500", wholesalePrice: "2200" },
        ],
        inStock: true,
      },
      {
        name: "Antiseptic Solution",
        categoryId: categoryMap.get("First Aid")!,
        description: "Disinfectant for wounds and cuts",
        images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"],
        rating: "4.5",
        variants: [
          { name: "100ml", price: "180", wholesalePrice: "160" },
          { name: "250ml", price: "390", wholesalePrice: "350" },
        ],
        inStock: true,
      },
      {
        name: "Hand Sanitizer",
        categoryId: categoryMap.get("Personal Care")!,
        description: "70% alcohol-based hand sanitizer",
        images: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400", "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"],
        rating: "4.6",
        variants: [
          { name: "250ml", price: "320", wholesalePrice: "280" },
          { name: "500ml", price: "550", wholesalePrice: "490" },
        ],
        inStock: true,
      },
      {
        name: "Face Masks",
        categoryId: categoryMap.get("Personal Care")!,
        description: "Medical grade face masks",
        images: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400"],
        rating: "4.7",
        variants: [
          { name: "50 Pack", price: "850", wholesalePrice: "750" },
          { name: "100 Pack", price: "1600", wholesalePrice: "1400" },
        ],
        inStock: true,
      },
    ];

    const createdProducts = await db.insert(products).values(mockProducts).returning();
    console.log(`✅ Created ${createdProducts.length} products`);

    // 5. Create Addresses
    console.log("Creating addresses...");
    await db.insert(addresses).values([
      {
        userId: testUser[0].id,
        label: "Home",
        address: "House 123, Street 5, F-8",
        city: "Islamabad",
        province: "Islamabad Capital Territory",
        postalCode: "44000",
        isDefault: true,
      },
      {
        userId: testUser[0].id,
        label: "Office",
        address: "Office 456, Blue Area",
        city: "Islamabad",
        province: "Islamabad Capital Territory",
        postalCode: "44000",
        isDefault: false,
      },
      {
        userId: testUser[0].id,
        label: "Parents Home",
        address: "House 789, G-11/2",
        city: "Islamabad",
        province: "Islamabad Capital Territory",
        postalCode: "44000",
        isDefault: false,
      },
    ]);
    console.log("✅ Created 3 addresses");

    // 6. Create Wishlist Items
    console.log("Creating wishlist items...");
    await db.insert(wishlistItems).values([
      { userId: testUser[0].id, productId: createdProducts[1].id },
      { userId: testUser[0].id, productId: createdProducts[4].id },
      { userId: testUser[0].id, productId: createdProducts[6].id },
      { userId: testUser[0].id, productId: createdProducts[11].id },
    ]);
    console.log("✅ Created 4 wishlist items");

    // 7. Create Orders
    console.log("Creating orders...");
    const order1 = await db.insert(orders).values({
      userId: testUser[0].id,
      products: [
        {
          productId: createdProducts[0].id,
          name: "Panadol Extra",
          quantity: 2,
          price: "280",
          variantName: "20 Tablets",
        },
      ],
      totalPrice: "280",
      deliveryAddress: "House 123, Street 5, F-8, Islamabad",
      paymentMethod: "Cash on Delivery",
      status: "delivered",
      expectedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }).returning();

    const order2 = await db.insert(orders).values({
      userId: testUser[0].id,
      products: [
        {
          productId: createdProducts[2].id,
          name: "Multivitamin Complex",
          quantity: 1,
          price: "850",
          variantName: "30 Capsules",
        },
        {
          productId: createdProducts[3].id,
          name: "Vitamin D3 5000 IU",
          quantity: 1,
          price: "650",
          variantName: "30 Tablets",
        },
      ],
      totalPrice: "1500",
      deliveryAddress: "House 123, Street 5, F-8, Islamabad",
      paymentMethod: "Wallet Payment",
      paidFromWallet: "1500",
      status: "delivered",
      expectedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }).returning();

    const order3 = await db.insert(orders).values({
      userId: testUser[0].id,
      products: [
        {
          productId: createdProducts[8].id,
          name: "First Aid Kit Complete",
          quantity: 1,
          price: "1200",
          variantName: "Basic",
        },
      ],
      totalPrice: "1200",
      deliveryAddress: "Office 456, Blue Area, Islamabad",
      paymentMethod: "Cash on Delivery",
      status: "shipped",
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    }).returning();

    const order4 = await db.insert(orders).values({
      userId: testUser[0].id,
      products: [
        {
          productId: createdProducts[10].id,
          name: "Hand Sanitizer",
          quantity: 3,
          price: "550",
          variantName: "500ml",
        },
      ],
      totalPrice: "1650",
      deliveryAddress: "House 123, Street 5, F-8, Islamabad",
      paymentMethod: "Wallet Payment",
      paidFromWallet: "1650",
      status: "processing",
      expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    }).returning();

    const order5 = await db.insert(orders).values({
      userId: testUser[0].id,
      products: [
        {
          productId: createdProducts[4].id,
          name: "Cold Relief Syrup",
          quantity: 1,
          price: "220",
          variantName: "60ml",
        },
      ],
      totalPrice: "220",
      deliveryAddress: "House 123, Street 5, F-8, Islamabad",
      paymentMethod: "Cash on Delivery",
      status: "pending",
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    }).returning();

    console.log("✅ Created 5 orders");

    // 8. Create Wallet Transactions
    console.log("Creating wallet transactions...");
    await db.insert(walletTransactions).values([
      {
        userId: testUser[0].id,
        type: "credit",
        amount: "2000",
        description: "Welcome bonus credited",
        status: "completed",
      },
      {
        userId: testUser[0].id,
        type: "credit",
        amount: "500",
        description: "Affiliate commission earned",
        status: "completed",
      },
      {
        userId: testUser[0].id,
        type: "debit",
        amount: "500",
        description: "Payment for order",
        orderId: order1[0].id,
        status: "completed",
      },
      {
        userId: testUser[0].id,
        type: "credit",
        amount: "1500",
        description: "Referral bonus - 3 successful referrals",
        status: "completed",
      },
      {
        userId: testUser[0].id,
        type: "debit",
        amount: "1000",
        description: "Payment for order",
        orderId: order2[0].id,
        status: "completed",
      },
      {
        userId: testUser[0].id,
        type: "credit",
        amount: "1500",
        description: "Top-up via bank transfer",
        status: "completed",
      },
      {
        userId: testUser[0].id,
        type: "credit",
        amount: "500",
        description: "Partner commission",
        status: "pending",
      },
    ]);
    console.log("✅ Created 7 wallet transactions");

    // 9. Create Partners
    console.log("Creating partners...");
    await db.insert(partners).values([
      {
        userId: testUser[0].id,
        programType: "affiliate",
        businessName: "MediCare Pharmacy",
        businessType: "Pharmacy",
        commissionRate: "15",
        totalSales: "25000",
        status: "active",
      },
    ]);
    console.log("✅ Created 1 partner");

    // 10. Create Referral Stats
    console.log("Creating referral stats...");
    await db.insert(referralStats).values([
      {
        userId: testUser[0].id,
        totalReferrals: 5,
        totalOrders: 12,
        totalCommission: "2500",
      },
    ]);
    console.log("✅ Created referral stats");

    // 11. Create Payment Accounts
    console.log("Creating payment accounts...");
    const createdPaymentAccounts = await db.insert(paymentAccounts).values([
      {
        method: "JazzCash",
        accountName: "MediSwift Operations",
        accountNumber: "03001234567",
        isActive: true,
      },
      {
        method: "EasyPaisa",
        accountName: "MediSwift Operations",
        accountNumber: "03001234567",
        isActive: true,
      },
      {
        method: "Raast ID",
        accountName: "MediSwift Operations",
        accountNumber: "mediswift@raast",
        isActive: true,
      },
    ]).returning();
    console.log("✅ Created 3 payment accounts");

    // 12. Create User Payment Accounts
    console.log("Creating user payment accounts...");
    const userPaymentAccount = await db.insert(userPaymentAccounts).values([
      {
        userId: testUser[0].id,
        accountName: "Test User",
        raastId: "testuser@raast",
        isDefault: true,
      },
      {
        userId: partnerUser[0].id,
        accountName: "Partner User",
        raastId: "partner@raast",
        isDefault: true,
      },
    ]).returning();
    console.log("✅ Created 2 user payment accounts");

    // 13. Create Payment Requests
    console.log("Creating payment requests...");
    await db.insert(paymentRequests).values([
      {
        userId: testUser[0].id,
        type: "deposit",
        amount: "5000",
        paymentMethod: "JazzCash",
        paymentAccountId: createdPaymentAccounts[0].id,
        receiptUrl: "https://images.unsplash.com/photo-1554224311-beee180b1a9d?w=400",
        status: "pending",
      },
      {
        userId: testUser[0].id,
        type: "withdrawal",
        amount: "2000",
        paymentMethod: "Raast ID",
        userPaymentAccountId: userPaymentAccount[0].id,
        status: "approved",
        adminNotes: "Approved by admin",
      },
      {
        userId: partnerUser[0].id,
        type: "deposit",
        amount: "3000",
        paymentMethod: "EasyPaisa",
        paymentAccountId: createdPaymentAccounts[1].id,
        receiptUrl: "https://images.unsplash.com/photo-1554224311-beee180b1a9d?w=400",
        status: "pending",
      },
      {
        userId: partnerUser[0].id,
        type: "withdrawal",
        amount: "1500",
        paymentMethod: "Raast ID",
        userPaymentAccountId: userPaymentAccount[1].id,
        status: "rejected",
        rejectionReason: "Insufficient balance",
        adminNotes: "User has insufficient balance for withdrawal",
      },
      {
        userId: testUser[0].id,
        type: "deposit",
        amount: "10000",
        paymentMethod: "JazzCash",
        paymentAccountId: createdPaymentAccounts[0].id,
        receiptUrl: "https://images.unsplash.com/photo-1554224311-beee180b1a9d?w=400",
        status: "approved",
        adminNotes: "Verified and approved",
      },
    ]);
    console.log("✅ Created 5 payment requests");

    console.log("✨ Database seeded successfully!");
    console.log("\n📋 Demo Credentials:");
    console.log("Admin: admin@example.com / admin123");
    console.log("Test User: test@example.com / test123");
    console.log("Partner: partner@example.com / partner123");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("👋 Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
