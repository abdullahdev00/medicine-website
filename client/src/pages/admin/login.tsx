import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
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
      
      const adminData = await adminResponse.json();
      login({ ...adminData, userType: 'admin' });
      setLocation("/admin");
      toast({
        title: "Welcome Admin!",
        description: "Redirecting to admin dashboard...",
      });
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
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="admin-email" className="text-slate-200">Email</Label>
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="rounded-full h-14 px-6 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  data-testid="input-admin-email"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="admin-password" className="text-slate-200">Password</Label>
                <Input
                  id="admin-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="rounded-full h-14 px-6 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  data-testid="input-admin-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full h-14 text-base font-semibold shadow-lg bg-white text-slate-900 hover:bg-slate-100"
                disabled={isLoading}
                data-testid="button-admin-login"
              >
                {isLoading ? "Signing in..." : "Sign In as Admin"}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-slate-400">
                Not an admin?{" "}
                <button
                  onClick={() => setLocation("/login")}
                  className="text-white font-semibold hover:underline"
                  data-testid="link-user-login"
                >
                  User Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Secure admin access only • MediSwift Pakistan
          </p>
        </div>
      </motion.div>
    </div>
  );
}
