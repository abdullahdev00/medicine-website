"use client";

import { useRouter } from "next/navigation";
import { Heart, ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/providers";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Wishlist() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const { data: wishlistItems = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/wishlist?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ["/api/cart", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/cart?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/wishlist/${id}`);
      if (!res.ok) throw new Error("Failed to remove from wishlist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", user?.id] });
      toast({ title: "Removed from wishlist", description: "Item has been removed from your wishlist." });
    },
  });

  const removeFromWishlist = (id: string) => {
    removeFromWishlistMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary/10 to-accent/20 border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <button
              className="w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-all"
              onClick={() => router.push("/")}
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
            onAction={() => router.push("/")}
            testId="button-start-shopping"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/products/${item.productId}`)}
                className="cursor-pointer"
              >
                <ProductCard
                  product={item.product}
                  onToggleWishlist={() => removeFromWishlist(item.id)}
                  isWishlisted={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav cartCount={cartItems.length} />
    </div>
  );
}
