import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CachedImage } from "@/components/CachedImage";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product & { category?: string };
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted }: ProductCardProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart, isAddingToCart } = useCart();
  
  const rating = parseFloat(product.rating || "0");
  const lowestPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map(v => parseFloat(v.price)))
    : 0;
  
  const imageUrl = product.images?.[0];
  const fallbackImage = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Prevent double clicks while request is pending
    if (isAddingToCart) return;
    
    // Use custom onAddToCart if provided, otherwise use default cart logic
    if (onAddToCart) {
      setShowSuccess(true);
      onAddToCart();
      // Reset success state after brief animation
      setTimeout(() => setShowSuccess(false), 800);
    } else {
      // Default add to cart with first variant
      const defaultVariant = product.variants?.[0];
      if (defaultVariant) {
        setShowSuccess(true);
        addToCart(product.id, defaultVariant, 1);
        // Reset success state after brief animation
        setTimeout(() => setShowSuccess(false), 800);
      }
    }
  };
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all rounded-2xl group">
        <div className="relative aspect-square">
          <CachedImage
            src={imageUrl}
            alt={product.name}
            fallbackSrc={fallbackImage}
            productId={product.id}
            className="w-full h-full object-cover"
            objectFit="cover"
            quality={0.85}
            data-testid={`img-product-${product.id}`}
          />
          <FavoriteButton
            isWishlisted={isWishlisted}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.();
            }}
            testId={`button-wishlist-${product.id}`}
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-semibold text-destructive">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-base line-clamp-2" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
            {product.category && (
              <p className="text-xs text-muted-foreground">{product.category}</p>
            )}
          </div>
          
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
            <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
          </div>

          <motion.div
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Button
              className="w-full rounded-full h-12 flex items-center justify-between px-5 gap-3 shadow-lg relative overflow-hidden"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="added"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center bg-primary"
                  >
                    <Check className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="normal"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="font-semibold">Add</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="h-6 w-px bg-primary-foreground/30" />
                      <span className="text-lg font-bold font-mono tabular-nums" data-testid={`text-price-${product.id}`}>
                        {lowestPrice.toFixed(0)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
