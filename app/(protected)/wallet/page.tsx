"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Wallet, ArrowDownLeft, ArrowUpRight, Plus, Receipt, Clock, CheckCircle, XCircle, Download, Upload, X, Copy, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [addAmountOpen, setAddAmountOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ["/api/users", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/users/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["/api/wallet", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/wallet/${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: paymentRequests = [] } = useQuery({
    queryKey: ["/api/payment-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/payment-requests?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: paymentAccounts = [] } = useQuery({
    queryKey: ["/api/payment-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/payment-accounts");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: userPaymentAccounts = [] } = useQuery({
    queryKey: ["/api/user-payment-accounts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/user-payment-accounts?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const totalBalance = userData?.walletBalance || "0";

  const copyToClipboard = (text: string, accountId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(accountId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] }),
      queryClient.invalidateQueries({ queryKey: ["/api/wallet", user?.id] }),
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests", user?.id] }),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const addAmountMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPaymentAccount || !receiptFile) throw new Error("Missing required fields");
      
      const res = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          type: "add_amount",
          amount: "0",
          paymentMethod: selectedPaymentAccount.method,
          paymentAccountId: selectedPaymentAccount.id,
          receiptUrl: receiptPreview,
          status: "pending",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests", user?.id] });
      toast({
        title: "Request submitted",
        description: "Your add amount request has been submitted successfully.",
      });
      setAddAmountOpen(false);
      setReceiptFile(null);
      setReceiptPreview("");
      setSelectedPaymentAccount(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!withdrawAmount || !selectedWithdrawAccount) throw new Error("Missing required fields");
      
      const amount = parseFloat(withdrawAmount);
      const balance = parseFloat(totalBalance);
      
      if (amount > balance) {
        throw new Error("Insufficient balance");
      }
      
      const res = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          type: "withdraw",
          amount: withdrawAmount,
          userPaymentAccountId: selectedWithdrawAccount.id,
          status: "pending",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit withdrawal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests", user?.id] });
      toast({
        title: "Request submitted",
        description: "Your withdrawal request has been submitted successfully.",
      });
      setWithdrawOpen(false);
      setWithdrawAmount("");
      setSelectedWithdrawAccount(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
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
              onClick={() => router.push("/profile")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="font-serif text-2xl font-bold">My Wallet</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your balance
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
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

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button
                  variant="secondary"
                  className="w-full rounded-full h-12 font-semibold bg-white text-chart-4 hover:bg-white/90"
                  onClick={() => setAddAmountOpen(true)}
                  data-testid="button-add-amount"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Amount
                </Button>
                <Button
                  variant="secondary"
                  className="w-full rounded-full h-12 font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/30"
                  onClick={() => setWithdrawOpen(true)}
                  data-testid="button-withdraw"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Withdraw
                </Button>
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
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Receipt className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Transactions</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    You haven't made any transactions yet. Your wallet transaction history will appear here.
                  </p>
                </div>
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
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Receipt className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Payment Requests</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    You haven't submitted any payment requests yet.
                  </p>
                </div>
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
                                  <p className="font-semibold capitalize">{request.type?.replace('_', ' ') || 'Payment Request'}</p>
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
                            {request.rejectionReason && request.status === 'rejected' && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Rejection Reason:</p>
                                <p className="text-sm text-red-600 dark:text-red-400">{request.rejectionReason}</p>
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

      <Sheet open={addAmountOpen} onOpenChange={setAddAmountOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 border-none">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-bold">Add Amount</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAddAmountOpen(false)}
                  className="rounded-full h-10 w-10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">Select Payment Method</Label>
                <RadioGroup
                  value={selectedPaymentAccount?.id || ""}
                  onValueChange={(value) => {
                    const account = paymentAccounts.find((acc: any) => acc.id === value);
                    setSelectedPaymentAccount(account);
                  }}
                  className="space-y-3"
                >
                  {paymentAccounts.map((account: any) => (
                    <label
                      key={account.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                        selectedPaymentAccount?.id === account.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={account.id} className="flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">{account.method}</p>
                        <p className="text-sm text-muted-foreground">{account.accountName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-mono">{account.accountNumber}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(account.accountNumber, account.id);
                            }}
                          >
                            {copiedId === account.id ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {selectedPaymentAccount && (
                <div>
                  <Label className="text-base font-semibold mb-4 block">Upload Payment Receipt</Label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {receiptPreview ? (
                      <div className="relative">
                        <img src={receiptPreview} alt="Receipt preview" className="max-h-48 mx-auto rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptFile(null);
                            setReceiptPreview("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop your receipt here, or click to browse
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <Button
                className="w-full rounded-full h-14 text-base font-semibold"
                disabled={!selectedPaymentAccount || !receiptFile || addAmountMutation.isPending}
                onClick={() => addAmountMutation.mutate()}
                data-testid="button-submit-add-amount"
              >
                {addAmountMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 border-none">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-bold">Withdraw Funds</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWithdrawOpen(false)}
                  className="rounded-full h-10 w-10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <Label className="text-base font-semibold mb-2 block">Available Balance</Label>
                <div className="bg-muted rounded-2xl p-4">
                  <p className="text-3xl font-bold text-primary">Rs. {parseFloat(totalBalance).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="withdraw-amount" className="text-base font-semibold mb-2 block">
                  Withdrawal Amount
                </Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="h-14 text-lg rounded-2xl"
                  data-testid="input-withdraw-amount"
                />
              </div>

              {userPaymentAccounts.length === 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    No payment accounts found. Please add a payment account from your profile to withdraw funds.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 w-full rounded-full"
                    onClick={() => {
                      setWithdrawOpen(false);
                      router.push("/profile");
                    }}
                  >
                    Go to Profile
                  </Button>
                </div>
              ) : (
                <div>
                  <Label className="text-base font-semibold mb-4 block">Select Account</Label>
                  <RadioGroup
                    value={selectedWithdrawAccount?.id || ""}
                    onValueChange={(value) => {
                      const account = userPaymentAccounts.find((acc: any) => acc.id === value);
                      setSelectedWithdrawAccount(account);
                    }}
                    className="space-y-3"
                  >
                    {userPaymentAccounts.map((account: any) => (
                      <label
                        key={account.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                          selectedWithdrawAccount?.id === account.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={account.id} className="flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold">{account.accountName}</p>
                          <p className="text-sm text-muted-foreground font-mono">{account.raastId}</p>
                          {account.isDefault && (
                            <span className="inline-block mt-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <Button
                className="w-full rounded-full h-14 text-base font-semibold"
                disabled={!withdrawAmount || !selectedWithdrawAccount || withdrawMutation.isPending}
                onClick={() => withdrawMutation.mutate()}
                data-testid="button-submit-withdraw"
              >
                {withdrawMutation.isPending ? "Submitting..." : "Submit Withdrawal"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
