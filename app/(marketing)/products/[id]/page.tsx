'use client'

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, ShoppingCart, Plus, Minus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/providers";
import { useCart } from "@/hooks/use-cart";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";

export default function ProductDetailPage() {
  const params = useParams();
  const idOrSlug = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isAddingToCart } = useCart();
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", idOrSlug],
    enabled: !!idOrSlug,
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

  // Cart items are now handled by useCart hook

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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!product?.variants?.[selectedPackage]) return;
    addToCart(product.id, product.variants[selectedPackage], quantity);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!product) return;

    const wishlistItem = wishlistItems.find((item) => item.productId === product.id);
    if (wishlistItem) {
      removeFromWishlistMutation.mutate(wishlistItem.id);
    } else {
      addToWishlistMutation.mutate(product.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="aspect-square bg-muted animate-pulse rounded-b-3xl" />
        <div className="p-4 space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Product not found</p>
          <Button onClick={() => router.push("/products")} className="rounded-xl">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const rating = parseFloat(product.rating || "0");
  const images = product.images || ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"];
  const isWishlisted = wishlistItems.some((item) => item.productId === product?.id);
  
  const unitPrice = product.variants && product.variants[selectedPackage] 
    ? parseFloat(product.variants[selectedPackage].price)
    : 0;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative">
        <div className="h-64 sm:h-80 relative overflow-hidden rounded-b-3xl">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            data-testid="img-product-detail"
          />
          
          <button
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
            onClick={() => router.push("/products")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <FavoriteButton
            isWishlisted={isWishlisted}
            onClick={handleToggleWishlist}
            testId="button-wishlist-toggle"
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        <div className="space-y-3">
          <h1 className="font-serif text-2xl font-bold" data-testid="text-product-name">
            {product.name}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({rating} rating)</span>
            </div>
            
            <p className="font-serif text-3xl font-bold text-primary" data-testid="text-price">
              Rs {unitPrice.toFixed(0)}
            </p>
          </div>
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Package Size</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedPackage === index ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => setSelectedPackage(index)}
                  data-testid={`button-package-${index}`}
                >
                  {option.name} - {parseFloat(option.price).toFixed(0)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Quantity</h3>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              data-testid="button-decrease-quantity"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-2xl font-bold w-12 text-center" data-testid="text-quantity">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={() => setQuantity(quantity + 1)}
              data-testid="button-increase-quantity"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Description</h3>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        <Button
          size="lg"
          className="w-full rounded-xl h-14 flex items-center justify-between px-6 gap-4"
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          data-testid="button-add-to-cart"
        >
          <div className="flex items-center gap-2 flex-shrink-0">
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-6 w-px bg-primary-foreground/30" />
            <span className="text-xl font-bold font-mono tabular-nums">
              {totalPrice.toFixed(0)}
            </span>
          </div>
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
