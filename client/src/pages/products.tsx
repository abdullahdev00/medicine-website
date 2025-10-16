import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import { CircularButton } from "@/components/CircularButton";
import { FilterBottomSheet } from "@/components/FilterBottomSheet";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [, setLocation] = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states
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

  // Apply filters
  const filteredProducts = products.filter((p) => {
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoryId)) {
      return false;
    }
    
    // Price filter
    const price = parseFloat(p.price);
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    // Rating filter
    const rating = parseFloat(p.rating || "0");
    if (rating < minRating) {
      return false;
    }
    
    // Stock filter
    if (showInStock && !p.inStock) {
      return false;
    }
    
    return true;
  });

  // Apply sorting
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
      {/* Redesigned Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <CircularButton
              icon={ArrowLeft}
              onClick={() => setLocation("/home")}
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

      {/* Products Grid */}
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

      {/* Filter Bottom Sheet */}
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

      <BottomNav cartCount={0} wishlistCount={0} />
    </div>
  );
}
