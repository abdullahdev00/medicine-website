import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import type { Product, Category } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products.filter(product =>
    searchQuery === "" || product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-4 space-y-8 pt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 rounded-full shadow-md border-none h-12 bg-card"
            data-testid="input-search"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="p-8 relative">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative space-y-3">
                <div className="inline-block bg-chart-3 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Limited Time Offer
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold">
                  Up to 25% OFF
                </h2>
                <p className="text-lg text-primary-foreground/90">
                  On your first order
                </p>
                <Button
                  variant="secondary"
                  className="rounded-xl mt-4"
                  onClick={() => setLocation("/products")}
                  data-testid="button-shop-now"
                >
                  Shop Now
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-semibold">Top Categories</h2>
          </div>
          {categoriesLoading ? (
            <div className="flex gap-3 overflow-x-auto">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="h-24 min-w-[110px] animate-pulse bg-muted rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  icon={category.icon}
                  onClick={() => setLocation(`/products?category=${category.name}`)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-semibold">
              {searchQuery ? "Search Results" : "Best Selling"}
            </h2>
            {!searchQuery && (
              <Button
                variant="ghost"
                className="text-primary rounded-xl"
                onClick={() => setLocation("/products")}
                data-testid="button-view-all"
              >
                View All
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            )}
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-muted rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(searchQuery ? filteredProducts : products.slice(0, 8)).map((product) => (
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
          {searchQuery && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav cartCount={0} wishlistCount={0} />
    </div>
  );
}
