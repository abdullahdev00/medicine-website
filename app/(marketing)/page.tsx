import { storage } from "@/server/storage";
import { HomeClient } from "./HomeClient";
import type { Product, Category } from "@shared/schema";

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    storage.getProducts(),
    storage.getCategories(),
  ]);

  const productsWithPrice = products.map(product => ({
    ...product,
    price: product.variants && product.variants.length > 0 
      ? product.variants[0].price 
      : "0",
    images: product.images.map(img => img === '' || img.includes('placeholder') 
      ? '/images/placeholder.svg' 
      : img
    ),
  })) as Product[];

  return <HomeClient initialProducts={productsWithPrice} initialCategories={categories} />;
}
