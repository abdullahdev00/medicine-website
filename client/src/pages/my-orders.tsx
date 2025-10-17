import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function MyOrders() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders", user?.id],
    enabled: isAuthenticated && !!user,
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
              onClick={() => setLocation("/profile")}
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
          <EmptyState
            icon={Package}
            title="No Orders Yet"
            description="You haven't placed any orders yet. Start shopping to see your order history here."
            actionLabel="Start Shopping"
            onAction={() => setLocation("/home")}
            iconColor="chart-2"
            testId="button-start-shopping"
          />
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
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-chart-2/20 to-chart-2/10 flex items-center justify-center">
                        <Package className="w-8 h-8 text-chart-2" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg" data-testid={`text-order-id-${order.id}`}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(order.createdAt), "MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Badge className={`rounded-full px-4 py-2 text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Order Items:</p>
                    {order.products.map((item: any, itemIndex: number) => (
                      <p key={itemIndex} className="text-base">
                        • {item.name} x {item.quantity} {item.selectedPackage && `(${item.selectedPackage})`}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-muted-foreground font-medium">Total Amount</span>
                    <span className="font-serif text-2xl font-bold text-primary">
                      Rs. {parseFloat(order.totalPrice).toLocaleString()}
                    </span>
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
