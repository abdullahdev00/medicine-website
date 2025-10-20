'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Copy, Check, Package, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/providers";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AffiliateHelpButton } from "@/components/AffiliateHelpButton";

export default function AffiliatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ["/api/users", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/users/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const { data: allOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["/api/orders", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/orders?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const referralOrders = allOrders.filter((order: any) => order.affiliateUserId === user?.id);

  const couponCode = userData?.affiliateCode || "";
  const totalEarnings = userData?.totalEarnings || "0";
  const pendingEarnings = userData?.pendingEarnings || "0";

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    return status === "completed" || status === "delivered"
      ? "bg-chart-2/20 text-chart-2 border-chart-2/30"
      : "bg-chart-3/20 text-chart-3 border-chart-3/30";
  };

  if (loadingUser || loadingOrders) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading affiliate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-chart-5/10 via-chart-5/5 to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4">
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
                <h1 className="font-serif text-2xl font-bold">Affiliate Program</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Earn with your referral code
                </p>
              </div>
            </div>
            <AffiliateHelpButton variant="ghost" size="icon" className="rounded-full w-12 h-12" />
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
                  <p className="font-serif text-2xl font-bold mt-1">Rs. {parseFloat(totalEarnings).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="font-serif text-2xl font-bold mt-1">Rs. {parseFloat(pendingEarnings).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Referral Orders</h3>
            {referralOrders.length === 0 ? (
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
                {referralOrders.map((order: any, index: number) => (
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
                            <p className="font-semibold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(order.createdAt), "MMM dd, yyyy")}
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

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Order Amount</p>
                          <p className="font-bold text-lg mt-1">Rs. {parseFloat(order.totalPrice).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Your Commission</p>
                          <p className="font-bold text-lg text-chart-5 mt-1">
                            Rs. {parseFloat(order.affiliateCommission || "0").toLocaleString()}
                          </p>
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
