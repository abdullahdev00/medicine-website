"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EmailInput } from "@/components/auth/EmailInput";

export default function AdminLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const adminResponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (!adminResponse.ok) {
        throw new Error('Invalid credentials');
      }
      
      toast({
        title: "Welcome Admin!",
        description: "Redirecting to admin dashboard...",
      });
      
      setTimeout(() => {
        router.push("/admin");
      }, 100);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-300">MediSwift Pakistan</p>
        </div>

        <Card className="border-slate-700 shadow-2xl rounded-3xl bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
                </Label>
                <EmailInput
                  id="email"
                  name="email"
                  placeholder="admin@mediswift.pk"
                  required
                  className="h-12 rounded-xl bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  data-testid="input-admin-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="h-12 rounded-xl bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl text-base font-semibold bg-teal-600 hover:bg-teal-700"
                data-testid="button-login"
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
