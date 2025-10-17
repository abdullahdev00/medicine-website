import { db } from "../db";
import { users, categories, products, addresses, wishlistItems, orders, walletTransactions, partners, referralStats } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create users with hashed passwords
    const hashedPassword = await bcrypt.hash("test123", 10);
    
    const [testUser] = await db.insert(users).values({
      fullName: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      phoneNumber: "+92-300-1234567",
      whatsappNumber: "+92-300-1234567",
      address: "123 Main Street, Block A",
      city: "Karachi",
      province: "Sindh",
      postalCode: "75500",
      affiliateCode: "TEST2024",
      walletBalance: "5000.00",
      totalEarnings: "12500.00",
      pendingEarnings: "2500.00",
      isPartner: true,
    }).returning();

    const [user2] = await db.insert(users).values({
      fullName: "Ahmed Ali",
      email: "ahmed@example.com",
      password: hashedPassword,
      phoneNumber: "+92-301-9876543",
      whatsappNumber: "+92-301-9876543",
      address: "456 Green Avenue",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54000",
      affiliateCode: "AHMED2024",
      referredBy: testUser.id,
      walletBalance: "2500.00",
      totalEarnings: "8500.00",
      pendingEarnings: "1500.00",
      isPartner: false,
    }).returning();

    const [user3] = await db.insert(users).values({
      fullName: "Fatima Khan",
      email: "fatima@example.com",
      password: hashedPassword,
      phoneNumber: "+92-333-5555555",
      whatsappNumber: "+92-333-5555555",
      address: "789 Park Road",
      city: "Islamabad",
      province: "Islamabad Capital Territory",
      postalCode: "44000",
      affiliateCode: "FATIMA2024",
      referredBy: testUser.id,
      walletBalance: "3200.00",
      totalEarnings: "6800.00",
      pendingEarnings: "900.00",
      isPartner: false,
    }).returning();

    console.log("✅ Users created");

    // Create categories
    const medicineCategories = await db.insert(categories).values([
      {
        name: "Pain Relief",
        icon: "💊",
        description: "Medicines for pain management and relief"
      },
      {
        name: "Vitamins & Supplements",
        icon: "🍊",
        description: "Essential vitamins and dietary supplements"
      },
      {
        name: "Cold & Flu",
        icon: "🤧",
        description: "Treatment for cold, flu and respiratory issues"
      },
      {
        name: "First Aid",
        icon: "🩹",
        description: "First aid supplies and emergency medications"
      },
      {
        name: "Diabetes Care",
        icon: "💉",
        description: "Products for diabetes management"
      },
      {
        name: "Heart Health",
        icon: "❤️",
        description: "Cardiovascular health medications"
      },
    ]).returning();

    console.log("✅ Categories created");

    // Create products with variants
    const productsList = await db.insert(products).values([
      {
        name: "Panadol Extra",
        categoryId: medicineCategories[0].id,
        variants: [
          { name: "10 tablets", price: "100" },
          { name: "20 tablets", price: "180" },
          { name: "30 tablets", price: "250" }
        ],
        description: "Fast relief from headaches, fever and body pain. Contains paracetamol and caffeine.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        rating: "4.50",
        inStock: true,
      },
      {
        name: "Brufen 400mg",
        categoryId: medicineCategories[0].id,
        variants: [
          { name: "10 tablets", price: "150" },
          { name: "20 tablets", price: "280" }
        ],
        description: "Anti-inflammatory pain reliever for muscle pain, arthritis and fever.",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
        rating: "4.30",
        inStock: true,
      },
      {
        name: "Vitamin C 1000mg",
        categoryId: medicineCategories[1].id,
        variants: [
          { name: "30 tablets", price: "350" },
          { name: "60 tablets", price: "650" },
          { name: "90 tablets", price: "900" }
        ],
        description: "Boosts immunity and supports overall health. Essential vitamin supplement.",
        imageUrl: "https://images.unsplash.com/photo-1550572017-4691e2e68b2f?w=400",
        rating: "4.70",
        inStock: true,
      },
      {
        name: "Multivitamin Complex",
        categoryId: medicineCategories[1].id,
        variants: [
          { name: "30 capsules", price: "450" },
          { name: "60 capsules", price: "850" }
        ],
        description: "Complete daily multivitamin with minerals for overall wellness.",
        imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",
        rating: "4.60",
        inStock: true,
      },
      {
        name: "Actifed Syrup",
        categoryId: medicineCategories[2].id,
        variants: [
          { name: "60ml", price: "280" },
          { name: "120ml", price: "480" }
        ],
        description: "Relief from cold, flu symptoms and nasal congestion.",
        imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
        rating: "4.40",
        inStock: true,
      },
      {
        name: "Strepsils Lozenges",
        categoryId: medicineCategories[2].id,
        variants: [
          { name: "12 lozenges", price: "120" },
          { name: "24 lozenges", price: "220" }
        ],
        description: "Soothing relief for sore throat and mouth infections.",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
        rating: "4.20",
        inStock: true,
      },
      {
        name: "First Aid Kit",
        categoryId: medicineCategories[3].id,
        variants: [
          { name: "Basic", price: "950" },
          { name: "Advanced", price: "1850" }
        ],
        description: "Complete first aid kit with bandages, antiseptics and essential supplies.",
        imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
        rating: "4.80",
        inStock: true,
      },
      {
        name: "Dettol Antiseptic",
        categoryId: medicineCategories[3].id,
        variants: [
          { name: "100ml", price: "120" },
          { name: "250ml", price: "220" },
          { name: "500ml", price: "380" }
        ],
        description: "Antiseptic liquid for wound cleaning and disinfection.",
        imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400",
        rating: "4.50",
        inStock: true,
      },
      {
        name: "Glucometer Kit",
        categoryId: medicineCategories[4].id,
        variants: [
          { name: "Kit + 25 strips", price: "1500" },
          { name: "Kit + 50 strips", price: "2200" },
          { name: "Kit + 100 strips", price: "3500" }
        ],
        description: "Digital blood glucose monitoring system with test strips.",
        imageUrl: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400",
        rating: "4.60",
        inStock: true,
      },
      {
        name: "Insulin Needles",
        categoryId: medicineCategories[4].id,
        variants: [
          { name: "10 pieces", price: "400" },
          { name: "30 pieces", price: "1000" },
          { name: "50 pieces", price: "1500" }
        ],
        description: "Sterile insulin syringes for diabetes management.",
        imageUrl: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400",
        rating: "4.40",
        inStock: true,
      },
      {
        name: "Aspirin 75mg",
        categoryId: medicineCategories[5].id,
        variants: [
          { name: "30 tablets", price: "200" },
          { name: "60 tablets", price: "350" },
          { name: "90 tablets", price: "480" }
        ],
        description: "Low-dose aspirin for heart health and blood thinning.",
        imageUrl: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400",
        rating: "4.50",
        inStock: true,
      },
      {
        name: "Omega-3 Fish Oil",
        categoryId: medicineCategories[5].id,
        variants: [
          { name: "30 capsules", price: "650" },
          { name: "60 capsules", price: "1150" }
        ],
        description: "Essential fatty acids for cardiovascular and brain health.",
        imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
        rating: "4.70",
        inStock: true,
      },
    ]).returning();

    console.log("✅ Products created");

    // Create addresses for test user
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
        address: "456 Business Tower, I.I. Chundrigar Road",
        city: "Karachi",
        province: "Sindh",
        postalCode: "74000",
        isDefault: false,
      },
      {
        userId: testUser.id,
        label: "Parent's House",
        address: "789 Garden Lane, Defence Phase 5",
        city: "Karachi",
        province: "Sindh",
        postalCode: "75500",
        isDefault: false,
      },
    ]);

    console.log("✅ Addresses created");

    // Create wishlist items for test user
    await db.insert(wishlistItems).values([
      {
        userId: testUser.id,
        productId: productsList[6].id,
      },
      {
        userId: testUser.id,
        productId: productsList[8].id,
      },
      {
        userId: testUser.id,
        productId: productsList[11].id,
      },
      {
        userId: testUser.id,
        productId: productsList[3].id,
      },
    ]);

    console.log("✅ Wishlist items created");

    // Create orders
    const ordersList = await db.insert(orders).values([
      {
        userId: testUser.id,
        products: [
          {
            productId: productsList[0].id,
            name: productsList[0].name,
            quantity: 2,
            price: "180",
            variantName: "20 tablets",
          },
          {
            productId: productsList[4].id,
            name: productsList[4].name,
            quantity: 1,
            price: "480",
            variantName: "120ml",
          },
        ],
        totalPrice: "1140.00",
        deliveryAddress: "123 Main Street, Block A, Karachi, Sindh - 75500",
        paymentMethod: "COD",
        status: "delivered",
        expectedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser.id,
        products: [
          {
            productId: productsList[2].id,
            name: productsList[2].name,
            quantity: 1,
            price: "650",
            variantName: "60 tablets",
          },
        ],
        totalPrice: "650.00",
        deliveryAddress: "456 Business Tower, I.I. Chundrigar Road, Karachi, Sindh - 74000",
        paymentMethod: "wallet",
        paidFromWallet: "650.00",
        status: "shipped",
        expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser.id,
        products: [
          {
            productId: productsList[10].id,
            name: productsList[10].name,
            quantity: 2,
            price: "350",
            variantName: "60 tablets",
          },
        ],
        totalPrice: "700.00",
        deliveryAddress: "123 Main Street, Block A, Karachi, Sindh - 75500",
        paymentMethod: "bank_transfer",
        paymentInfo: "Bank: HBL, Account: ****1234",
        status: "processing",
        expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user2.id,
        products: [
          {
            productId: productsList[1].id,
            name: productsList[1].name,
            quantity: 1,
            price: "150",
            variantName: "10 tablets",
          },
        ],
        totalPrice: "150.00",
        deliveryAddress: "456 Green Avenue, Lahore, Punjab - 54000",
        paymentMethod: "COD",
        usedAffiliateCode: "TEST2024",
        affiliateUserId: testUser.id,
        affiliateCommission: "15.00",
        status: "delivered",
        expectedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user3.id,
        products: [
          {
            productId: productsList[3].id,
            name: productsList[3].name,
            quantity: 1,
            price: "850",
            variantName: "60 capsules",
          },
          {
            productId: productsList[5].id,
            name: productsList[5].name,
            quantity: 2,
            price: "220",
            variantName: "24 lozenges",
          },
        ],
        totalPrice: "1290.00",
        deliveryAddress: "789 Park Road, Islamabad, Islamabad Capital Territory - 44000",
        paymentMethod: "wallet",
        paidFromWallet: "1290.00",
        usedAffiliateCode: "TEST2024",
        affiliateUserId: testUser.id,
        affiliateCommission: "129.00",
        status: "delivered",
        expectedDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ]).returning();

    console.log("✅ Orders created");

    // Create wallet transactions for test user
    await db.insert(walletTransactions).values([
      {
        userId: testUser.id,
        type: "credit",
        amount: "2500.00",
        description: "Affiliate commission from referral orders",
        status: "completed",
      },
      {
        userId: testUser.id,
        type: "credit",
        amount: "1500.00",
        description: "Bonus reward for reaching milestone",
        status: "completed",
      },
      {
        userId: testUser.id,
        type: "debit",
        amount: "650.00",
        description: "Payment for order #" + ordersList[1].id.slice(0, 8),
        orderId: ordersList[1].id,
        status: "completed",
      },
      {
        userId: testUser.id,
        type: "credit",
        amount: "500.00",
        description: "Cashback from purchases",
        status: "completed",
      },
      {
        userId: testUser.id,
        type: "credit",
        amount: "144.00",
        description: "Affiliate commission",
        status: "pending",
      },
    ]);

    // Create wallet transactions for user2
    await db.insert(walletTransactions).values([
      {
        userId: user2.id,
        type: "credit",
        amount: "1000.00",
        description: "Welcome bonus",
        status: "completed",
      },
      {
        userId: user2.id,
        type: "credit",
        amount: "500.00",
        description: "Affiliate commission",
        status: "completed",
      },
    ]);

    console.log("✅ Wallet transactions created");

    // Create partner for test user
    await db.insert(partners).values({
      userId: testUser.id,
      businessName: "MediCare Pharmacy",
      businessType: "Retail Pharmacy",
      commissionRate: "15.00",
      totalSales: "25000.00",
      status: "active",
    });

    console.log("✅ Partner created");

    // Create referral stats
    await db.insert(referralStats).values([
      {
        userId: testUser.id,
        totalReferrals: 2,
        totalOrders: 2,
        totalCommission: "144.00",
      },
      {
        userId: user2.id,
        totalReferrals: 0,
        totalOrders: 0,
        totalCommission: "0.00",
      },
      {
        userId: user3.id,
        totalReferrals: 0,
        totalOrders: 0,
        totalCommission: "0.00",
      },
    ]);

    console.log("✅ Referral stats created");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Test Account:");
    console.log("   Email: test@example.com");
    console.log("   Password: test123");
    console.log("   Affiliate Code: TEST2024");
    console.log("   Wallet Balance: PKR 5,000");
    console.log("\n✨ The database now contains:");
    console.log(`   - 3 users (including test account)`);
    console.log(`   - 6 categories`);
    console.log(`   - 12 products with variants`);
    console.log(`   - 3 addresses`);
    console.log(`   - 4 wishlist items`);
    console.log(`   - 5 orders`);
    console.log(`   - 7 wallet transactions`);
    console.log(`   - 1 partner`);
    console.log(`   - 3 referral stats`);
    console.log("\n💡 Note: Cart is now stored in localStorage (browser storage)");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\n✅ Seeding script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  });
