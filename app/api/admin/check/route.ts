import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { admins } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Simple cookie check
    const cookieStore = await cookies();
    const adminId = cookieStore.get("admin-id")?.value;
    const adminEmail = cookieStore.get("admin-email")?.value;
    
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get admin from database
    const result = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
    
    if (result.length === 0 || result[0].email !== adminEmail) {
      return NextResponse.json(
        { message: "Invalid session" },
        { status: 401 }
      );
    }

    const admin = result[0];
    const { password: _, ...adminWithoutPassword } = admin;
    
    return NextResponse.json({ 
      isAdmin: true,
      user: adminWithoutPassword
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
