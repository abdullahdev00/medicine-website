'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut, Package, MapPin, Edit2, ChevronRight, Wallet, Users, Briefcase, Heart, CreditCard, X, Ticket, Settings } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/providers";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, logout, isAuthenticated } = useAuth();
  const [paymentAccountOpen, setPaymentAccountOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [raastId, setRaastId] = useState("");

  const { data: userPaymentAccounts = [] } = useQuery({
    queryKey: ["/api/user-payment-accounts", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/user-payment-accounts?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addPaymentAccountMutation = useMutation({
    mutationFn: async () => {
      if (!accountName || !raastId) throw new Error("All fields are required");
      
      const res = await apiRequest("POST", "/api/user-payment-accounts", {
        userId: user?.id,
        accountName,
        raastId,
        isDefault: userPaymentAccounts.length === 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-payment-accounts", user?.id] });
      toast({
        title: "Account added",
        description: "Payment account added successfully.",
      });
      setPaymentAccountOpen(false);
      setAccountName("");
      setRaastId("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payment account.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  const menuItems = [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Update your personal details",
      icon: Edit2,
      route: "/profile/edit",
      testId: "button-personal-info",
      color: "from-primary/20 to-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "wallet",
      title: "My Wallet",
      description: "View your balance & transactions",
      icon: Wallet,
      route: "/wallet",
      testId: "button-wallet",
      color: "from-chart-4/20 to-chart-4/10",
      iconColor: "text-chart-4",
    },
    {
      id: "my-orders",
      title: "My Orders",
      description: "Track your order history",
      icon: Package,
      route: "/orders",
      testId: "button-my-orders",
      color: "from-chart-2/20 to-chart-2/10",
      iconColor: "text-chart-2",
    },
    {
      id: "favorites",
      title: "My Favorites",
      description: "View your saved items",
      icon: Heart,
      route: "/wishlist",
      testId: "button-favorites",
      color: "from-red-500/20 to-red-500/10",
      iconColor: "text-red-500",
    },
    {
      id: "vouchers",
      title: "Vouchers & Coupons",
      description: "View available discounts",
      icon: Ticket,
      route: "/vouchers",
      testId: "button-vouchers",
      color: "from-orange-500/20 to-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      id: "affiliate",
      title: "Affiliate Program",
      description: "Earn with your referral code",
      icon: Users,
      route: "/affiliate",
      testId: "button-affiliate",
      color: "from-chart-5/20 to-chart-5/10",
      iconColor: "text-chart-5",
    },
    {
      id: "addresses",
      title: "Delivery Addresses",
      description: "Manage your addresses",
      icon: MapPin,
      route: "/addresses",
      testId: "button-addresses",
      color: "from-chart-3/20 to-chart-3/10",
      iconColor: "text-chart-3",
    },
    {
      id: "payment-accounts",
      title: "Payment Accounts",
      description: "Manage withdrawal accounts",
      icon: CreditCard,
      onClick: () => setPaymentAccountOpen(true),
      testId: "button-payment-accounts",
      color: "from-purple-500/20 to-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      id: "become-partner",
      title: "Become a Partner",
      description: "Apply for wholesale rates",
      icon: Briefcase,
      route: "/become-partner",
      testId: "button-become-partner",
      color: "from-primary/30 to-primary/20",
      iconColor: "text-primary",
    },
    {
      id: "settings",
      title: "Settings",
      description: "App preferences & install",
      icon: Settings,
      route: "/settings",
      testId: "button-settings",
      color: "from-blue-500/20 to-blue-500/10",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl">
              <User className="w-14 h-14 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold" data-testid="text-user-name">{user?.fullName || "Guest User"}</h1>
              <p className="text-muted-foreground mt-1" data-testid="text-user-email">{user?.email || "guest@example.com"}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="shadow-lg rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-none"
                onClick={() => item.onClick ? item.onClick() : router.push(item.route!)}
                data-testid={item.testId}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button
            variant="destructive"
            className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>

      <BottomNav />

      <Sheet open={paymentAccountOpen} onOpenChange={setPaymentAccountOpen}>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl p-0 border-none">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-bold">Payment Accounts</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPaymentAccountOpen(false)}
                  className="rounded-full h-10 w-10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {userPaymentAccounts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold">Your Accounts</h3>
                  {userPaymentAccounts.map((account: any) => (
                    <Card key={account.id} className="shadow-sm rounded-2xl border-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground font-mono">{account.raastId}</p>
                          </div>
                          {account.isDefault && (
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-base font-semibold">Add New Account</h3>
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="John's Account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="rounded-full h-12 px-4 mt-2"
                    data-testid="input-account-name"
                  />
                </div>
                <div>
                  <Label htmlFor="raastId">RAAST ID / Account Number</Label>
                  <Input
                    id="raastId"
                    placeholder="03001234567"
                    value={raastId}
                    onChange={(e) => setRaastId(e.target.value)}
                    className="rounded-full h-12 px-4 mt-2"
                    data-testid="input-raast-id"
                  />
                </div>
                <Button
                  onClick={() => addPaymentAccountMutation.mutate()}
                  disabled={addPaymentAccountMutation.isPending || !accountName || !raastId}
                  className="w-full rounded-full h-12"
                  data-testid="button-add-account"
                >
                  {addPaymentAccountMutation.isPending ? "Adding..." : "Add Account"}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
