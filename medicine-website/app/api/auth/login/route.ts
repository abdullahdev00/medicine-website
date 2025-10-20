import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // First check if this is an admin login
    const admin = await storage.getAdminByEmail(email);
    if (admin) {
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }
      
      await storage.updateAdminLastLogin(admin.id);
      const { password: _, ...adminWithoutPassword } = admin;
      return NextResponse.json({ ...adminWithoutPassword, userType: "admin" });
    }
    
    // Otherwise check regular user login
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ ...userWithoutPassword, userType: "user" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
