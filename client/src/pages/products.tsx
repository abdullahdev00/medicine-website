import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [, setLocation] = useLocation();
  const [sortBy, setSortBy] = useState("default");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products.filter(
    (p) => filterCategory === "all" || p.categoryId === filterCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === "price-desc") return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === "rating") return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    return 0;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              className="rounded-full"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-bold">All Products</h1>
              <p className="text-sm text-muted-foreground">{sortedProducts.length} medicines available</p>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] rounded-xl" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] rounded-xl" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-muted rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setLocation(`/product/${product.id}`)}
                className="cursor-pointer"
              >
                <ProductCard product={product as any} />
              </div>
            ))}
          </div>
        )}

        {!productsLoading && sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </div>

      <BottomNav cartCount={0} wishlistCount={0} />
    </div>
  );
}
