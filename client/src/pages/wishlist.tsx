import { useState } from "react";
import { useLocation } from "wouter";
import { Heart, ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";

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
    <div className="min-h-screen bg-background pb-32">
      <div className="bg-gradient-to-br from-primary/10 to-accent/20 border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <button
              className="w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-all"
              onClick={() => setLocation("/home")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-primary" />
            </button>
            <div>
              <h1 className="font-serif text-2xl font-bold">My Wishlist</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {wishlistItems.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your Wishlist is Empty"
            description="Save your favorite medicines and health products here. Start building your wishlist to track items you love."
            actionLabel="Browse Products"
            onAction={() => setLocation("/home")}
            testId="button-start-shopping"
          />
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

      <BottomNav cartCount={0} />
    </div>
  );
}
