'use client'

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Package, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function BecomePartnerPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-b">
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
            <div>
              <h1 className="font-serif text-2xl font-bold">Become a Partner</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your partnership program
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl rounded-3xl border-none overflow-hidden hover:shadow-2xl transition-all h-full">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 text-white">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2">Become a Supplier</h2>
                <p className="text-white/90">
                  Supply medicines and health products to our platform
                </p>
              </div>
              
              <CardContent className="p-8 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Expand Your Reach</p>
                      <p className="text-sm text-muted-foreground">Access thousands of customers nationwide</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Direct Sales Channel</p>
                      <p className="text-sm text-muted-foreground">Sell directly without intermediaries</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShoppingCart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Flexible Terms</p>
                      <p className="text-sm text-muted-foreground">Set your own pricing and quantities</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full rounded-full h-14 text-base font-semibold shadow-lg mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  onClick={() => router.push("/become-supplier")}
                  data-testid="button-become-supplier"
                >
                  Apply as Supplier
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Buyer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl rounded-3xl border-none overflow-hidden hover:shadow-2xl transition-all h-full">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2">Become a Buyer</h2>
                <p className="text-white/90">
                  Get wholesale rates for bulk purchases
                </p>
              </div>
              
              <CardContent className="p-8 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-chart-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Wholesale Pricing</p>
                      <p className="text-sm text-muted-foreground">Save up to 40% on bulk orders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-chart-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Priority Support</p>
                      <p className="text-sm text-muted-foreground">Dedicated account manager</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-chart-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Exclusive Access</p>
                      <p className="text-sm text-muted-foreground">Early access to new products</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full rounded-full h-14 text-base font-semibold shadow-lg mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  onClick={() => router.push("/become-buyer")}
                  data-testid="button-become-buyer"
                >
                  Apply as Buyer
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
