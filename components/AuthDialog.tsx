"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailInput } from "@/components/auth/EmailInput";
import { useAuth } from "@/lib/providers";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Activity } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const user = await response.json();
      login(user);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await apiRequest("POST", "/api/auth/register", { fullName, email, password });
      const user = await response.json();
      login(user);
      toast({
        title: "Account created!",
        description: "Welcome to MediSwift Pakistan.",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">MediSwift Pakistan</DialogTitle>
          <DialogDescription className="text-center">
            Sign in or create an account to continue
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-login-email">Email</Label>
                <EmailInput
                  id="dialog-login-email"
                  name="email"
                  placeholder="your.email@example.com"
                  required
                  className="rounded-full h-12 px-4"
                  data-testid="input-dialog-login-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-login-password">Password</Label>
                <Input
                  id="dialog-login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="rounded-full h-12 px-4"
                  data-testid="input-dialog-login-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full h-12 font-semibold"
                disabled={isLoading}
                data-testid="button-dialog-login"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-name">Full Name</Label>
                <Input
                  id="dialog-signup-name"
                  name="fullName"
                  type="text"
                  placeholder="Your Name"
                  required
                  className="rounded-full h-12 px-4"
                  data-testid="input-dialog-signup-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-email">Email</Label>
                <EmailInput
                  id="dialog-signup-email"
                  name="email"
                  placeholder="your.email@example.com"
                  required
                  className="rounded-full h-12 px-4"
                  data-testid="input-dialog-signup-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-password">Password</Label>
                <Input
                  id="dialog-signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="rounded-full h-12 px-4"
                  data-testid="input-dialog-signup-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full h-12 font-semibold"
                disabled={isLoading}
                data-testid="button-dialog-signup"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
