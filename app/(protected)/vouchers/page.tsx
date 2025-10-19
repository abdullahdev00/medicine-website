"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Ticket, Copy, Check, Calendar, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";

type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string | null;
  expiryDate: string | null;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
};

export default function VouchersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: vouchers = [], isLoading } = useQuery<Voucher[]>({
    queryKey: ["/api/vouchers"],
    queryFn: async () => {
      const res = await fetch("/api/vouchers");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ["/api/cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/cart?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Code Copied!",
      description: `Voucher code "${code}" copied to clipboard.`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getDiscountText = (voucher: Voucher) => {
    if (voucher.discountType === "percentage") {
      return `${voucher.discountValue}% OFF`;
    }
    return `Rs. ${voucher.discountValue} OFF`;
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-cyan-500 to-blue-600",
      "bg-gradient-to-br from-purple-500 to-pink-600",
      "bg-gradient-to-br from-orange-500 to-red-600",
      "bg-gradient-to-br from-emerald-500 to-teal-600",
      "bg-gradient-to-br from-indigo-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-rose-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary/10 to-accent/20 border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <button
              className="w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-all"
              onClick={() => router.push("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-primary" />
            </button>
            <div>
              <h1 className="font-serif text-2xl font-bold">Coupons & Vouchers</h1>
              <p className="text-sm text-muted-foreground">Save more on your orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Ticket className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Vouchers Available</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Check back later for exciting discount vouchers and special offers.
            </p>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="rounded-full"
              data-testid="button-browse-products"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {vouchers.map((voucher, index) => {
              const expired = isExpired(voucher.expiryDate);
              const isCopied = copiedCode === voucher.code;
              
              return (
                <Card
                  key={voucher.id}
                  className="overflow-hidden border-2 hover:shadow-lg transition-all"
                  data-testid={`card-voucher-${voucher.id}`}
                >
                  <div className="flex flex-col md:flex-row">
                    <div
                      className={`${getGradientClass(index)} text-white p-6 md:w-1/3 flex flex-col justify-center items-center relative`}
                    >
                      <div className="absolute top-3 right-3">
                        <Ticket className="w-8 h-8 opacity-20" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {getDiscountText(voucher)}
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-white/30"
                        >
                          {voucher.discountType === "percentage" ? "Percentage" : "Flat"} Discount
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1" data-testid={`text-voucher-title-${voucher.id}`}>
                            {voucher.title}
                          </h3>
                          {voucher.description && (
                            <p className="text-sm text-muted-foreground">
                              {voucher.description}
                            </p>
                          )}
                        </div>
                        {expired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg border-2 border-dashed">
                        <Tag className="w-4 h-4 text-primary" />
                        <code className="font-mono font-bold text-lg flex-1" data-testid={`text-code-${voucher.id}`}>
                          {voucher.code}
                        </code>
                        <Button
                          size="sm"
                          variant={isCopied ? "default" : "outline"}
                          onClick={() => copyVoucherCode(voucher.code)}
                          disabled={expired}
                          data-testid={`button-copy-${voucher.id}`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2 text-sm">
                        {parseFloat(voucher.minOrderAmount) > 0 && (
                          <div className="flex items-center text-muted-foreground">
                            <span className="mr-2">•</span>
                            Minimum order: Rs. {parseFloat(voucher.minOrderAmount).toFixed(0)}
                          </div>
                        )}
                        {voucher.maxDiscount && voucher.discountType === "percentage" && (
                          <div className="flex items-center text-muted-foreground">
                            <span className="mr-2">•</span>
                            Max discount: Rs. {parseFloat(voucher.maxDiscount).toFixed(0)}
                          </div>
                        )}
                        {voucher.expiryDate && (
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Valid until {format(new Date(voucher.expiryDate), "dd MMM yyyy")}
                          </div>
                        )}
                        {voucher.usageLimit && (
                          <div className="flex items-center text-muted-foreground">
                            <span className="mr-2">•</span>
                            {voucher.usageLimit - voucher.usedCount} uses remaining
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
