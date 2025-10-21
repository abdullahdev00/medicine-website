"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EmailInput } from "@/components/auth/EmailInput";
import Link from "next/link";
import { getSupabaseClient } from '@/lib/supabase-client';

export default function AdminSignup() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const enteredSecretKey = formData.get('secretKey') as string;

    // Verify secret key first
    const ADMIN_SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'MediSwift@Admin#2024!Secret';
    
    if (enteredSecretKey !== ADMIN_SECRET_KEY) {
      toast({
        title: "Access Denied",
        description: "Invalid admin secret key. Contact platform administrator.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: emailValue,
        password: password,
        options: {
          data: {
            full_name: fullName,
            is_admin: true
          },
          emailRedirectTo: `${window.location.origin}/admin-login`
        }
      });

      if (error) {
        throw error;
      }

      // Add to admin_users table
      if (data.user) {
        const { error: adminError } = await fetch('/api/admin/create-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: data.user.id,
            email: emailValue,
            fullName: fullName
          }),
        }).then(res => res.json());

        if (adminError) {
          console.error('Error creating admin record:', adminError);
        }
        
        // For local development, skip OTP and go directly to login
        toast({
          title: "Admin Account Created!",
          description: "You can now login with your credentials.",
        });
        
        setTimeout(() => {
          router.push("/admin-login");
        }, 1500);
      } else {
        // If email confirmation is required
        setEmail(emailValue);
        setStep('otp');
        
        toast({
          title: "Verification Email Sent!",
          description: "Please check your email (or http://localhost:54324 for local dev).",
        });
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'signup'
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Admin Account Created!",
        description: "Redirecting to admin login...",
      });
      
      setTimeout(() => {
        router.push("/admin-login");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP code",
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
            <CardTitle className="text-2xl text-white">
              {step === 'signup' ? 'Create Admin Account' : 'Verify Email'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {step === 'signup' 
                ? 'Enter your details to create an admin account'
                : 'Enter the OTP code sent to your email'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'signup' ? (
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="h-12 rounded-xl bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    data-testid="input-full-name"
                  />
                </div>
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
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                    className="h-12 rounded-xl bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    data-testid="input-password"
                  />
                  <p className="text-xs text-slate-400">
                    Minimum 8 characters required
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretKey" className="text-slate-300">
                    Admin Secret Key
                  </Label>
                  <Input
                    id="secretKey"
                    name="secretKey"
                    type="password"
                    placeholder="Enter admin secret key"
                    required
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="h-12 rounded-xl bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    data-testid="input-secret-key"
                  />
                  <p className="text-xs text-slate-400">
                    Contact platform administrator for the secret key
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-base font-semibold bg-teal-600 hover:bg-teal-700"
                  data-testid="button-signup"
                >
                  {isLoading ? "Creating Account..." : "Create Admin Account"}
                </Button>
                <div className="text-center pt-4">
                  <Link 
                    href="/admin-login" 
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-slate-300">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="h-12 rounded-xl bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-center text-2xl tracking-widest"
                    data-testid="input-otp"
                  />
                  <p className="text-xs text-slate-400">
                    Check your email for the verification code
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-base font-semibold bg-teal-600 hover:bg-teal-700"
                  data-testid="button-verify"
                >
                  {isLoading ? "Verifying..." : "Verify & Create Account"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('signup')}
                  className="w-full text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Signup
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
