import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertUserSchema.parse(body);
    
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }
    
    const user = await storage.createUser(validatedData);
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
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
