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
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              className="rounded-full"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-bold">Shopping Cart</h1>
              <p className="text-sm text-muted-foreground">{cartItems.length} items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => setLocation("/home")} className="rounded-xl">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <Card key={item.id} className="shadow-sm rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-accent/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        data-testid={`img-cart-item-${item.id}`}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between gap-2">
                        <div>
                          <h3 className="font-semibold" data-testid={`text-cart-item-name-${item.id}`}>
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{item.selectedPackage}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-serif text-lg font-bold" data-testid={`text-price-${item.id}`}>
                          PKR {(parseFloat(item.price) * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="shadow-md rounded-2xl border-primary/20">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium" data-testid="text-subtotal">PKR {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span className="font-medium" data-testid="text-delivery">PKR {deliveryCharges}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-serif text-2xl font-bold text-primary" data-testid="text-total">
                    PKR {total.toFixed(0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full rounded-xl py-6 text-lg"
              onClick={() => setLocation("/checkout")}
              data-testid="button-checkout"
            >
              Proceed to Checkout
            </Button>
          </>
        )}
      </div>

      <BottomNav cartCount={cartItems.length} wishlistCount={0} />
    </div>
  );
}
