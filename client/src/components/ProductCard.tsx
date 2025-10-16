import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product & { category?: string };
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted }: ProductCardProps) {
  const rating = parseFloat(product.rating || "0");
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all rounded-2xl group">
        <div className="relative bg-accent/30 aspect-square p-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
            data-testid={`img-product-${product.id}`}
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 rounded-full w-9 h-9"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.();
            }}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-primary text-primary" : ""}`}
            />
          </Button>
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

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-2xl font-bold font-serif text-foreground" data-testid={`text-price-${product.id}`}>
                PKR {parseFloat(product.price).toFixed(0)}
              </p>
            </div>
            <Button
              size="sm"
              className="rounded-xl"
              onClick={onAddToCart}
              disabled={!product.inStock}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
