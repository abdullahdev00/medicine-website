import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wallet, ArrowDownLeft, ArrowUpRight, Plus, Receipt } from "lucide-react";
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

  const totalBalance = userData?.walletBalance || "0";

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

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Transaction History</h3>
          </div>

          <div className="space-y-4">
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
                              transaction.type === "credit"
                                ? "bg-chart-2/10"
                                : "bg-destructive/10"
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
                              transaction.type === "credit"
                                ? "text-chart-2"
                                : "text-destructive"
                            }`}
                            data-testid={`text-amount-${transaction.id}`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}Rs.{" "}
                            {parseFloat(transaction.amount).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {transaction.status}
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
