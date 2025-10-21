'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2, User, Phone, MapPin, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth-client";
import { useAuth } from "@/lib/providers";
import { PhoneInput } from "@/components/ui/phone-input";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const [profileData, setProfileData] = useState({
    phoneNumber: "",
    whatsappNumber: "", 
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });
  
  const [selectedCountry, setSelectedCountry] = useState("PK");
  const [phoneValidation, setPhoneValidation] = useState({
    isValidating: false,
    error: ""
  });
  const [whatsappValidation, setWhatsappValidation] = useState({
    isValidating: false,
    error: ""
  });
  
  // Debounce timer for validation
  const [validationTimer, setValidationTimer] = useState<NodeJS.Timeout | null>(null);

  const [errors, setErrors] = useState({
    phoneNumber: "",
    whatsappNumber: "", 
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    // Check if user is authenticated - with retry logic for race conditions
    const checkAuth = async () => {
      try {
        // Add a small delay to allow localStorage to be properly set from verify-email page
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // First check localStorage for immediate auth check
        let localUser = localStorage.getItem('user');
        let isLoggedIn = localStorage.getItem('isLoggedIn');
        
        // Retry logic for race conditions (up to 3 attempts)
        let retryCount = 0;
        while ((!localUser || isLoggedIn !== 'true') && retryCount < 3) {
          console.log(`🔄 Retry ${retryCount + 1}: Checking for user in localStorage...`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between retries
          localUser = localStorage.getItem('user');
          isLoggedIn = localStorage.getItem('isLoggedIn');
          retryCount++;
        }
        
        if (!localUser || isLoggedIn !== 'true') {
          console.log('⚠️ No user in localStorage after retries, checking Supabase...');
          
          // Fallback to Supabase check
          const user = await getCurrentUser();
          
          if (!user) {
            console.log('❌ No user in Supabase either, redirecting to signup');
            router.push('/signup');
            return;
          }

          if (!user.email_confirmed_at) {
            console.log('⚠️ Email not confirmed, but user exists - allowing profile completion');
            // Don't redirect to verify-email, allow them to complete profile
            // The email was just verified if they came from verify-email page
          }
          
          // If we have a Supabase user but no localStorage, set it
          const userData = {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || user.email,
            userType: "user"
          };
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isLoggedIn', 'true');
          console.log('✅ User data restored from Supabase to localStorage');
        } else {
          console.log('✅ User found in localStorage, proceeding with profile completion');
        }

        // Get stored signup data if available
        const storedData = sessionStorage.getItem('signupData');
        if (storedData) {
          const signupData = JSON.parse(storedData);
          // Pre-fill any data we might have
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Auth check error:', error);
        // Don't immediately redirect on error, try to recover
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Validation functions
  const validateStep1 = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!profileData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (phoneValidation.error) {
      isValid = false; // Don't proceed if phone number already exists
    }

    if (!profileData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = "WhatsApp number is required";
      isValid = false;
    } else if (whatsappValidation.error) {
      isValid = false; // Don't proceed if WhatsApp number already exists
    }

    // Don't proceed if validation is still in progress
    if (phoneValidation.isValidating || whatsappValidation.isValidating) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateStep2 = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!profileData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    } else {
      newErrors.address = "";
    }

    if (!profileData.city.trim()) {
      newErrors.city = "City is required";
      isValid = false;
    } else {
      newErrors.city = "";
    }

    if (!profileData.province.trim()) {
      newErrors.province = "Province is required";
      isValid = false;
    } else {
      newErrors.province = "";
    }

    if (!profileData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
      isValid = false;
    } else {
      newErrors.postalCode = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  // Step navigation
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Clear validation timer
    if (validationTimer) {
      clearTimeout(validationTimer);
    }
    
    // Phone number validation with debounce
    if ((field === "phoneNumber" || field === "whatsappNumber") && value.length === 10) {
      const timer = setTimeout(() => {
        validatePhoneNumber(field, value);
      }, 1000); // 1 second debounce
      
      setValidationTimer(timer);
    } else {
      // Clear validation errors if input is incomplete
      if (field === "phoneNumber") {
        setPhoneValidation({ isValidating: false, error: "" });
      } else if (field === "whatsappNumber") {
        setWhatsappValidation({ isValidating: false, error: "" });
      }
    }
  };
  
  const validatePhoneNumber = async (field: string, value: string) => {
    if (field === "phoneNumber") {
      setPhoneValidation({ isValidating: true, error: "" });
    } else if (field === "whatsappNumber") {
      setWhatsappValidation({ isValidating: true, error: "" });
    }
    
    try {
      const formattedPhone = formatPhoneForBackend(value, selectedCountry);
      const formattedWhatsApp = field === "whatsappNumber" ? formattedPhone : formatPhoneForBackend(profileData.whatsappNumber, selectedCountry);
      
      const response = await fetch('/api/users/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: field === "phoneNumber" ? formattedPhone : null,
          whatsappNumber: field === "whatsappNumber" ? formattedPhone : null
        })
      });
      
      const result = await response.json();
      
      if (field === "phoneNumber") {
        setPhoneValidation({
          isValidating: false,
          error: result.phoneExists ? "This phone number is already registered" : ""
        });
      } else if (field === "whatsappNumber") {
        setWhatsappValidation({
          isValidating: false,
          error: result.whatsappExists ? "This WhatsApp number is already registered" : ""
        });
      }
      
    } catch (error) {
      console.error('Phone validation error:', error);
      if (field === "phoneNumber") {
        setPhoneValidation({ isValidating: false, error: "" });
      } else if (field === "whatsappNumber") {
        setWhatsappValidation({ isValidating: false, error: "" });
      }
    }
  };
  
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    // When country changes, update both phone fields if they have values
    // This will be useful when we add more countries later
  };
  
  const formatPhoneForBackend = (phoneNumber: string, country: string = "PK") => {
    if (!phoneNumber) return "";
    
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add country code based on selected country
    switch (country) {
      case "PK":
        return `+92${digits}`;
      // Add more countries here later
      default:
        return `+92${digits}`;
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate current step
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    
    setIsCompleting(true);
    
    try {
      // Try to get current user from Supabase first
      let currentUser = null;
      try {
        currentUser = await getCurrentUser();
        console.log('✅ Got Supabase user for profile completion:', currentUser?.id);
      } catch (supabaseError) {
        console.warn('⚠️ Could not get Supabase user, trying localStorage:', supabaseError);
      }
      
      // Fallback to localStorage if Supabase fails
      if (!currentUser) {
        const localUser = localStorage.getItem('user');
        if (localUser) {
          const userData = JSON.parse(localUser);
          currentUser = { id: userData.id, email: userData.email };
          console.log('✅ Using localStorage user for profile completion:', currentUser.id);
        }
      }
      
      if (!currentUser) {
        throw new Error('No user found in Supabase or localStorage');
      }

      // Get stored signup data
      const storedData = sessionStorage.getItem('signupData');
      const signupData = storedData ? JSON.parse(storedData) : {};

      // Format phone numbers for backend
      const formattedPhoneNumber = formatPhoneForBackend(profileData.phoneNumber, selectedCountry);
      const formattedWhatsAppNumber = formatPhoneForBackend(profileData.whatsappNumber, selectedCountry);
      
      // Combine all user data
      const completeUserData = {
        ...signupData,
        ...profileData,
        phoneNumber: formattedPhoneNumber,
        whatsappNumber: formattedWhatsAppNumber,
        userId: currentUser.id,
        email: currentUser.email,
        emailVerified: true,
      };
      
      console.log('📝 Sending profile data to API:', completeUserData);

      // Save to your database via API
      const response = await fetch('/api/users/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeUserData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error Response:', errorData);
        throw new Error(`Failed to save profile: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log('✅ Profile saved successfully:', result);

      // Auto-login user after profile completion
      const userData = {
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.user_metadata?.full_name || currentUser.email,
        userType: "user"
      };
      
      // Login user automatically
      login(userData);
      console.log('✅ User auto-logged in after profile completion:', userData);
      
      // Clear stored signup data
      sessionStorage.removeItem('signupData');
      
      toast({
        title: "Profile Completed!",
        description: "Welcome to MediSwift Pakistan. Your account is now ready.",
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Profile Save Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const updateProfileData = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                <CardDescription>Add your contact and address information</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
                  {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : <Phone className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium">Contact</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep > 1 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Address</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <h3 className="font-semibold text-xl flex items-center gap-2">
                      <Phone className="w-6 h-6 text-primary" />
                      Contact Information
                    </h3>
                    
                    <div className="space-y-4">
                      <Label htmlFor="phone-number" className="text-base font-medium">Phone Number *</Label>
                      <PhoneInput
                        id="phone-number"
                        placeholder="3054288892"
                        value={profileData.phoneNumber}
                        onChange={(value) => handleInputChange("phoneNumber", value || "")}
                        defaultCountry={selectedCountry as any}
                        isValidating={phoneValidation.isValidating}
                        validationError={phoneValidation.error}
                        className={`h-16 ${errors.phoneNumber || phoneValidation.error ? "border-red-500" : ""}`}
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-500 mt-2">{errors.phoneNumber}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Enter 10 digits (e.g., 3054288892)</p>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="whatsapp-number" className="text-base font-medium">WhatsApp Number *</Label>
                      <PhoneInput
                        id="whatsapp-number"
                        placeholder="3054288892"
                        value={profileData.whatsappNumber}
                        onChange={(value) => handleInputChange("whatsappNumber", value || "")}
                        defaultCountry={selectedCountry as any}
                        isValidating={whatsappValidation.isValidating}
                        validationError={whatsappValidation.error}
                        className={`h-16 ${errors.whatsappNumber || whatsappValidation.error ? "border-red-500" : ""}`}
                      />
                      {errors.whatsappNumber && (
                        <p className="text-sm text-red-500 mt-2">{errors.whatsappNumber}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Enter 10 digits (e.g., 3054288892)</p>
                    </div>

                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full rounded-full h-16 shadow-lg font-semibold text-lg mt-8"
                    >
                      Next Step
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleCompleteProfile} className="space-y-6">
                    <h3 className="font-semibold text-xl flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-primary" />
                      Address Information
                    </h3>
                    
                    <div className="space-y-4">
                      <Label htmlFor="address" className="text-base font-medium">Complete Address *</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="House/Street, Area, Landmark"
                        value={profileData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className={`rounded-full h-16 px-6 text-base ${errors.address ? "border-red-500" : ""}`}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-500 mt-2">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <Label htmlFor="city" className="text-base font-medium">City *</Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="Karachi"
                          value={profileData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className={`rounded-full h-16 px-6 text-base ${errors.city ? "border-red-500" : ""}`}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-500 mt-2">{errors.city}</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="province" className="text-base font-medium">Province *</Label>
                        <Input
                          id="province"
                          type="text"
                          placeholder="Sindh"
                          value={profileData.province}
                          onChange={(e) => handleInputChange("province", e.target.value)}
                          className={`rounded-full h-16 px-6 text-base ${errors.province ? "border-red-500" : ""}`}
                        />
                        {errors.province && (
                          <p className="text-sm text-red-500 mt-2">{errors.province}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="postal-code" className="text-base font-medium">Postal Code *</Label>
                      <Input
                        id="postal-code"
                        type="text"
                        placeholder="75500"
                        value={profileData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        className={`rounded-full h-16 px-6 text-base ${errors.postalCode ? "border-red-500" : ""}`}
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-red-500 mt-2">{errors.postalCode}</p>
                      )}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="flex-1 rounded-full h-16 font-semibold text-lg"
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={isCompleting}
                        className="flex-1 rounded-full h-16 shadow-lg font-semibold text-lg"
                      >
                        {isCompleting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            Complete Profile
                            <CheckCircle2 className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
