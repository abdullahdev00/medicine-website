"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/providers";
import { EmailInput } from "@/components/auth/EmailInput";
import { PhoneInput } from "@/components/ui/phone-input";

export default function EditProfile() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, updateUser, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    whatsappNumber: "",
  });

  // Fetch user profile data from API
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/users/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json();
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        phoneNumber: userProfile.phoneNumber || "",
        whatsappNumber: userProfile.whatsappNumber || "",
      });
    }
  }, [userProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Don't send email in update request (it's non-editable)
      const { email, ...updateData } = data;
      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      router.push("/profile");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => router.push("/profile")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-bold">Edit Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Update your account information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-2xl rounded-3xl border-none overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">
                    Keep your details up to date
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className="h-14 rounded-2xl text-base"
                    data-testid="input-fullname"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    className="h-14 rounded-2xl text-base bg-muted/50"
                    data-testid="input-email"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed for security reasons
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-base font-semibold">
                    Phone Number
                  </Label>
                  <PhoneInput
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(value) => handleChange("phoneNumber", value || "")}
                    placeholder="3054288892"
                    className="rounded-2xl"
                    data-testid="input-phone"
                    defaultCountry="PK"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber" className="text-base font-semibold">
                    WhatsApp Number
                  </Label>
                  <PhoneInput
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(value) => handleChange("whatsappNumber", value || "")}
                    placeholder="3054288892"
                    className="rounded-2xl"
                    data-testid="input-whatsapp"
                    defaultCountry="PK"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="w-full h-14 rounded-full text-base font-semibold shadow-lg"
                data-testid="button-save"
              >
                <Save className="w-5 h-5 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
