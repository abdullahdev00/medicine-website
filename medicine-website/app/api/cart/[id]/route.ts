import { NextRequest, NextResponse } from "next/server";
import { inMemoryCart } from "@/lib/cart/in-memory-cart";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    inMemoryCart.remove(userId, (await params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const { quantity } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const item = inMemoryCart.update(userId, (await params).id, quantity);
    
    if (item) {
      return NextResponse.json(item);
    } else {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
