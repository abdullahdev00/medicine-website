import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return NextResponse.json(
        { message: "Error listing buckets", error: listError.message },
        { status: 500 }
      );
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'product-images');

    if (bucketExists) {
      return NextResponse.json({
        message: "Bucket already exists",
        bucket: 'product-images'
      });
    }

    // Create the bucket
    const { data, error: createError } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (createError) {
      return NextResponse.json(
        { message: "Error creating bucket", error: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Bucket created successfully",
      bucket: 'product-images',
      config: {
        public: true,
        maxFileSize: '5MB',
        allowedTypes: ['JPEG', 'PNG', 'WebP', 'GIF']
      }
    });

  } catch (error: any) {
    console.error('Setup storage error:', error);
    return NextResponse.json(
      { message: "Failed to setup storage", error: error.message },
      { status: 500 }
    );
  }
}
