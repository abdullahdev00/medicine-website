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

    const admin = await storage.getAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    await storage.updateAdminLastLogin(admin.id);
    const { password: _, ...adminWithoutPassword } = admin;
    
    return NextResponse.json({
      ...adminWithoutPassword,
      isAdmin: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
