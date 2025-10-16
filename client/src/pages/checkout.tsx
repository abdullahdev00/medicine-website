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
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/cart")}
              className="rounded-full"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-2xl font-bold">Checkout</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="shadow-md rounded-2xl">
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
                className="rounded-xl"
                data-testid="input-full-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                defaultValue="+92 300 1234567"
                required
                className="rounded-xl"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Complete Address</Label>
              <Input
                id="address"
                defaultValue="House 123, Street 4, Gulshan-e-Iqbal"
                required
                className="rounded-xl"
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
                  className="rounded-xl"
                  data-testid="input-city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  defaultValue="Sindh"
                  required
                  className="rounded-xl"
                  data-testid="input-province"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-3 p-4 rounded-xl border-2 hover-elevate cursor-pointer"
                   onClick={() => setPaymentMethod("cod")}>
                <RadioGroupItem value="cod" id="cod" data-testid="radio-cod" />
                <Label htmlFor="cod" className="cursor-pointer flex-1">
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-xl border-2 hover-elevate cursor-pointer mt-3"
                   onClick={() => setPaymentMethod("online")}>
                <RadioGroupItem value="online" id="online" data-testid="radio-online" />
                <Label htmlFor="online" className="cursor-pointer flex-1">
                  <div>
                    <p className="font-semibold">Online Payment</p>
                    <p className="text-sm text-muted-foreground">EasyPaisa / JazzCash</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === "online" && (
              <div className="mt-4 p-4 bg-accent/50 rounded-xl space-y-3">
                <p className="text-sm font-medium">Payment Information</p>
                <div className="space-y-2">
                  <Label htmlFor="account-number" className="text-sm">Account Number</Label>
                  <Input
                    id="account-number"
                    placeholder="03XX XXXXXXX"
                    className="rounded-xl"
                    data-testid="input-account-number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-id" className="text-sm">Transaction ID (Optional)</Label>
                  <Input
                    id="transaction-id"
                    placeholder="Enter transaction ID after payment"
                    className="rounded-xl"
                    data-testid="input-transaction-id"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">PKR 1,130</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Charges</span>
              <span className="font-medium">PKR 150</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-serif text-2xl font-bold text-primary" data-testid="text-total">
                PKR 1,280
              </span>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl py-6 text-lg"
          disabled={isProcessing}
          data-testid="button-confirm-order"
        >
          {isProcessing ? "Processing..." : "Confirm Order"}
        </Button>
      </form>
    </div>
  );
}
