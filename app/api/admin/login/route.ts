import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { admins } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Simple direct check from admin table
    const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    
    if (result.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const admin = result[0];

    // Simple password check (plain text)
    if (admin.password !== password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        { message: "Account is disabled" },
        { status: 401 }
      );
    }

    // Update last login
    await db.update(admins)
      .set({ lastLogin: new Date() })
      .where(eq(admins.id, admin.id));

    // Set simple cookies
    const cookieStore = await cookies();
    cookieStore.set("admin-id", admin.id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookieStore.set("admin-email", admin.email, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    // Return admin data
    const { password: _, ...adminWithoutPassword } = admin;
    return NextResponse.json({
      ...adminWithoutPassword,
      isAdmin: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}
