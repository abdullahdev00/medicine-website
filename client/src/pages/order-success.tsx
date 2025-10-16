import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const [, setLocation] = useLocation();
  
  const orderId = "MED-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const expectedDelivery = new Date();
  expectedDelivery.setDate(expectedDelivery.getDate() + 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="bg-chart-2/10 p-6 rounded-full">
            <CheckCircle2 className="w-24 h-24 text-chart-2" strokeWidth={1.5} />
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll deliver it soon.
          </p>
        </div>

        <Card className="shadow-xl rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-xl">
              <Package className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-semibold" data-testid="text-order-id">
                  {orderId}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Expected Delivery</p>
              <p className="font-semibold text-lg" data-testid="text-expected-delivery">
                {expectedDelivery.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                className="w-full rounded-xl"
                onClick={() => setLocation("/profile")}
                data-testid="button-view-orders"
              >
                View My Orders
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setLocation("/home")}
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
