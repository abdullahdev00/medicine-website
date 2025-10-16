import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Copy, Check, Package, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/EmptyState";

const mockReferralOrders = [
  {
    id: "REF-001",
    customerName: "Ali Ahmed",
    amount: "1500",
    commission: "150",
    date: "2024-01-20",
    status: "completed",
  },
  {
    id: "REF-002",
    customerName: "Sara Khan",
    amount: "890",
    commission: "89",
    date: "2024-01-18",
    status: "completed",
  },
  {
    id: "REF-003",
    customerName: "Usman Ali",
    amount: "2340",
    commission: "234",
    date: "2024-01-15",
    status: "pending",
  },
];

export default function AffiliatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const couponCode = "MED789";
  const totalEarnings = "473";
  const pendingEarnings = "234";

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Coupon code copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    return status === "completed"
      ? "bg-chart-2/20 text-chart-2 border-chart-2/30"
      : "bg-chart-3/20 text-chart-3 border-chart-3/30";
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-chart-5/10 via-chart-5/5 to-accent/10 border-b">
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
              <h1 className="font-serif text-2xl font-bold">Affiliate Program</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Earn with your referral code
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="shadow-xl rounded-3xl border-none bg-gradient-to-br from-chart-5 to-chart-5/80 text-white">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Your Referral Code</p>
                  <div className="flex items-center gap-3 mt-2">
                    <h2 className="font-mono text-3xl font-bold tracking-wider">
                      {couponCode}
                    </h2>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full w-10 h-10 bg-white/20 hover:bg-white/30"
                      onClick={handleCopy}
                      data-testid="button-copy-code"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-sm opacity-90">Total Earnings</p>
                  <p className="font-serif text-2xl font-bold mt-1">PKR {totalEarnings}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="font-serif text-2xl font-bold mt-1">PKR {pendingEarnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Referral Orders</h3>
            {mockReferralOrders.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No Referrals Yet"
                description="Share your referral code with friends and family. Earn commission on every order they place through your code."
                actionLabel="Share Code"
                onAction={handleCopy}
                iconColor="chart-5"
                testId="button-share-code"
              />
            ) : (
              <div className="space-y-4">
                {mockReferralOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg rounded-3xl border-none">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-chart-5/20 to-chart-5/10 flex items-center justify-center">
                            <Package className="w-7 h-7 text-chart-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{order.id}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.customerName}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`rounded-full px-4 py-2 text-sm font-semibold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order Amount</span>
                          <span className="font-semibold">PKR {order.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Your Commission</span>
                          <span className="font-semibold text-chart-5">
                            PKR {order.commission}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-semibold">
                            {new Date(order.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
