'use client'

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/providers";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const { data: cartItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cart", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/cart?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/cart/${id}?userId=${user?.id}`, { quantity });
      return res.json();
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/cart", user?.id] });
      const previousCart = queryClient.getQueryData(["/api/cart", user?.id]);
      
      queryClient.setQueryData(["/api/cart", user?.id], (old: any[]) =>
        old.map((item) => item.id === id ? { ...item, quantity } : item)
      );
      
      return { previousCart };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(["/api/cart", user?.id], context.previousCart);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/${id}?userId=${user?.id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["/api/cart", user?.id] });
      const previousCart = queryClient.getQueryData(["/api/cart", user?.id]);
      
      queryClient.setQueryData(["/api/cart", user?.id], (old: any[]) =>
        old.filter((item) => item.id !== id)
      );
      
      return { previousCart };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(["/api/cart", user?.id], context.previousCart);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
    },
  });

  const updateQuantity = (id: string, delta: number) => {
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    
    if (newQuantity <= 0) {
      removeItemMutation.mutate(id);
    } else {
      updateQuantityMutation.mutate({ id, quantity: newQuantity });
    }
  };

  const removeItem = (id: string) => {
    removeItemMutation.mutate(id);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.selectedPackage?.price || "0") * item.quantity,
    0
  );
  const deliveryCharges = 150;
  const total = subtotal + deliveryCharges;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            className="w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-all"
            onClick={() => router.push("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-serif text-2xl font-bold">Shopping Cart</h1>
        </div>

        <div className={cartItems.length === 0 ? "space-y-4" : "max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-hide space-y-4 pr-2"}>
          {cartItems.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Your Cart is Empty"
              description="Looks like you haven't added any items to your cart yet. Start shopping and discover our quality medicines and health products."
              actionLabel="Start Shopping"
              onAction={() => router.push("/")}
              testId="button-start-shopping"
            />
          ) : (
            <>
              {cartItems.map((item) => (
                <Card key={item.id} className="shadow-lg rounded-3xl border-none overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"}
                          alt={item.product?.name}
                          className="w-full h-full object-contain p-2"
                          data-testid={`img-cart-item-${item.id}`}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base" data-testid={`text-cart-item-name-${item.id}`}>
                              {item.product?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.selectedPackage?.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-9 w-9 text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-accent/50 rounded-full p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-8 w-8 hover:bg-background"
                              onClick={() => updateQuantity(item.id, -1)}
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-bold" data-testid={`text-quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-8 w-8 hover:bg-background"
                              onClick={() => updateQuantity(item.id, 1)}
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="font-bold text-lg text-primary" data-testid={`text-price-${item.id}`}>
                            Rs {(parseFloat(item.selectedPackage?.price || "0") * item.quantity).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-background z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Card className="shadow-2xl rounded-3xl border-none bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-base">Rs {subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Delivery Charges</span>
                    <span className="font-semibold text-base">Rs {deliveryCharges}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl">Total</span>
                    <span className="font-bold text-xl text-primary">Rs {total.toFixed(0)}</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
                  onClick={() => router.push("/checkout")}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
