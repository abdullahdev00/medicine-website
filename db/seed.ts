import { db } from "./index";
import { categories, products } from "@shared/schema";
import { count, sql } from "drizzle-orm";

const mockCategories = [
  { name: "First Aid", icon: "Activity", description: "Emergency medical supplies and bandages" },
  { name: "Cold & Flu", icon: "Thermometer", description: "Medicines for cold and flu symptoms" },
  { name: "Vitamins", icon: "Pill", description: "Essential vitamins and supplements" },
  { name: "Personal Hygiene", icon: "Droplets", description: "Personal care and hygiene products" },
  { name: "Skincare", icon: "Sparkles", description: "Skincare and beauty products" },
  { name: "Pain Relief", icon: "Zap", description: "Pain management medications" },
];

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    console.log("Checking for existing categories...");
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length === 0) {
      console.log("Creating categories...");
      const createdCategories = await db.insert(categories)
        .values(mockCategories)
        .returning();
      
      console.log(`✅ Created ${createdCategories.length} categories`);
    } else {
      console.log(`ℹ️  Found ${existingCategories.length} existing categories`);
    }

    console.log("Getting category IDs as strings...");
    const categoryRows = await db.execute<{ id: string; name: string }>(
      sql`SELECT id::text as id, name FROM categories`
    );
    
    const categoryMap = new Map<string, string>();
    categoryRows.rows.forEach((cat: any) => {
      categoryMap.set(cat.name, cat.id);
    });

    console.log("Checking for existing products...");
    const productCount = await db.select({ count: count() }).from(products);
    const existingProductCount = productCount[0]?.count || 0;
    
    if (existingProductCount > 0) {
      console.log(`ℹ️  Found ${existingProductCount} existing products. Skipping seed.`);
      return;
    }

    console.log("Creating products...");
    const mockProducts = [
      {
        name: "Paracetamol 500mg",
        categoryId: categoryMap.get("Pain Relief")!,
        price: "120",
        description: "Paracetamol is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
        imageUrl: "/assets/generated_images/Paracetamol_tablet_product_photo_f970b2f0.png",
        rating: "4.5",
        packageOptions: ["10 Tablets", "20 Tablets", "50 Tablets"],
        inStock: true,
      },
      {
        name: "Vitamin C 1000mg",
        categoryId: categoryMap.get("Vitamins")!,
        price: "890",
        description: "Vitamin C is an essential nutrient that supports immune function and acts as a powerful antioxidant.",
        imageUrl: "/assets/generated_images/Vitamin_C_supplement_bottle_d4b69c6b.png",
        rating: "4.8",
        packageOptions: ["30 Tablets", "60 Tablets", "90 Tablets"],
        inStock: true,
      },
      {
        name: "Cough Syrup 200ml",
        categoryId: categoryMap.get("Cold & Flu")!,
        price: "245",
        description: "Effective relief for dry and productive coughs. Soothes throat irritation and reduces cough frequency.",
        imageUrl: "/assets/generated_images/Cough_syrup_bottle_photo_d2056a75.png",
        rating: "4.3",
        packageOptions: ["100ml", "200ml"],
        inStock: true,
      },
      {
        name: "Bandages Pack",
        categoryId: categoryMap.get("First Aid")!,
        price: "350",
        description: "Premium quality adhesive bandages for minor cuts and wounds. Breathable with strong adhesive.",
        imageUrl: "/assets/generated_images/First_aid_bandages_box_d0a7183b.png",
        rating: "4.6",
        packageOptions: ["20 Pieces", "50 Pieces", "100 Pieces"],
        inStock: true,
      },
      {
        name: "Hand Sanitizer 500ml",
        categoryId: categoryMap.get("Personal Hygiene")!,
        price: "450",
        description: "70% alcohol-based hand sanitizer that kills 99.9% of germs. Quick-drying with moisturizing agents.",
        imageUrl: "/assets/generated_images/Hand_sanitizer_bottle_photo_04765ae0.png",
        rating: "4.7",
        packageOptions: ["250ml", "500ml", "1000ml"],
        inStock: true,
      },
      {
        name: "Omega-3 Fish Oil",
        categoryId: categoryMap.get("Vitamins")!,
        price: "1250",
        description: "Premium omega-3 with EPA and DHA to support heart, brain, and joint health.",
        imageUrl: "/assets/generated_images/Omega-3_supplement_bottle_photo_3989ddc4.png",
        rating: "4.9",
        packageOptions: ["60 Softgels", "120 Softgels", "180 Softgels"],
        inStock: true,
      },
      {
        name: "Ibuprofen 400mg",
        categoryId: categoryMap.get("Pain Relief")!,
        price: "180",
        description: "Fast-acting pain relief for headaches, dental pain, and arthritis. Also reduces fever.",
        imageUrl: "/assets/generated_images/Paracetamol_tablet_product_photo_f970b2f0.png",
        rating: "4.4",
        packageOptions: ["10 Tablets", "20 Tablets"],
        inStock: true,
      },
      {
        name: "Multivitamin Complex",
        categoryId: categoryMap.get("Vitamins")!,
        price: "950",
        description: "Complete daily multivitamin supporting overall health, energy, and immune function.",
        imageUrl: "/assets/generated_images/Vitamin_C_supplement_bottle_d4b69c6b.png",
        rating: "4.6",
        packageOptions: ["30 Tablets", "60 Tablets"],
        inStock: true,
      },
      {
        name: "Antiseptic Cream",
        categoryId: categoryMap.get("First Aid")!,
        price: "280",
        description: "Antiseptic cream for minor cuts, burns, and skin infections. Promotes faster healing.",
        imageUrl: "/assets/generated_images/First_aid_bandages_box_d0a7183b.png",
        rating: "4.5",
        packageOptions: ["25g", "50g", "100g"],
        inStock: true,
      },
      {
        name: "Face Moisturizer SPF 30",
        categoryId: categoryMap.get("Skincare")!,
        price: "1100",
        description: "Daily moisturizer with SPF 30 sun protection. Lightweight, non-greasy formula.",
        imageUrl: "/assets/generated_images/Hand_sanitizer_bottle_photo_04765ae0.png",
        rating: "4.7",
        packageOptions: ["50ml", "100ml"],
        inStock: true,
      },
    ];

    for (const product of mockProducts) {
      await db.execute(
        sql`INSERT INTO products (name, category_id, price, description, image_url, rating, package_options, in_stock)
            VALUES (${product.name}, ${product.categoryId}::uuid, ${product.price}, ${product.description}, 
                    ${product.imageUrl}, ${product.rating}, ${JSON.stringify(product.packageOptions)}::jsonb, ${product.inStock})`
      );
    }
    
    console.log(`✅ Created ${mockProducts.length} products`);
    console.log("✨ Database seeded successfully!");
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
