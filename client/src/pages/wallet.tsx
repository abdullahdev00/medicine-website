import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wallet, ArrowDownLeft, ArrowUpRight, Plus, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/EmptyState";

const mockTransactions = [
  {
    id: "1",
    type: "credit",
    amount: "500",
    description: "Affiliate Commission",
    date: "2024-01-20",
  },
  {
    id: "2",
    type: "debit",
    amount: "1200",
    description: "Order Payment",
    date: "2024-01-18",
  },
  {
    id: "3",
    type: "credit",
    amount: "250",
    description: "Cashback",
    date: "2024-01-15",
  },
  {
    id: "4",
    type: "credit",
    amount: "750",
    description: "Affiliate Commission",
    date: "2024-01-10",
  },
];

export default function WalletPage() {
  const [, setLocation] = useLocation();

  const totalBalance = "2850";

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
                  <p className="text-sm opacity-90">Available Balance</p>
                  <h2 className="font-serif text-4xl font-bold mt-1">
                    PKR {totalBalance}
                  </h2>
                </div>
              </div>
              <Button
                className="w-full rounded-full h-12 bg-white text-chart-4 hover:bg-white/90 font-semibold"
                data-testid="button-add-money"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Money
              </Button>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Recent Transactions</h3>
            {mockTransactions.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No Transactions Yet"
                description="Your wallet transaction history will appear here. Start shopping or earn through our affiliate program."
                iconColor="chart-4"
              />
            ) : (
              <div className="space-y-3">
                {mockTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-md rounded-3xl border-none">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              transaction.type === "credit"
                                ? "bg-chart-2/20"
                                : "bg-destructive/20"
                            }`}
                          >
                            {transaction.type === "credit" ? (
                              <ArrowDownLeft className="w-6 h-6 text-chart-2" />
                            ) : (
                              <ArrowUpRight className="w-6 h-6 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-serif text-xl font-bold ${
                            transaction.type === "credit"
                              ? "text-chart-2"
                              : "text-destructive"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}PKR {transaction.amount}
                        </p>
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
