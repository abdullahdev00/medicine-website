import { NextResponse } from "next/server";
import { z } from "zod";

export interface ApiError {
  message: string;
  status: number;
  errors?: any[];
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        message: "Validation error", 
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code
        }))
      },
      { status: 400 }
    );
  }

  // Handle database errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        return NextResponse.json(
          { message: "Record already exists" },
          { status: 409 }
        );
      case '23503': // Foreign key constraint violation
        return NextResponse.json(
          { message: "Referenced record not found" },
          { status: 400 }
        );
      case '42703': // Column does not exist
        return NextResponse.json(
          { message: "Database schema error - please contact support" },
          { status: 500 }
        );
      case '42P01': // Table does not exist
        return NextResponse.json(
          { message: "Database table not found - please contact support" },
          { status: 500 }
        );
      default:
        return NextResponse.json(
          { message: "Database error occurred" },
          { status: 500 }
        );
    }
  }

  // Handle authentication errors
  if (error.message === "Unauthorized" || error.status === 401) {
    return NextResponse.json(
      { message: "Unauthorized access" },
      { status: 401 }
    );
  }

  // Handle not found errors
  if (error.status === 404 || error.message?.includes('not found')) {
    return NextResponse.json(
      { message: "Resource not found" },
      { status: 404 }
    );
  }

  // Handle generic errors
  return NextResponse.json(
    { message: error.message || "Internal server error" },
    { status: error.status || 500 }
  );
}

export function validateRequiredFields(data: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

export function safeDbQuery<T>(queryFn: () => Promise<T>, fallback: T): Promise<T> {
  return queryFn().catch((error) => {
    console.error('Database query failed:', error);
    return fallback;
  });
}
