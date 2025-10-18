import { db } from "./db";
import { admins } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function testAdminLogin() {
  console.log("Testing admin login...\n");
  
  // Get admin from database
  const admin = await db.select().from(admins).where(eq(admins.email, "admin@example.com")).limit(1);
  
  if (!admin[0]) {
    console.log("❌ Admin not found in database");
    return;
  }
  
  console.log("✅ Admin found:");
  console.log("   Email:", admin[0].email);
  console.log("   Full Name:", admin[0].fullName);
  console.log("   Password Hash:", admin[0].password.substring(0, 20) + "...");
  
  // Test password
  const testPassword = "admin123";
  console.log("\n🔑 Testing password:", testPassword);
  
  const isValid = await bcrypt.compare(testPassword, admin[0].password);
  console.log("   Password valid:", isValid ? "✅ YES" : "❌ NO");
  
  if (!isValid) {
    console.log("\n🔧 Creating new admin with correct password...");
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log("   New hash:", newHash.substring(0, 20) + "...");
  }
}

testAdminLogin().then(() => process.exit(0)).catch(console.error);
