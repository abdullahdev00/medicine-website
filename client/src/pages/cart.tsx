import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Minus, Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

import paracetamolImg from "@assets/generated_images/Paracetamol_tablet_product_photo_f970b2f0.png";
import vitaminCImg from "@assets/generated_images/Vitamin_C_supplement_bottle_d4b69c6b.png";

const mockCartItems = [
  {
    id: "1",
    productId: "1",
    name: "Paracetamol 500mg",
    price: "120",
    quantity: 2,
    imageUrl: paracetamolImg,
    selectedPackage: "20 Tablets",
  },
  {
    id: "2",
    productId: "2",
    name: "Vitamin C 1000mg",
    price: "890",
    quantity: 1,
    imageUrl: vitaminCImg,
    selectedPackage: "60 Tablets",
  },
];

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState(mockCartItems);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const deliveryCharges = 150;
  const total = subtotal + deliveryCharges;

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            className="w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-all"
            onClick={() => setLocation("/home")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-serif text-2xl font-bold">Shopping Cart</h1>
        </div>

        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button onClick={() => setLocation("/home")} className="rounded-full px-8">
                Start Shopping
              </Button>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <Card key={item.id} className="shadow-lg rounded-3xl border-none overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                          data-testid={`img-cart-item-${item.id}`}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base" data-testid={`text-cart-item-name-${item.id}`}>
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.selectedPackage}</p>
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
                              disabled={item.quantity <= 1}
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
                            Rs {(parseFloat(item.price) * item.quantity).toFixed(0)}
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
        <div className="fixed bottom-28 left-0 right-0 bg-background z-40">
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
                  onClick={() => setLocation("/checkout")}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <BottomNav cartCount={cartItems.length} />
    </div>
  );
}
