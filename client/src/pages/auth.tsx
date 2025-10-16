import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/home");
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Account created!",
        description: "Welcome to MediSwift Pakistan.",
      });
      setLocation("/home");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <Activity className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold">MediSwift Pakistan</h1>
          <p className="text-muted-foreground">Your Health, Delivered</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      className="rounded-xl"
                      data-testid="input-login-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="rounded-xl"
                      data-testid="input-login-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl"
                    disabled={isLoading}
                    data-testid="button-login-submit"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl"
                    data-testid="button-google-login"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Ahmad Khan"
                      required
                      className="rounded-xl"
                      data-testid="input-signup-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      className="rounded-xl"
                      data-testid="input-signup-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="rounded-xl"
                      data-testid="input-signup-password"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        placeholder="+92 300 1234567"
                        className="rounded-xl"
                        data-testid="input-signup-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-whatsapp">WhatsApp</Label>
                      <Input
                        id="signup-whatsapp"
                        placeholder="+92 300 1234567"
                        className="rounded-xl"
                        data-testid="input-signup-whatsapp"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-address">Address</Label>
                    <Input
                      id="signup-address"
                      placeholder="House 123, Street 4, Area"
                      className="rounded-xl"
                      data-testid="input-signup-address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-city">City</Label>
                      <Input
                        id="signup-city"
                        placeholder="Karachi"
                        className="rounded-xl"
                        data-testid="input-signup-city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-province">Province</Label>
                      <Input
                        id="signup-province"
                        placeholder="Sindh"
                        className="rounded-xl"
                        data-testid="input-signup-province"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl"
                    disabled={isLoading}
                    data-testid="button-signup-submit"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl"
                    data-testid="button-google-signup"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
