import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Star, Minus, Plus, ShoppingCart } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        userId: MOCK_USER_ID,
        productId: id,
        quantity,
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Card className="h-96 animate-pulse bg-muted rounded-2xl" />
        </div>
        <BottomNav cartCount={0} wishlistCount={0} />
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/products")}
            className="rounded-full"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="rounded-full"
            data-testid="button-wishlist-toggle"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-accent/30 rounded-2xl p-8 flex items-center justify-center aspect-square max-w-md mx-auto"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
            data-testid="img-product-detail"
          />
        </motion.div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-product-name">
              {product.name}
            </h1>
            
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
          </div>

          <div className="flex items-baseline gap-2">
            <p className="font-serif text-4xl font-bold text-primary" data-testid="text-price">
              PKR {parseFloat(product.price).toFixed(0)}
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
            <h3 className="font-semibold text-lg">Description</h3>
            <p className={`text-muted-foreground leading-relaxed ${!showFullDescription ? "line-clamp-3" : ""}`}>
              {product.description}
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => setShowFullDescription(!showFullDescription)}
              data-testid="button-read-more"
            >
              {showFullDescription ? "Read Less" : "Read More"}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quantity</h3>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-semibold w-12 text-center" data-testid="text-quantity">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="button-increase-quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full rounded-xl py-6 text-lg"
            onClick={() => addToCartMutation.mutate()}
            disabled={!product.inStock || addToCartMutation.isPending}
            data-testid="button-add-to-cart"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {addToCartMutation.isPending ? "Adding..." : `Add to Cart - PKR ${(parseFloat(product.price) * quantity).toFixed(0)}`}
          </Button>
        </div>
      </div>

      <BottomNav cartCount={0} wishlistCount={0} />
    </div>
  );
}
