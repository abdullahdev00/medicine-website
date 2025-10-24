'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, ChevronRight, ShoppingCart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/providers";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Category } from "@shared/schema";

interface HomeClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export function HomeClient({ initialProducts, initialCategories }: HomeClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addToCart, cartItems, cartCount } = useCart();

  const { data: products = initialProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    initialData: initialProducts,
    staleTime: 60000, // 1 minute
  });

  const { data: categories = initialCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    initialData: initialCategories,
    staleTime: 60000, // 1 minute
  });

  const { data: wishlistItems = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/wishlist?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });


  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Not authenticated");
      const res = await apiRequest("POST", "/api/wishlist", { userId: user.id, productId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", user?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (wishlistItemId: string) => {
      await apiRequest("DELETE", `/api/wishlist/${wishlistItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", user?.id] });
    },
  });

  const handleToggleWishlist = (productId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    const wishlistItem = wishlistItems.find((item) => item.productId === productId);
    if (wishlistItem) {
      removeFromWishlistMutation.mutate(wishlistItem.id);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && product.variants && product.variants.length > 0) {
      addToCart(productId, product.variants[0], 1);
    }
  };

  const filteredProducts = products.filter(product =>
    searchQuery === "" || product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-4 space-y-8 pt-6">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 rounded-full shadow-md border-none h-12 bg-card"
              data-testid="input-search"
            />
          </div>
          <Button
            size="icon"
            className="rounded-full w-12 h-12 flex-shrink-0 relative"
            onClick={() => router.push("/cart")}
            data-testid="button-cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" data-testid="text-cart-count">
                {cartCount}
              </span>
            )}
          </Button>
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
                  onClick={() => router.push("/products")}
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
            <h2 className="font-serif text-2xl font-semibold">
              {searchQuery ? "Search Results" : "Best Selling"}
            </h2>
            {!searchQuery && (
              <Button
                variant="ghost"
                className="text-primary rounded-xl"
                onClick={() => router.push("/products")}
                data-testid="button-view-all"
              >
                View All
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.slice(0, 8).map((product) => {
              const isWishlisted = wishlistItems.some((item) => item.productId === product.id);
              return (
                <div key={product.id} onClick={() => router.push(`/products/${product.id}`)} className="cursor-pointer">
                  <ProductCard
                    product={{
                      ...product,
                      price: parseFloat((product as any).price || product.variants?.[0]?.price || "0"),
                      rating: parseFloat(product.rating || "0"),
                    } as any}
                    onToggleWishlist={() => handleToggleWishlist(product.id)}
                    onAddToCart={() => handleAddToCart(product.id)}
                    isWishlisted={isWishlisted}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
