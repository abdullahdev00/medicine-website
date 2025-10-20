'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ArrowLeft, SlidersHorizontal, Package } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import { CircularButton } from "@/components/CircularButton";
import { FilterBottomSheet } from "@/components/FilterBottomSheet";
import { EmptyState } from "@/components/EmptyState";
import type { Product, Category } from "@shared/schema";

export default function ProductsPage() {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [minRating, setMinRating] = useState(0);
  const [showInStock, setShowInStock] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products.filter((p) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoryId)) {
      return false;
    }
    
    const price = parseFloat(p.price);
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    const rating = parseFloat(p.rating || "0");
    if (rating < minRating) {
      return false;
    }
    
    if (showInStock && !p.inStock) {
      return false;
    }
    
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === "price-desc") return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === "rating") return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 3000]);
    setMinRating(0);
    setShowInStock(false);
    setSortBy("default");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <CircularButton
              icon={ArrowLeft}
              onClick={() => router.push("/")}
              testId="button-back"
            />
            
            <h1 className="font-serif text-2xl font-bold">All Products</h1>
            
            <CircularButton
              icon={SlidersHorizontal}
              onClick={() => setFilterOpen(true)}
              testId="button-filter"
            />
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
                onClick={() => router.push(`/products/${product.id}`)}
                className="cursor-pointer"
              >
                <ProductCard product={product as any} />
              </div>
            ))}
          </div>
        )}

        {!productsLoading && sortedProducts.length === 0 && (
          <EmptyState
            icon={Package}
            title="No Products Found"
            description="We couldn't find any products matching your filters. Try adjusting your search criteria or clear all filters."
            actionLabel="Clear Filters"
            onAction={handleClearFilters}
            testId="button-clear-filters"
          />
        )}
      </div>

      <FilterBottomSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        onClearFilters={handleClearFilters}
      />

      <BottomNav cartCount={0} />
    </div>
  );
}
