import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

async function seedDatabase() {
  try {
    console.log("🌱 Starting comprehensive database seeding...");

    console.log("\n📋 Step 1: Creating categories...");
    const categoryData = [
      { name: "Pain Relief", icon: "Zap", description: "Medications for pain management" },
      { name: "Vitamins & Supplements", icon: "Pill", description: "Essential vitamins and dietary supplements" },
      { name: "Cold & Flu", icon: "Thermometer", description: "Medicines for cold and flu symptoms" },
      { name: "Diabetes Care", icon: "Activity", description: "Products for diabetes management" },
      { name: "First Aid", icon: "Heart", description: "Emergency medical supplies" },
      { name: "Personal Care", icon: "Droplets", description: "Personal hygiene products" },
    ];

    const categories = await db.insert(schema.categories)
      .values(categoryData)
      .returning();
    console.log(`✅ Created ${categories.length} categories`);

    const categoryMap = new Map(categories.map(c => [c.name, c.id]));

    console.log("\n👤 Step 2: Creating test user and referred users...");
    
    const hashedPassword = await bcrypt.hash("test123", 10);
    
    const testUser = await db.insert(schema.users)
      .values({
        fullName: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        phoneNumber: "+92-300-1234567",
        whatsappNumber: "+92-300-1234567",
        address: "House 123, Street 5, F-8",
        city: "Islamabad",
        province: "Islamabad Capital Territory",
        postalCode: "44000",
        affiliateCode: "TEST2024",
        walletBalance: "5000.00",
        totalEarnings: "2500.00",
        pendingEarnings: "500.00",
        isPartner: true,
      })
      .returning();
    console.log(`✅ Created test user: ${testUser[0].email}`);

    const referredUsers = await db.insert(schema.users)
      .values([
        {
          fullName: "John Doe",
          email: "john@example.com",
          password: hashedPassword,
          phoneNumber: "+92-300-2345678",
          affiliateCode: "JOHN2024",
          referredBy: testUser[0].id,
        },
        {
          fullName: "Sarah Khan",
          email: "sarah@example.com",
          password: hashedPassword,
          phoneNumber: "+92-300-3456789",
          affiliateCode: "SARAH2024",
          referredBy: testUser[0].id,
        },
        {
          fullName: "Ali Ahmed",
          email: "ali@example.com",
          password: hashedPassword,
          phoneNumber: "+92-300-4567890",
          affiliateCode: "ALI2024",
          referredBy: testUser[0].id,
        },
        {
          fullName: "Fatima Hassan",
          email: "fatima@example.com",
          password: hashedPassword,
          phoneNumber: "+92-300-5678901",
          affiliateCode: "FATIMA2024",
          referredBy: testUser[0].id,
        },
        {
          fullName: "Ahmed Raza",
          email: "ahmed@example.com",
          password: hashedPassword,
          phoneNumber: "+92-300-6789012",
          affiliateCode: "AHMED2024",
          referredBy: testUser[0].id,
        },
      ])
      .returning();
    console.log(`✅ Created ${referredUsers.length} referred users`);

    console.log("\n🏢 Step 3: Creating partner record...");
    await db.insert(schema.partners)
      .values({
        userId: testUser[0].id,
        programType: "supplier",
        businessName: "MediSwift Partner Store",
        businessType: "Pharmacy",
        commissionRate: "15.00",
        totalSales: "10000.00",
        status: "active",
      });
    console.log("✅ Created partner record");

    console.log("\n📊 Step 4: Creating referral stats...");
    await db.insert(schema.referralStats)
      .values({
        userId: testUser[0].id,
        totalReferrals: 5,
        totalOrders: 12,
        totalCommission: "2500.00",
      });
    console.log("✅ Created referral stats");

    console.log("\n🏠 Step 5: Creating addresses...");
    await db.insert(schema.addresses)
      .values([
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

    console.log("\n🛍️ Step 6: Creating products...");
    const productData = [
      {
        name: "Panadol Extra",
        categoryId: categoryMap.get("Pain Relief")!,
        description: "Fast relief for headaches, fever, and body aches. Extra strength formula.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        rating: "4.5",
        variants: [
          { name: "10 Tablets", price: "150", wholesalePrice: "120" },
          { name: "20 Tablets", price: "280", wholesalePrice: "220" },
          { name: "30 Tablets", price: "400", wholesalePrice: "320" },
        ],
        inStock: true,
      },
      {
        name: "Brufen 400mg",
        categoryId: categoryMap.get("Pain Relief")!,
        description: "Ibuprofen for pain relief and anti-inflammatory action.",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop",
        rating: "4.4",
        variants: [
          { name: "10 Tablets", price: "180", wholesalePrice: "140" },
          { name: "20 Tablets", price: "340", wholesalePrice: "270" },
        ],
        inStock: true,
      },
      {
        name: "Multivitamin Complex",
        categoryId: categoryMap.get("Vitamins & Supplements")!,
        description: "Complete daily multivitamin supporting overall health and energy.",
        imageUrl: "https://images.unsplash.com/photo-1606791405792-1004f1718d0d?w=400&h=400&fit=crop",
        rating: "4.8",
        variants: [
          { name: "30 Capsules", price: "850", wholesalePrice: "680" },
          { name: "60 Capsules", price: "1500", wholesalePrice: "1200" },
          { name: "90 Capsules", price: "2100", wholesalePrice: "1680" },
        ],
        inStock: true,
      },
      {
        name: "Vitamin D3 5000 IU",
        categoryId: categoryMap.get("Vitamins & Supplements")!,
        description: "High-potency vitamin D for bone health and immune support.",
        imageUrl: "https://images.unsplash.com/photo-1550572017-4257a8c37e4f?w=400&h=400&fit=crop",
        rating: "4.7",
        variants: [
          { name: "30 Tablets", price: "650", wholesalePrice: "520" },
          { name: "60 Tablets", price: "1200", wholesalePrice: "960" },
        ],
        inStock: true,
      },
      {
        name: "Cold Relief Syrup",
        categoryId: categoryMap.get("Cold & Flu")!,
        description: "Effective relief for cough, cold, and flu symptoms.",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
        rating: "4.3",
        variants: [
          { name: "60ml", price: "220", wholesalePrice: "175" },
          { name: "120ml", price: "390", wholesalePrice: "310" },
        ],
        inStock: true,
      },
      {
        name: "Antihistamine Tablets",
        categoryId: categoryMap.get("Cold & Flu")!,
        description: "Relief from allergies, hay fever, and cold symptoms.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        rating: "4.5",
        variants: [
          { name: "10 Tablets", price: "170", wholesalePrice: "135" },
          { name: "20 Tablets", price: "320", wholesalePrice: "255" },
        ],
        inStock: true,
      },
      {
        name: "Blood Glucose Monitor Kit",
        categoryId: categoryMap.get("Diabetes Care")!,
        description: "Complete kit for monitoring blood glucose levels at home.",
        imageUrl: "https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=400&h=400&fit=crop",
        rating: "4.9",
        variants: [
          { name: "With 50 Test Strips", price: "3500", wholesalePrice: "2800" },
          { name: "With 100 Test Strips", price: "5200", wholesalePrice: "4160" },
        ],
        inStock: true,
      },
      {
        name: "Insulin Syringes 1ml",
        categoryId: categoryMap.get("Diabetes Care")!,
        description: "Sterile insulin syringes with ultra-fine needles.",
        imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop",
        rating: "4.6",
        variants: [
          { name: "10 Pack", price: "450", wholesalePrice: "360" },
          { name: "30 Pack", price: "1250", wholesalePrice: "1000" },
        ],
        inStock: true,
      },
      {
        name: "First Aid Kit Complete",
        categoryId: categoryMap.get("First Aid")!,
        description: "Comprehensive first aid kit for home and travel.",
        imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop",
        rating: "4.8",
        variants: [
          { name: "Basic Kit", price: "1200", wholesalePrice: "960" },
          { name: "Premium Kit", price: "2500", wholesalePrice: "2000" },
        ],
        inStock: true,
      },
      {
        name: "Antiseptic Solution",
        categoryId: categoryMap.get("First Aid")!,
        description: "Antiseptic solution for cleaning wounds and preventing infection.",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
        rating: "4.5",
        variants: [
          { name: "100ml", price: "180", wholesalePrice: "145" },
          { name: "250ml", price: "390", wholesalePrice: "310" },
        ],
        inStock: true,
      },
      {
        name: "Hand Sanitizer",
        categoryId: categoryMap.get("Personal Care")!,
        description: "70% alcohol-based sanitizer that kills 99.9% of germs.",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&h=400&fit=crop",
        rating: "4.7",
        variants: [
          { name: "250ml", price: "320", wholesalePrice: "255" },
          { name: "500ml", price: "550", wholesalePrice: "440" },
        ],
        inStock: true,
      },
      {
        name: "Face Masks",
        categoryId: categoryMap.get("Personal Care")!,
        description: "3-layer surgical face masks for protection.",
        imageUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&h=400&fit=crop",
        rating: "4.6",
        variants: [
          { name: "50 Pack", price: "850", wholesalePrice: "680" },
          { name: "100 Pack", price: "1600", wholesalePrice: "1280" },
        ],
        inStock: true,
      },
    ];

    const products = await db.insert(schema.products)
      .values(productData.map((p: any) => ({
        ...p,
        images: [p.imageUrl],
        imageUrl: undefined,
      })))
      .returning();
    console.log(`✅ Created ${products.length} products`);

    console.log("\n💚 Step 7: Creating wishlist items...");
    await db.insert(schema.wishlistItems)
      .values([
        { userId: testUser[0].id, productId: products[1].id },
        { userId: testUser[0].id, productId: products[4].id },
        { userId: testUser[0].id, productId: products[6].id },
        { userId: testUser[0].id, productId: products[11].id },
      ]);
    console.log("✅ Created 4 wishlist items");

    console.log("\n📦 Step 8: Creating orders...");
    const orders = await db.insert(schema.orders)
      .values([
        {
          userId: testUser[0].id,
          products: [{
            productId: products[0].id,
            name: "Panadol Extra",
            quantity: 1,
            price: "280",
            variantName: "20 Tablets",
          }],
          totalPrice: "280",
          deliveryAddress: "House 123, Street 5, F-8, Islamabad",
          paymentMethod: "cod",
          status: "delivered",
          expectedDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          userId: testUser[0].id,
          products: [
            {
              productId: products[2].id,
              name: "Multivitamin Complex",
              quantity: 1,
              price: "850",
              variantName: "30 Capsules",
            },
            {
              productId: products[3].id,
              name: "Vitamin D3 5000 IU",
              quantity: 1,
              price: "650",
              variantName: "30 Tablets",
            },
          ],
          totalPrice: "1500",
          deliveryAddress: "House 123, Street 5, F-8, Islamabad",
          paymentMethod: "wallet",
          paidFromWallet: "1500",
          status: "delivered",
          expectedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          userId: testUser[0].id,
          products: [{
            productId: products[8].id,
            name: "First Aid Kit Complete",
            quantity: 1,
            price: "1200",
            variantName: "Basic Kit",
          }],
          totalPrice: "1200",
          deliveryAddress: "Office 456, Blue Area, Islamabad",
          paymentMethod: "cod",
          status: "in_transit",
          expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          userId: testUser[0].id,
          products: [{
            productId: products[10].id,
            name: "Hand Sanitizer",
            quantity: 3,
            price: "550",
            variantName: "500ml",
          }],
          totalPrice: "1650",
          deliveryAddress: "House 123, Street 5, F-8, Islamabad",
          paymentMethod: "wallet",
          paidFromWallet: "1650",
          status: "pending",
          expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      ])
      .returning();
    console.log(`✅ Created ${orders.length} orders`);

    console.log("\n💰 Step 9: Creating wallet transactions...");
    await db.insert(schema.walletTransactions)
      .values([
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
          orderId: orders[0].id,
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
          orderId: orders[1].id,
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
          description: "Partner commission (pending)",
          status: "pending",
        },
      ]);
    console.log("✅ Created 7 wallet transactions");

    console.log("\n🏦 Step 10: Creating payment accounts...");
    await db.insert(schema.paymentAccounts)
      .values([
        {
          method: "JazzCash",
          accountName: "MediSwift JazzCash",
          accountNumber: "03001234567",
          isActive: true,
        },
        {
          method: "EasyPaisa",
          accountName: "MediSwift EasyPaisa",
          accountNumber: "03007654321",
          isActive: true,
        },
        {
          method: "Bank Transfer",
          accountName: "MediSwift - Allied Bank",
          accountNumber: "0010123456789",
          isActive: true,
        },
      ]);
    console.log("✅ Created 3 payment accounts");

    console.log("\n💳 Step 11: Creating user payment account...");
    await db.insert(schema.userPaymentAccounts)
      .values({
        userId: testUser[0].id,
        accountName: "Test User",
        raastId: "testuser@jazzcash",
        isDefault: true,
      });
    console.log("✅ Created user payment account");

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: test@example.com");
    console.log("   Password: test123");
    console.log("\n🎉 All demo data has been created!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log("👋 Seeding process complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
