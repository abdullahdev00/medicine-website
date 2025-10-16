import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

import vitaminCImg from "@assets/generated_images/Vitamin_C_supplement_bottle_d4b69c6b.png";
import omega3Img from "@assets/generated_images/Omega-3_supplement_bottle_photo_3989ddc4.png";

const mockWishlist = [
  { id: "2", name: "Vitamin C 1000mg", category: "Vitamins", price: "890", imageUrl: vitaminCImg, rating: "4.8", inStock: true },
  { id: "6", name: "Omega-3 Fish Oil", category: "Vitamins", price: "1250", imageUrl: omega3Img, rating: "4.9", inStock: true },
];

export default function Wishlist() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState(mockWishlist);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary/10 to-accent/20 border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">My Wishlist</h1>
              <p className="text-muted-foreground">{wishlistItems.length} items saved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Your wishlist is empty</p>
              <p className="text-muted-foreground">Save items you love for later</p>
            </div>
            <Button
              onClick={() => setLocation("/home")}
              className="rounded-xl"
              data-testid="button-start-shopping"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLocation(`/product/${item.id}`)}
                className="cursor-pointer"
              >
                <ProductCard
                  product={item as any}
                  onToggleWishlist={() => removeFromWishlist(item.id)}
                  isWishlisted={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav cartCount={0} wishlistCount={wishlistItems.length} />
    </div>
  );
}
