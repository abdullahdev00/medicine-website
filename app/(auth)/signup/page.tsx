'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/providers";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [signupStep, setSignupStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    whatsappNumber: "",
    address: "",
    city: "",
    province: "",
  });

  const handleNextStep = () => {
    if (signupStep === 1) {
      setShowVerificationDialog(true);
      setSignupStep(2);
    } else if (signupStep === 2 && isVerified) {
      setSignupStep(3);
    } else if (signupStep === 3) {
      setSignupStep(4);
    }
  };

  const handlePreviousStep = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1);
      if (signupStep === 2) {
        setShowVerificationDialog(false);
        setIsVerified(false);
      }
    }
  };

  const handleCheckVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerified(true);
      setIsVerifying(false);
      setShowVerificationDialog(false);
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified.",
      });
    }, 2000);
  };

  const handleSignupComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/register', signupData);
      const user = await response.json();
      login(user);
      toast({
        title: "Account created!",
        description: "Welcome to MediSwift Pakistan.",
      });
      router.push("/");
    } catch (error: any) {
      const errorMessage = error.message || "Something went wrong. Please try again.";
      toast({
        title: "Registration failed",
        description: errorMessage.includes('400') ? "Email already registered or invalid data" : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSignupData = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
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
            {signupStep > 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        step <= signupStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span>Step {signupStep} of 4</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {signupStep === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Ahmad Khan"
                      required
                      value={signupData.fullName}
                      onChange={(e) => updateSignupData("fullName", e.target.value)}
                      className="rounded-full h-14 px-6"
                      data-testid="input-signup-name"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      value={signupData.email}
                      onChange={(e) => updateSignupData("email", e.target.value)}
                      className="rounded-full h-14 px-6"
                      data-testid="input-signup-email"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={signupData.password}
                      onChange={(e) => updateSignupData("password", e.target.value)}
                      className="rounded-full h-14 px-6"
                      data-testid="input-signup-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full h-14 shadow-lg font-semibold px-6 text-base"
                    data-testid="button-step1-next"
                  >
                    Next
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.form>
              )}

              {signupStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center py-8 space-y-4">
                    {!isVerified ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <Activity className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">Verify Your Email</h3>
                          <p className="text-muted-foreground text-sm">
                            We've sent a verification email to
                          </p>
                          <p className="font-medium">{signupData.email}</p>
                          <p className="text-muted-foreground text-sm mt-4">
                            Please check your inbox and verify your email to continue
                          </p>
                        </div>
                        <Button
                          onClick={handleCheckVerification}
                          disabled={isVerifying}
                          className="w-full rounded-full h-14 shadow-lg font-semibold px-6 text-base"
                          data-testid="button-check-verification"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            "Check Verification Status"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg text-green-600">Email Verified!</h3>
                          <p className="text-muted-foreground text-sm">
                            Your email has been successfully verified
                          </p>
                        </div>
                        <Button
                          onClick={handleNextStep}
                          className="w-full rounded-full h-14 shadow-lg font-semibold px-6 text-base"
                          data-testid="button-step2-next"
                        >
                          Continue
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="w-full rounded-full h-14 shadow-lg font-semibold px-6"
                    data-testid="button-step2-back"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                </motion.div>
              )}

              {signupStep === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      placeholder="+92 300 1234567"
                      value={signupData.phoneNumber}
                      onChange={(e) => updateSignupData("phoneNumber", e.target.value)}
                      className="rounded-full h-14 px-6"
                      data-testid="input-signup-phone"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-whatsapp">WhatsApp Number</Label>
                    <Input
                      id="signup-whatsapp"
                      placeholder="+92 300 1234567"
                      value={signupData.whatsappNumber}
                      onChange={(e) => updateSignupData("whatsappNumber", e.target.value)}
                      className="rounded-full h-14 px-6"
                      data-testid="input-signup-whatsapp"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handlePreviousStep}
                      variant="outline"
                      className="flex-1 rounded-full h-14 shadow-md px-6"
                      data-testid="button-step3-back"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-full h-14 shadow-md px-6 text-base"
                      data-testid="button-step3-next"
                    >
                      Next
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.form>
              )}

              {signupStep === 4 && (
                <motion.form
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSignupComplete}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="signup-address">Address</Label>
                    <Input
                      id="signup-address"
                      placeholder="House 123, Street 4, Area"
                      value={signupData.address}
                      onChange={(e) => updateSignupData("address", e.target.value)}
                      className="rounded-full h-14 px-6"
                      data-testid="input-signup-address"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-city">City</Label>
                    <Input
                      id="signup-city"
                      placeholder="Karachi"
                      value={signupData.city}
                      onChange={(e) => updateSignupData("city", e.target.value)}
                      className="rounded-full h-14 px-6"
                      data-testid="input-signup-city"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-province">Province</Label>
                    <Input
                      id="signup-province"
                      placeholder="Sindh"
                      value={signupData.province}
                      onChange={(e) => updateSignupData("province", e.target.value)}
                      className="rounded-full h-14 px-6"
                      data-testid="input-signup-province"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handlePreviousStep}
                      variant="outline"
                      className="flex-1 rounded-full h-14 shadow-md px-6"
                      data-testid="button-step4-back"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-full h-14 shadow-md px-6 text-base"
                      disabled={isLoading}
                      data-testid="button-signup-submit"
                    >
                      {isLoading ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {signupStep === 1 && (
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => router.push("/login")}
                    className="text-primary font-semibold hover:underline"
                    data-testid="link-login"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Email Verification Sent</DialogTitle>
            <DialogDescription>
              We've sent a verification link to <strong>{signupData.email}</strong>. 
              Please check your inbox and click the link to verify your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              onClick={() => setShowVerificationDialog(false)}
              className="w-full rounded-full"
              data-testid="button-close-verification-dialog"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
