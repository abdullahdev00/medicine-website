"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function MyOrders() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/orders?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "pending":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30";
      case "cancelled":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => router.push("/profile")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-bold">My Orders</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track your order history
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-chart-2/10 flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-chart-2" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="rounded-full"
              data-testid="button-start-shopping"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order: any, index: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg rounded-3xl border-none overflow-hidden">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-sm" data-testid={`text-order-id-${order.id}`}>
                            MED-{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(order.status)} capitalize px-4 py-1.5 font-semibold`}
                        data-testid={`badge-status-${order.id}`}
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <div className="space-y-3 pt-3 border-t">
                      {order.products?.map((product: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.variantName} × {product.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">Rs {parseFloat(product.price).toFixed(0)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          Rs {parseFloat(order.totalPrice).toFixed(0)}
                        </p>
                      </div>
                      <Button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        variant="outline"
                        className="rounded-full"
                        data-testid={`button-view-order-${order.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
