import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { inMemoryCart } from "@/lib/cart/in-memory-cart";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json([]);
    }
    
    const userCart = inMemoryCart.get(userId);
    const cartWithProducts = await Promise.all(
      userCart.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return { ...item, product };
      })
    );
    
    return NextResponse.json(cartWithProducts);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity, selectedPackage } = await request.json();
    
    if (!userId || !productId || !quantity || !selectedPackage) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userCart = inMemoryCart.add(userId, { productId, quantity, selectedPackage });
    return NextResponse.json({ success: true, cart: userCart });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    inMemoryCart.clear(userId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
