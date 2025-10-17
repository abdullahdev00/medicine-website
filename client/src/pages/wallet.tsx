import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Wallet, ArrowDownLeft, ArrowUpRight, Plus, Receipt, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ["/api/users", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/users/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["/api/wallet", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/wallet/${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: paymentRequests = [] } = useQuery({
    queryKey: ["/api/payment-requests", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/payment-requests?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const totalBalance = userData?.walletBalance || "0";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "rejected":
        return "bg-red-500/10 text-red-700 dark:text-red-300";
      default:
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
    }
  };

  if (loadingUser || loadingTransactions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-chart-4/10 via-chart-4/5 to-accent/10 border-b">
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
              <h1 className="font-serif text-2xl font-bold">My Wallet</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your balance
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
          <Card className="shadow-xl rounded-3xl border-none bg-gradient-to-br from-chart-4 to-chart-4/80 text-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80 font-medium">Total Balance</p>
                  <h2 className="text-4xl font-bold mt-1">
                    Rs. {parseFloat(totalBalance).toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="payment-requests">Payment Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4 mt-6">
              {transactions.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No Transactions"
                  description="You haven't made any transactions yet. Your wallet transaction history will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction: any, index: number) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  transaction.type === "credit" ? "bg-chart-2/10" : "bg-destructive/10"
                                }`}
                              >
                                {transaction.type === "credit" ? (
                                  <ArrowDownLeft className="w-6 h-6 text-chart-2" />
                                ) : (
                                  <ArrowUpRight className="w-6 h-6 text-destructive" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold" data-testid={`text-description-${transaction.id}`}>
                                  {transaction.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold text-lg ${
                                  transaction.type === "credit" ? "text-chart-2" : "text-destructive"
                                }`}
                                data-testid={`text-amount-${transaction.id}`}
                              >
                                {transaction.type === "credit" ? "+" : "-"}Rs. {parseFloat(transaction.amount).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">{transaction.status}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payment-requests" className="space-y-4 mt-6">
              {paymentRequests.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No Payment Requests"
                  description="You haven't submitted any payment requests yet."
                />
              ) : (
                <div className="space-y-3">
                  {paymentRequests.map((request: any, index: number) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(request.status)}
                                <div>
                                  <p className="font-semibold">Payment Request</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(request.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-primary">Rs. {parseFloat(request.amount).toLocaleString()}</p>
                                <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </div>
                            </div>
                            {request.receiptUrl && (
                              <div className="border rounded-lg p-2">
                                <img
                                  src={request.receiptUrl}
                                  alt="Payment receipt"
                                  className="w-full h-32 object-contain rounded"
                                />
                              </div>
                            )}
                            {request.adminNotes && (
                              <div className="bg-muted rounded-lg p-3">
                                <p className="text-sm font-medium mb-1">Admin Note:</p>
                                <p className="text-sm text-muted-foreground">{request.adminNotes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
