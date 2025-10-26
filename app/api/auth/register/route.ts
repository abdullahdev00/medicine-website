import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertUserSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }
    
    // Create user with Supabase Auth (will send OTP email)
    const user = await storage.createUser(validatedData);
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      ...userWithoutPassword,
      message: "Verification code sent to your email!",
      requiresVerification: true,
      isConfirmed: false
    }, { status: 201 });
  } catch (error: any) {
    console.error('Register API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
