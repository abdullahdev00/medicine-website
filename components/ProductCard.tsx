import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FavoriteButton } from "@/components/FavoriteButton";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product & { category?: string };
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const rating = parseFloat(product.rating || "0");
  const lowestPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map(v => parseFloat(v.price)))
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdded(true);
    onAddToCart?.();
    setTimeout(() => setIsAdded(false), 1500);
  };
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all rounded-2xl group">
        <div className="relative aspect-square">
          <img
            src={product.images?.[0] || "/images/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
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
              disabled={!product.inStock}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
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
