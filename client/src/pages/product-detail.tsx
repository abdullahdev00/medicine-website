import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Star, ShoppingCart, Plus, Minus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";
import { MOCK_USER_ID } from "@/lib/mockUser";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        userId: MOCK_USER_ID,
        productId: id,
        quantity: quantity,
        selectedPackage: product?.packageOptions?.[selectedPackage],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="aspect-square bg-muted animate-pulse rounded-b-3xl" />
        <div className="p-4 space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
        <BottomNav cartCount={0} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Product not found</p>
          <Button onClick={() => setLocation("/products")} className="rounded-xl">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const rating = parseFloat(product.rating || "0");
  const images = [product.imageUrl];
  
  const getPriceForSize = (index: number) => {
    const basePrice = parseFloat(product.price);
    if (index === 0) return basePrice;
    if (index === 1) return basePrice * 1.5;
    return basePrice * 2;
  };

  const unitPrice = getPriceForSize(selectedPackage);
  const totalPrice = unitPrice * quantity;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative">
        <div className="aspect-square relative overflow-hidden rounded-b-3xl">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            data-testid="img-product-detail"
          />
          
          <button
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
            onClick={() => setLocation("/products")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
            onClick={() => setIsWishlisted(!isWishlisted)}
            data-testid="button-wishlist-toggle"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>

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

        <div className="absolute -bottom-6 left-4 right-4">
          <Card className="p-4 rounded-3xl shadow-xl bg-card">
            <div className="space-y-1">
              <h1 className="font-serif text-2xl font-bold" data-testid="text-product-name">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({rating} rating)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="px-4 pt-12 space-y-6">
        <div className="flex items-baseline gap-2">
          <p className="font-serif text-4xl font-bold text-primary" data-testid="text-price">
            Rs {unitPrice.toFixed(0)}
          </p>
        </div>

        {product.packageOptions && product.packageOptions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Package Size</h3>
            <div className="flex flex-wrap gap-3">
              {product.packageOptions.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedPackage === index ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => setSelectedPackage(index)}
                  data-testid={`button-package-${index}`}
                >
                  {option}
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
          onClick={() => addToCartMutation.mutate()}
          disabled={!product.inStock || addToCartMutation.isPending}
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

      <BottomNav cartCount={0} />
    </div>
  );
}
