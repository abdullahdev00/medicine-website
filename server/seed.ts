import { db } from "../db";
import { users, categories, products, orders, addresses, walletTransactions } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    const hashedTestPassword = await bcrypt.hash("test123", 10);
    const hashedAhmadPassword = await bcrypt.hash("password123", 10);

    const testUser = await db.insert(users).values({
      fullName: "Test User",
      email: "test@example.com",
      password: hashedTestPassword,
      phoneNumber: "+92 300 1234567",
      whatsappNumber: "+92 300 1234567",
      address: "123 Test Street, Block A",
      city: "Karachi",
      province: "Sindh",
      postalCode: "75500",
      affiliateCode: "TEST2024",
      walletBalance: "500.00",
      totalEarnings: "1500.00",
      pendingEarnings: "250.00",
      isPartner: false,
    }).returning();
    console.log("✅ Test user created:", testUser[0].email);

    const ahmadUser = await db.insert(users).values({
      fullName: "Ahmad Khan",
      email: "ahmad.khan@example.com",
      password: hashedAhmadPassword,
      phoneNumber: "+92 321 9876543",
      whatsappNumber: "+92 321 9876543",
      address: "456 Main Road, DHA Phase 5",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54000",
      affiliateCode: "AHMAD2024",
      walletBalance: "1200.00",
      totalEarnings: "3500.00",
      pendingEarnings: "500.00",
      isPartner: true,
    }).returning();
    console.log("✅ Ahmad user created:", ahmadUser[0].email);

    const categoryData = [
      { name: "Pain Relief", icon: "💊", description: "Medicines for pain management and relief" },
      { name: "Cold & Flu", icon: "🤧", description: "Remedies for cold, flu, and respiratory issues" },
      { name: "Vitamins & Supplements", icon: "🌿", description: "Health supplements and vitamins" },
      { name: "First Aid", icon: "🩹", description: "First aid supplies and emergency care" },
      { name: "Personal Care", icon: "🧴", description: "Personal hygiene and care products" },
      { name: "Diabetes Care", icon: "💉", description: "Products for diabetes management" },
    ];

    const createdCategories = await db.insert(categories).values(categoryData).returning();
    console.log("✅ Categories created:", createdCategories.length);

    const productData = [
      {
        name: "Panadol Extra",
        categoryId: createdCategories[0].id,
        price: "250.00",
        description: "Fast relief from headaches, fever, and body pain",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        rating: "4.5",
        packageOptions: ["10 Tablets", "20 Tablets", "30 Tablets"],
        inStock: true,
      },
      {
        name: "Brufen 400mg",
        categoryId: createdCategories[0].id,
        price: "180.00",
        description: "Anti-inflammatory medicine for pain and fever",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
        rating: "4.3",
        packageOptions: ["10 Tablets", "20 Tablets"],
        inStock: true,
      },
      {
        name: "Lemsip Cold & Flu",
        categoryId: createdCategories[1].id,
        price: "320.00",
        description: "Relief from cold and flu symptoms",
        imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
        rating: "4.6",
        packageOptions: ["5 Sachets", "10 Sachets"],
        inStock: true,
      },
      {
        name: "Multivitamin Complete",
        categoryId: createdCategories[2].id,
        price: "850.00",
        description: "Daily multivitamin for overall health",
        imageUrl: "https://images.unsplash.com/photo-1550572017-4814c6c7e6b4?w=400",
        rating: "4.7",
        packageOptions: ["30 Tablets", "60 Tablets", "90 Tablets"],
        inStock: true,
      },
      {
        name: "Vitamin C 1000mg",
        categoryId: createdCategories[2].id,
        price: "650.00",
        description: "Boost your immunity with Vitamin C",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        rating: "4.5",
        packageOptions: ["30 Tablets", "60 Tablets"],
        inStock: true,
      },
      {
        name: "First Aid Kit Complete",
        categoryId: createdCategories[3].id,
        price: "1500.00",
        description: "Complete first aid kit for home and travel",
        imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
        rating: "4.8",
        packageOptions: ["Basic Kit", "Advanced Kit"],
        inStock: true,
      },
      {
        name: "Hand Sanitizer 500ml",
        categoryId: createdCategories[4].id,
        price: "280.00",
        description: "Kills 99.9% germs and bacteria",
        imageUrl: "https://images.unsplash.com/photo-1584744982493-c48ad0b64f86?w=400",
        rating: "4.4",
        packageOptions: ["250ml", "500ml", "1L"],
        inStock: true,
      },
      {
        name: "Blood Glucose Monitor",
        categoryId: createdCategories[5].id,
        price: "3500.00",
        description: "Digital blood glucose monitoring system",
        imageUrl: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=400",
        rating: "4.9",
        packageOptions: ["Basic Kit", "Kit with 50 Strips", "Kit with 100 Strips"],
        inStock: true,
      },
    ];

    const createdProducts = await db.insert(products).values(productData).returning();
    console.log("✅ Products created:", createdProducts.length);

    const orderData = [
      {
        userId: testUser[0].id,
        products: [
          { productId: createdProducts[0].id, name: "Panadol Extra", quantity: 2, price: "250.00", selectedPackage: "20 Tablets" },
          { productId: createdProducts[2].id, name: "Lemsip Cold & Flu", quantity: 1, price: "320.00", selectedPackage: "10 Sachets" },
        ],
        totalPrice: "820.00",
        deliveryAddress: "123 Test Street, Block A, Karachi, Sindh - 75500",
        paymentMethod: "Cash on Delivery",
        status: "delivered",
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser[0].id,
        products: [
          { productId: createdProducts[3].id, name: "Multivitamin Complete", quantity: 1, price: "850.00", selectedPackage: "60 Tablets" },
        ],
        totalPrice: "850.00",
        deliveryAddress: "123 Test Street, Block A, Karachi, Sindh - 75500",
        paymentMethod: "Wallet",
        paidFromWallet: "850.00",
        status: "pending",
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdOrders = await db.insert(orders).values(orderData).returning();
    console.log("✅ Orders created:", createdOrders.length);

    const addressData = [
      {
        userId: testUser[0].id,
        label: "Home",
        address: "123 Test Street, Block A",
        city: "Karachi",
        province: "Sindh",
        postalCode: "75500",
        isDefault: true,
      },
      {
        userId: testUser[0].id,
        label: "Office",
        address: "456 Business Center, Main Boulevard",
        city: "Karachi",
        province: "Sindh",
        postalCode: "75600",
        isDefault: false,
      },
    ];

    const createdAddresses = await db.insert(addresses).values(addressData).returning();
    console.log("✅ Addresses created:", createdAddresses.length);

    const transactionData = [
      {
        userId: testUser[0].id,
        type: "credit",
        amount: "500.00",
        description: "Welcome bonus",
        status: "completed",
      },
      {
        userId: testUser[0].id,
        type: "debit",
        amount: "850.00",
        description: "Order payment",
        orderId: createdOrders[1].id,
        status: "completed",
      },
    ];

    const createdTransactions = await db.insert(walletTransactions).values(transactionData).returning();
    console.log("✅ Wallet transactions created:", createdTransactions.length);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\nTest User Credentials:");
    console.log("Email: test@example.com");
    console.log("Password: test123");
    console.log("\nAhmad User Credentials:");
    console.log("Email: ahmad.khan@example.com");
    console.log("Password: password123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("✅ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });
