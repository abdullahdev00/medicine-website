'use client'

import { useState, useEffect, useRef } from "react";
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
  
  // Header scroll state
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: categoriesResponse, error: categoriesError } = useQuery<{categories: Category[]}>({
    queryKey: ["/api/categories"],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const categories = categoriesResponse?.categories || [];

  // Handle scroll for header hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Don't hide header if we're at the top
      if (currentScrollY < scrollThreshold) {
        setHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      
      // Check scroll direction
      const scrollingDown = currentScrollY > lastScrollY.current;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
      
      // Only update if we've scrolled enough to avoid jittery behavior
      if (scrollDifference > scrollThreshold) {
        setHeaderVisible(!scrollingDown);
        lastScrollY.current = currentScrollY;
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  const filteredProducts = products.filter((p) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoryId)) {
      return false;
    }
    
    const price = parseFloat(p.variants?.[0]?.price || "0");
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
    if (sortBy === "price-asc") return parseFloat(a.variants?.[0]?.price || "0") - parseFloat(b.variants?.[0]?.price || "0");
    if (sortBy === "price-desc") return parseFloat(b.variants?.[0]?.price || "0") - parseFloat(a.variants?.[0]?.price || "0");
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
      <div 
        className={`sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40 shadow-sm transition-transform duration-300 ease-in-out ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
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
        {productsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error loading products:</p>
            <p className="text-red-600 text-sm">{productsError.message}</p>
          </div>
        )}
        
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

      <BottomNav />
    </div>
  );
}
