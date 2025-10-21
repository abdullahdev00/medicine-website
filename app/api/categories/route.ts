import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 60; // Cache for 60 seconds
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get categories from Supabase
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Get categories error:', error);
      return NextResponse.json(
        { message: "Failed to fetch categories" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(categories || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
