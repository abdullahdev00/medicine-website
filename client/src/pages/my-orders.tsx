import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";
import { motion } from "framer-motion";

const mockOrders = [
  {
    id: "MED-ABC123",
    date: "2024-01-15",
    total: "1280",
    status: "delivered",
    items: ["Paracetamol 500mg", "Vitamin C 1000mg"],
  },
  {
    id: "MED-XYZ789",
    date: "2024-01-20",
    total: "890",
    status: "pending",
    items: ["Cough Syrup"],
  },
  {
    id: "MED-DEF456",
    date: "2024-01-10",
    total: "1550",
    status: "delivered",
    items: ["Omega-3 Fish Oil", "Multivitamin"],
  },
];

export default function MyOrders() {
  const [, setLocation] = useLocation();

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
        <div className="space-y-5">
          {mockOrders.map((order, index) => (
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
                          {order.id}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className={`rounded-full px-4 py-2 text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Order Items:</p>
                    {order.items.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-base">
                        • {item}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-muted-foreground font-medium">Total Amount</span>
                    <span className="font-serif text-2xl font-bold text-primary">
                      PKR {order.total}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {mockOrders.length === 0 && (
          <Card className="shadow-lg rounded-3xl border-none">
            <CardContent className="p-16 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">No orders yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
