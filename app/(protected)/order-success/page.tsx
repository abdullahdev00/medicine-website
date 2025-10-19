"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Order } from "@shared/schema";

export default function OrderSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    const id = searchParams.get("orderId");
    if (id) {
      setOrderId(id);
    }
  }, [searchParams]);

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <p className="text-muted-foreground">No order ID found</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const displayOrderId = "MED-" + order.id.slice(0, 8).toUpperCase();

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

        <Card className="shadow-2xl rounded-3xl border-none overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="font-mono font-bold text-lg" data-testid="text-order-id">
                  {displayOrderId}
                </p>
              </div>
            </div>

            {order.expectedDelivery && (
              <div className="space-y-2 p-5 bg-accent/30 rounded-2xl">
                <p className="text-sm text-muted-foreground">Expected Delivery</p>
                <p className="font-bold text-xl text-primary" data-testid="text-expected-delivery">
                  {new Date(order.expectedDelivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <Button
                className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
                onClick={() => router.push("/orders")}
                data-testid="button-view-orders"
              >
                View My Orders
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full h-14 text-base font-semibold border-2"
                onClick={() => router.push("/")}
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
