'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/providers";
import { signIn } from "@/lib/auth-client";
import { EmailInput } from "@/components/auth/EmailInput";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!loginData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    const email = loginData.email;
    const password = loginData.password;

    try {
      // Use Supabase authentication
      const { user } = await signIn(email, password);
      
      if (user) {
        // Check if email is verified
        if (!user.email_confirmed_at) {
          console.log('Email not verified, redirecting to verification');
          router.push(`/verify-email?email=${encodeURIComponent(user.email || '')}`);
          return;
        }
        
        // Create user object for local auth context FIRST
        const userData = {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email,
          userType: "user"
        };
        
        // Store user in localStorage IMMEDIATELY (before database sync)
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        console.log('✅ User stored in localStorage:', userData);
        
        // Update auth context
        login(userData);
        
        // Sync user to local database for API compatibility (non-blocking)
        try {
          const response = await fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || user.email,
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.warn('⚠️ User sync failed during login:', errorData.message);
            
            // Log warning for database issues
            console.warn('⚠️ Database sync failed - some features may be limited');
          } else {
            console.log('✅ User synced successfully to database');
          }
        } catch (syncError) {
          console.warn('⚠️ User sync network error during login:', syncError);
        }
        
        router.push("/");
        console.log('✅ Login successful, redirecting to dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error types
      if (error.message?.includes('Invalid login credentials') || 
          error.message?.includes('Invalid email or password')) {
        // Check if email exists first
        try {
          const emailCheckResponse = await fetch('/api/users/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginData.email }),
          });
          
          const emailData = await emailCheckResponse.json();
          
          if (!emailData.exists) {
            setErrors(prev => ({ ...prev, email: "Email not found" }));
          } else {
            setErrors(prev => ({ ...prev, password: "Invalid password" }));
          }
        } catch (emailCheckError) {
          // If email check fails, show generic password error
          setErrors(prev => ({ ...prev, password: "Invalid password" }));
        }
      } else if (error.message?.includes('Email not confirmed')) {
        setErrors(prev => ({ ...prev, email: "Please verify your email first" }));
      } else {
        // Generic error - could be network or other issues
        setErrors(prev => ({ 
          ...prev, 
          password: error.message || "Login failed. Please try again." 
        }));
      }
    } finally {
      setIsLoading(false);
    }
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

        <Card className="border-none shadow-xl rounded-3xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="login-email">Email</Label>
                <EmailInput
                  id="login-email"
                  name="email"
                  placeholder="your.email@example.com"
                  required
                  value={loginData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                  className={`rounded-full h-14 px-6 ${errors.email ? "border-red-500" : ""}`}
                  data-testid="input-login-email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={loginData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`rounded-full h-14 px-6 ${errors.password ? "border-red-500" : ""}`}
                  data-testid="input-login-password"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
                disabled={isLoading}
                data-testid="button-login-submit"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
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
              className="w-full rounded-full h-14 border-2"
              data-testid="button-google-login"
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => router.push("/signup")}
                  className="text-primary font-semibold hover:underline"
                  data-testid="link-signup"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
