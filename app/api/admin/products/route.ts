import { NextRequest, NextResponse } from "next/server";
import { db, supabase } from "@/lib/db/client";
import { products, categories, orders } from "@/shared/schema";
import { eq, desc, like, or, and, sql } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-middleware";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdmin();
    
    // Get search params for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let conditions = [];
    
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${products.name}) LIKE ${searchPattern} 
        OR LOWER(${products.description}) LIKE ${searchPattern})`
      );
    }
    
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    
    if (inStock === "true") {
      conditions.push(eq(products.inStock, true));
    }
    
    // Build main query
    const query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        categoryName: categories.name,
        images: products.images,
        rating: products.rating,
        variants: products.variants,
        inStock: products.inStock,
        createdAt: products.createdAt,
        soldCount: sql<number>`(
          SELECT COALESCE(SUM(
            (SELECT SUM((p->>'quantity')::int) 
             FROM jsonb_array_elements(${orders.products}) p 
             WHERE p->>'productId' = ${products.id}::text)
          ), 0)::int
          FROM ${orders}
          WHERE ${orders.status} = 'delivered'
        )`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));
    
    // Build the final query with conditions
    const finalQuery = conditions.length > 0
      ? query.where(and(...conditions))
      : query;
    
    // Execute query with pagination
    const allProducts = await finalQuery
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset)
      .catch(() => []); // Return empty array if table doesn't exist or query fails
    
    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(products);
    
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    
    const totalResultArray = await countQuery.catch(() => []);
    const totalResult = totalResultArray?.[0];
    
    return NextResponse.json({
      products: allProducts.map(product => ({
        ...product,
        rating: product.rating ? Number(product.rating) : 0,
      })),
      pagination: {
        page,
        limit,
        total: totalResult?.count || 0,
        totalPages: Math.ceil((totalResult?.count || 0) / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin products error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdmin();
    
    const productData = await request.json();
    
    // Validate required fields
    if (!productData.name || !productData.categoryId) {
      return NextResponse.json(
        { message: "Name and category are required" },
        { status: 400 }
      );
    }
    
    // Validate variants
    if (!productData.variants || productData.variants.length === 0) {
      return NextResponse.json(
        { message: "At least one variant is required" },
        { status: 400 }
      );
    }
    
    // Handle image URL to images array conversion
    if (productData.imageUrl && !productData.images) {
      productData.images = [productData.imageUrl];
      delete productData.imageUrl;
    }
    
    // Create product with generated ID - use camelCase for Drizzle schema
    const newProduct = {
      id: uuidv4(),
      name: productData.name,
      description: productData.description || '',
      categoryId: productData.categoryId, // Drizzle schema uses camelCase
      images: productData.images || [],
      rating: productData.rating || '0',
      variants: productData.variants || [],
      inStock: productData.inStock !== false, // Drizzle schema uses camelCase
      createdAt: new Date(),
    };
    
    // For Supabase direct insert, use snake_case
    const supabaseProduct = {
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      category_id: newProduct.categoryId, // Convert to snake_case for Supabase
      images: newProduct.images,
      rating: newProduct.rating,
      variants: newProduct.variants,
      in_stock: newProduct.inStock, // Convert to snake_case for Supabase
      created_at: newProduct.createdAt,
    };
    
    // Try Drizzle first, then fallback to Supabase
    let insertedProduct;
    
    try {
      // Try Drizzle ORM
      const result = await db
        .insert(products)
        .values(newProduct)
        .returning();
      insertedProduct = result[0];
    } catch (dbError: any) {
      console.error("Drizzle insert failed, trying Supabase:", dbError.message);
      
      // Fallback to Supabase client
      try {
        // Create Supabase client with service role key for admin operations
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabaseAdmin
          .from('products')
          .insert(supabaseProduct) // Use snake_case version for Supabase
          .select()
          .single();
        
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        
        insertedProduct = data;
      } catch (supabaseError: any) {
        console.error("Both Drizzle and Supabase failed:", supabaseError);
        
        // Return specific error messages
        if (supabaseError.code === '23503') {
          return NextResponse.json({ 
            message: "Invalid category ID. Please select a valid category.",
            error: supabaseError.message 
          }, { status: 400 });
        }
        
        if (supabaseError.code === '42P01') {
          return NextResponse.json({ 
            message: "Database table 'products' not found. Please run migrations.",
            error: supabaseError.message 
          }, { status: 500 });
        }
        
        return NextResponse.json({ 
          message: "Database operation failed",
          error: supabaseError.message || dbError.message
        }, { status: 500 });
      }
    }
    
    if (!insertedProduct) {
      throw new Error("Failed to insert product");
    }
    
    return NextResponse.json({
      ...insertedProduct,
      rating: insertedProduct.rating ? Number(insertedProduct.rating) : 0,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Create product error:", error);
    return NextResponse.json({ 
      message: "Failed to create product",
      error: error.message 
    }, { status: 500 });
  }
}
