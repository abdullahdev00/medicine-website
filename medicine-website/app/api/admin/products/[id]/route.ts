import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { requireAdmin } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const productData = await request.json();
    if (productData.imageUrl && !productData.images) {
      productData.images = [productData.imageUrl];
      delete productData.imageUrl;
    }
    const product = await storage.updateProduct((await params).id, productData);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await storage.deleteProduct((await params).id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
