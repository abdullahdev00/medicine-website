"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Copy, Upload, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Checkout() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string>(""); // Supabase storage URL
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { cartItems } = useCart();

  const { data: addresses = [] } = useQuery<any[]>({
    queryKey: ["/api/addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/addresses?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: paymentAccounts = [] } = useQuery<any[]>({
    queryKey: ["/api/payment-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/payment-accounts");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: userData } = useQuery({
    queryKey: ["/api/users", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/users/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress?.id || "");
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (paymentMethod === "online" && paymentAccounts.length > 0 && !selectedPaymentAccount) {
      setSelectedPaymentAccount(paymentAccounts[0]);
    }
  }, [paymentMethod, paymentAccounts, selectedPaymentAccount]);

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.selectedPackage?.price || "0") * item.quantity, 0);
  const deliveryCharges = 150;
  const total = subtotal + deliveryCharges;
  const walletBalance = parseFloat(userData?.walletBalance || "0");
  const canPayFromWallet = (paymentMethod === "wallet" && walletBalance >= total) || (paymentMethod === "online" && walletBalance >= total);
  const needsPaymentRequest = paymentMethod === "online" && walletBalance < total;

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

  const uploadReceiptToSupabase = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingReceipt(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt_${user?.id}_${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload receipt. Please try again.",
          variant: "destructive",
        });
        return null;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);
      
      toast({
        title: "Receipt uploaded",
        description: "Receipt uploaded successfully!",
      });
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload receipt. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleFileChange = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setReceiptFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload to Supabase Storage
      const uploadedUrl = await uploadReceiptToSupabase(file);
      if (uploadedUrl) {
        setReceiptUrl(uploadedUrl);
      }
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (PNG, JPG, JPEG)",
        variant: "destructive",
      });
    }
  };

  const createPaymentRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          amount: total.toString(),
          paymentMethod: "online",
          paymentAccountId: selectedPaymentAccount?.id,
          receiptUrl: receiptUrl, // Use Supabase Storage URL instead of base64
          orderId: data.orderId,
          orderData: data,
          status: "pending",
        }),
      });
      if (!res.ok) throw new Error("Failed to create payment request");
      return res.json();
    },
    onSuccess: async () => {
      if (user?.id) {
        await fetch(`/api/cart?userId=${user.id}`, { method: "DELETE" });
        queryClient.invalidateQueries({ queryKey: ["/api/cart", user.id] });
      }
      toast({
        title: "Payment request submitted",
        description: "Your payment request is pending verification. You can check its status in your wallet.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", user?.id] });
      router.push("/wallet");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit payment request",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedAddressId) {
      toast({
        title: "Address required",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) return;

    if (paymentMethod === "wallet" && walletBalance < total) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance in your wallet. Please add funds or choose another payment method.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const deliveryAddress = `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.province} - ${selectedAddress.postalCode}`;

    const paidFromWallet = canPayFromWallet ? total.toString() : "0";
    
    const orderData = {
      userId: user.id,
      products: cartItems.map((item) => ({
        productId: item.productId,
        name: item.product?.name || "",
        quantity: item.quantity,
        price: item.selectedPackage?.price || "0",
        variantName: item.selectedPackage?.name || "",
      })),
      totalPrice: total.toString(),
      deliveryAddress,
      paymentMethod,
      paidFromWallet,
    };

    if (needsPaymentRequest) {
      if (!receiptUrl) {
        toast({
          title: "Receipt required",
          description: "Please upload payment receipt and wait for upload to complete",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      if (isUploadingReceipt) {
        toast({
          title: "Upload in progress",
          description: "Please wait for receipt upload to complete",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      try {
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderData,
            status: "awaiting_payment",
          }),
        });

        if (!orderResponse.ok) {
          throw new Error("Failed to create order");
        }

        const order = await orderResponse.json();
        createPaymentRequestMutation.mutate({ ...orderData, orderId: order.id });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create order. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    } else {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error("Failed to place order");
        }

        const order = await response.json();

        queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/wallet", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/orders", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });

        setTimeout(() => {
          router.push(`/orders/${order.id}`);
        }, 500);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to place order. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            className="w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-all"
            onClick={() => router.push("/cart")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-serif text-2xl font-bold">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-lg rounded-3xl border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Delivery Address</CardTitle>
              {addresses.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/addresses")}
                  data-testid="button-manage-addresses"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No saved addresses</p>
                  <Button
                    type="button"
                    onClick={() => router.push("/addresses")}
                    data-testid="button-add-address"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId}>
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`flex items-start space-x-3 p-4 rounded-2xl border-2 hover:bg-accent/5 transition-colors ${
                        selectedAddressId === address.id ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={address.id} id={address.id} data-testid={`radio-address-${address.id}`} />
                      <Label htmlFor={address.id} className="cursor-pointer flex-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{address.label}</p>
                            {address.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.address}, {address.city}, {address.province} - {address.postalCode}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-3xl border-none">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div
                  className={`flex items-center space-x-3 p-4 rounded-2xl border-2 hover:bg-accent/5 transition-colors ${
                    paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="cod" id="cod" data-testid="radio-cod" />
                  <Label htmlFor="cod" className="cursor-pointer flex-1">
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </Label>
                </div>

                <div
                  className={`flex items-center space-x-3 p-4 rounded-2xl border-2 hover:bg-accent/5 transition-colors mt-3 ${
                    paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="online" id="online" data-testid="radio-online" />
                  <Label htmlFor="online" className="cursor-pointer flex-1">
                    <div>
                      <p className="font-semibold">Online Payment</p>
                      <p className="text-sm text-muted-foreground">Pay via JazzCash, EasyPaisa, or Bank Transfer</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "online" && (
                <div className="mt-6 space-y-4">
                  <div className="bg-accent/20 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">Your Wallet Balance:</p>
                        <p className="text-2xl font-bold text-primary">Rs {walletBalance.toFixed(0)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Order Total: Rs {total.toFixed(0)}</p>
                      </div>
                    </div>

                    {needsPaymentRequest && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Insufficient wallet balance. Please upload payment receipt to create a payment request.
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="font-medium mb-3">Payment Account Details:</p>
                      <RadioGroup
                        value={selectedPaymentAccount?.id || ""}
                        onValueChange={(val) => {
                          const account = paymentAccounts.find((acc) => acc.id === val);
                          setSelectedPaymentAccount(account);
                        }}
                        className="space-y-2"
                      >
                        {paymentAccounts.map((account) => (
                          <div
                            key={account.id}
                            className={`bg-card border rounded-xl p-3 hover:border-primary transition-colors ${
                              selectedPaymentAccount?.id === account.id ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1">
                                <RadioGroupItem value={account.id} id={account.id} />
                                <Label htmlFor={account.id} className="cursor-pointer flex-1">
                                  <p className="font-semibold text-sm">{account.method}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">{account.accountName}</p>
                                    {account.bankName && (
                                      <>
                                        <span className="text-xs">•</span>
                                        <p className="text-xs text-muted-foreground">{account.bankName}</p>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-xs font-mono mt-1 text-primary">{account.accountNumber}</p>
                                </Label>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(account.accountNumber || '', account.id);
                                }}
                                data-testid={`button-copy-${account.id}`}
                              >
                                <AnimatePresence mode="wait">
                                  {copiedId === account.id ? (
                                    <motion.div
                                      key="check"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Check className="w-4 h-4 text-green-600" />
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="copy"
                                      initial={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                      
                      {selectedPaymentAccount?.additionalInfo?.instructions && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <p className="text-xs text-amber-800 dark:text-amber-200">
                            <span className="font-semibold">Instructions:</span> {selectedPaymentAccount.additionalInfo.instructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {needsPaymentRequest && (
                      <div>
                        <p className="font-medium mb-2">Upload Payment Receipt:</p>
                        {!receiptPreview ? (
                          <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                            } ${isUploadingReceipt ? "pointer-events-none opacity-50" : ""}`}
                            onClick={() => !isUploadingReceipt && document.getElementById("receipt-upload")?.click()}
                          >
                            {isUploadingReceipt ? (
                              <>
                                <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-medium mb-1">Uploading receipt...</p>
                                <p className="text-xs text-muted-foreground">Please wait</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-sm font-medium mb-1">Drop receipt here or click to browse</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                              </>
                            )}
                            <input
                              id="receipt-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingReceipt}
                              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                            />
                          </div>
                        ) : (
                          <div className="relative border rounded-2xl p-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              disabled={isUploadingReceipt}
                              onClick={() => {
                                setReceiptFile(null);
                                setReceiptPreview("");
                                setReceiptUrl("");
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <img 
                              src={receiptUrl || receiptPreview} 
                              alt="Receipt preview" 
                              className="w-full h-auto rounded-lg" 
                            />
                            <div className="mt-2 text-center">
                              <p className="text-sm text-muted-foreground">{receiptFile?.name}</p>
                              {receiptUrl && (
                                <div className="flex items-center justify-center gap-2 mt-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <p className="text-xs text-green-600">Uploaded successfully</p>
                                </div>
                              )}
                              {isUploadingReceipt && (
                                <div className="flex items-center justify-center gap-2 mt-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  <p className="text-xs text-blue-600">Uploading...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-3xl border-none">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">Rs {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span className="font-semibold">Rs {deliveryCharges}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">Rs {total.toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
            disabled={isProcessing || addresses.length === 0}
            data-testid="button-place-order"
          >
            {isProcessing
              ? "Processing..."
              : needsPaymentRequest
              ? "Submit Payment Request"
              : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
}
