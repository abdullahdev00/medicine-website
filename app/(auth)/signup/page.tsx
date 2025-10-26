'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { signUp } from "@/lib/auth-client";
import { EmailInput } from "@/components/auth/EmailInput";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // Input change handler
  const handleInputChange = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!signupData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!signupData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (validateForm()) {
      processSignup();
    }
    return false;
  };
  
  const processSignup = async () => {
    
    // Validate inputs before proceeding - this should be handled by form validation
    if (!signupData.fullName || !signupData.email || !signupData.password) {
      console.warn('Form validation failed - missing required fields');
      return;
    }
    
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Backend API signup (creates user in Supabase Auth + profile data)
      const result = await signUp(signupData.email, signupData.password, signupData.fullName);
      
      // If no result or error in result, handle it
      if (!result) {
        throw new Error('No response from signup');
      }
      
      console.log('Signup successful:', result);
      
      // Store signup data in sessionStorage for next steps
      sessionStorage.setItem('signupData', JSON.stringify(signupData));
      
      // Check if verification is required
      if (result.requiresVerification) {
        // Show OTP verification toast
        toast({
          title: "Verification Code Sent!",
          description: "Please check your email for the 6-digit verification code.",
        });
        
        // Redirect to verification page
        const redirectUrl = `/verify-email?email=${encodeURIComponent(signupData.email)}`;
        
        // Small delay to show the toast
        setTimeout(() => {
          try {
            window.location.replace(redirectUrl);
          } catch (e) {
            window.location.href = redirectUrl;
          }
        }, 1000);
      } else {
        // If no verification required, show success and redirect to login
        toast({
          title: "Account Created!",
          description: "You can now login with your credentials.",
        });
        
        const redirectUrl = `/login?email=${encodeURIComponent(signupData.email)}`;
        
        setTimeout(() => {
          try {
            window.location.replace(redirectUrl);
          } catch (e) {
            window.location.href = redirectUrl;
          }
        }, 1000);
      }
      
      // Keep loading state to prevent double submission
      // Don't reset isLoading here
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific signup errors
      if (error.message?.includes('User already registered')) {
        setErrors(prev => ({ ...prev, email: "Email already exists" }));
      } else if (error.message?.includes('Password')) {
        setErrors(prev => ({ ...prev, password: error.message }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          email: error.message || "Signup failed. Please try again." 
        }));
      }
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
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Sign up to start shopping for health products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form id="signup-form" onSubmit={(e) => { e.preventDefault(); return false; }} className="space-y-6" noValidate>
              <div className="space-y-3">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  placeholder="Ahmad Khan"
                  required
                  value={signupData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`rounded-full h-14 px-6 ${errors.fullName ? "border-red-500" : ""}`}
                  data-testid="input-signup-name"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <EmailInput
                    id="signup-email"
                    placeholder="your.email@example.com"
                    required
                    value={signupData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                    className={`rounded-full h-14 px-6 ${errors.email ? "border-red-500" : ""}`}
                    data-testid="input-signup-email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={signupData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`rounded-full h-14 px-6 ${errors.password ? "border-red-500" : ""}`}
                  data-testid="input-signup-password"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  processSignup();
                }}
                className="w-full rounded-full h-14 shadow-lg font-semibold px-6 text-base"
                disabled={isLoading}
                data-testid="button-signup"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
