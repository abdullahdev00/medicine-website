'use client'

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OTPInput } from "@/components/ui/otp-input";
import { Activity, CheckCircle2, Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { verifyOTP, resendOTP } from "@/lib/auth-client";
import { useAuth } from "@/lib/providers";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [otpError, setOtpError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      // Start timer on page load since OTP was just sent
      setCanResend(false);
      setResendTimer(60);
    }
    // Set loading to false after checking params
    setIsLoading(false);
  }, [searchParams]);

  // Timer effect for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit verification code.");
      return;
    }
    
    setOtpError(""); // Clear any previous errors

    setIsVerifying(true);
    
    try {
      // Verify OTP with backend API
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      
      const { user, session } = data;
      
      // Log session info for debugging
      console.log('🔐 OTP Verification Response:', { 
        user: user?.id, 
        hasSession: !!session,
        sessionToken: session?.access_token ? 'present' : 'missing'
      });
      
      // Sync user to local database after successful verification (non-blocking)
      if (user) {
        // Fire and forget - don't wait for sync to complete
        fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || user.email,
          })
        }).then(response => {
          if (response.ok) {
            console.log('✅ User synced successfully to database');
          } else {
            response.json().then(data => {
              console.warn('⚠️ User sync failed but auth continues:', data.message);
            });
          }
        }).catch(error => {
          console.warn('⚠️ User sync error but auth continues:', error);
        });
      }
      
      // Store user data temporarily for profile completion
      if (user) {
        sessionStorage.setItem('pendingUser', JSON.stringify({
          id: user.id,
          email: user.email,
          fullName: user.fullName || user.user_metadata?.full_name || user.email,
          userType: "user"
        }));
        
        const userData = {
          id: user.id,
          email: user.email,
          fullName: user.fullName || user.user_metadata?.full_name || user.email,
          userType: "user"
        };
        
        // Manually set localStorage first (ensure it's set)
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Also store session info if available
        if (session?.access_token) {
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          }));
        }
        
        console.log('✅ User data stored in localStorage:', userData);
        
        // Update auth context
        login(userData);
        console.log('✅ User logged in after verification:', userData);
        
        // Force trigger storage event to ensure auth context updates immediately
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(userData),
          storageArea: localStorage
        }));
        
        // Show success message and wait before redirect
        console.log('🎉 Email verified successfully! Redirecting to complete profile...');
        setIsRedirecting(true);
        
        // Ensure localStorage is properly set before redirect
        const ensureStorageAndRedirect = async () => {
          // Double-check localStorage is set
          const storedUser = localStorage.getItem('user');
          const storedLogin = localStorage.getItem('isLoggedIn');
          
          console.log('🔄 Preparing to redirect to complete profile...');
          console.log('🔍 Final auth state check:', { 
            userInStorage: storedUser,
            isLoggedInFlag: storedLogin
          });
          
          if (!storedUser || storedLogin !== 'true') {
            console.error('⚠️ localStorage not properly set, setting again...');
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Force a storage event to ensure all listeners are notified
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'user',
              newValue: JSON.stringify(userData),
              storageArea: localStorage
            }));
          }
          
          // Small delay to ensure storage is propagated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Redirect to complete-profile page with user ID
          const redirectUrl = `/complete-profile?userId=${user.id}&email=${user.email}`;
          router.push(redirectUrl);
        };
        
        // Execute redirect with proper storage check
        setTimeout(() => ensureStorageAndRedirect(), 1500); // 1.5 seconds for UI feedback
      } else {
        console.error('❌ No user data received after verification');
        router.push('/login');
      }
      
    } catch (error: any) {
      console.error('Verification failed:', error);
      
      // Handle specific error types
      if (error.message?.includes('Token has expired') || 
          error.message?.includes('invalid')) {
        setOtpError("OTP has expired or is invalid. Please request a new code.");
      } else if (error.message?.includes('Email not confirmed')) {
        setOtpError("Email verification failed. Please try again.");
      } else {
        setOtpError(error.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    try {
      await resendOTP(email);

      // Start 60 second timer
      setCanResend(false);
      setResendTimer(60);

      toast({
        title: "Code Resent!",
        description: "Please check your inbox for the new verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };


  // Show loading while checking params
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent access without email parameter (only after loading is done)
  if (!email) {
    router.push('/signup');
    return null;
  }

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
          <CardContent className="p-8">
            <div className="text-center py-8 space-y-6">
              {isRedirecting ? (
                <>
                  <div className="flex justify-center mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
                  <p className="text-muted-foreground">
                    Setting up your account...
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Redirecting to complete your profile...</span>
                  </div>
                </>
              ) : !isVerified ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Mail className="w-10 h-10 text-primary" />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="font-serif text-2xl font-bold">Enter Verification Code</h2>
                    <p className="text-muted-foreground">
                      We've sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-lg break-all">{email}</p>
                    <p className="text-muted-foreground text-sm mt-4">
                      Please enter the code below to verify your email
                    </p>
                  </div>

                  <div className="space-y-6">
                    <OTPInput
                      length={6}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        setOtpError(""); // Clear error when user types
                      }}
                      className="mb-4"
                    />
                    
                    {otpError && (
                      <div className="mb-4">
                        <p className="text-sm text-red-500 text-center">{otpError}</p>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={isVerifying || otp.length !== 6}
                      className="w-full rounded-full h-14 shadow-lg font-semibold text-base"
                      data-testid="button-verify-otp"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>

                    <Button
                      onClick={handleResendOTP}
                      variant="outline"
                      disabled={!canResend}
                      className="w-full rounded-full h-12 font-medium"
                      data-testid="button-resend-otp"
                    >
                      {!canResend ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Didn't receive the email? Check your spam folder or try resending.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="font-serif text-2xl font-bold text-green-600">Email Verified!</h2>
                    <p className="text-muted-foreground">
                      Your email has been successfully verified. Redirecting to complete your profile...
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/signup')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Signup
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
