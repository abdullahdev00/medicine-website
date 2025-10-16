import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      setLocation("/order-success");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            className="w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-all"
            onClick={() => setLocation("/cart")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-serif text-2xl font-bold">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-lg rounded-3xl border-none">
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  defaultValue="Ahmad Khan"
                  required
                  className="rounded-2xl h-12"
                  data-testid="input-full-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  defaultValue="+92 300 1234567"
                  required
                  className="rounded-2xl h-12"
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Complete Address</Label>
                <Input
                  id="address"
                  defaultValue="House 123, Street 4, Gulshan-e-Iqbal"
                  required
                  className="rounded-2xl h-12"
                  data-testid="input-address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    defaultValue="Karachi"
                    required
                    className="rounded-2xl h-12"
                    data-testid="input-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    defaultValue="Sindh"
                    required
                    className="rounded-2xl h-12"
                    data-testid="input-province"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-3xl border-none">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 hover:bg-accent/5 cursor-pointer transition-colors"
                     onClick={() => setPaymentMethod("cod")}>
                  <RadioGroupItem value="cod" id="cod" data-testid="radio-cod" />
                  <Label htmlFor="cod" className="cursor-pointer flex-1">
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 hover:bg-accent/5 cursor-pointer transition-colors mt-3"
                     onClick={() => setPaymentMethod("online")}>
                  <RadioGroupItem value="online" id="online" data-testid="radio-online" />
                  <Label htmlFor="online" className="cursor-pointer flex-1">
                    <div>
                      <p className="font-semibold">Online Payment</p>
                      <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-3xl border-none">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">Rs 1,130</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span className="font-semibold">Rs 150</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">Rs 1,280</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
            disabled={isProcessing}
            data-testid="button-place-order"
          >
            {isProcessing ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
}
