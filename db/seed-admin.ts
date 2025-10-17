import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcrypt";

async function seedAdmin() {
  try {
    console.log("🔐 Creating admin user...");

    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await db.insert(schema.admins)
      .values({
        fullName: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        isActive: true,
      })
      .returning();

    console.log(`✅ Admin user created: ${admin[0].email}`);
    console.log("\n📝 Admin Login Credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
    console.log("\n🎉 Admin seeding complete!");

  } catch (error) {
    console.error("❌ Admin seeding failed:", error);
    throw error;
  }
}

seedAdmin()
  .then(() => {
    console.log("👋 Process complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
