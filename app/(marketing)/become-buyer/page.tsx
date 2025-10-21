"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/providers";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { EmailInput } from "@/components/auth/EmailInput";

type Application = {
  id: string;
  programType: string;
  businessName: string;
  businessType: string;
  contactNumber: string;
  email: string;
  status: string;
  createdAt: string;
};

export default function BecomeBuyerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    contactNumber: "",
    email: user?.email || "",
    address: "",
    city: "",
    province: "",
    taxNumber: "",
    experience: "",
    description: "",
  });

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/partner-applications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/partner-applications?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const buyerApplication = applications.find(app => app.programType === "buyer");

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/partner-applications", {
        ...data,
        userId: user?.id,
        programType: "buyer",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner-applications", user?.id] });
      toast({
        title: "Application Submitted",
        description: "Your buyer application has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  const handleSubmit = () => {
    if (!formData.businessName || !formData.contactNumber || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-chart-2",
          bgColor: "bg-chart-2/20",
          borderColor: "border-chart-2/30",
          label: "Approved",
          message: "Your buyer application has been approved! You can now purchase at wholesale rates.",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/20",
          borderColor: "border-destructive/30",
          label: "Rejected",
          message: "Unfortunately, your application was not approved. Please contact support for more details.",
        };
      default:
        return {
          icon: Clock,
          color: "text-chart-3",
          bgColor: "bg-chart-3/20",
          borderColor: "border-chart-3/30",
          label: "Under Review",
          message: "Your application is being reviewed. We'll notify you once a decision is made.",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusDetails = buyerApplication ? getStatusDetails(buyerApplication.status) : null;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => router.push("/become-partner")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-bold">Become a Buyer</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Get wholesale rates for bulk purchases
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {buyerApplication ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="shadow-xl rounded-3xl border-none">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full ${statusDetails?.bgColor} flex items-center justify-center`}>
                    {statusDetails?.icon && <statusDetails.icon className={`w-8 h-8 ${statusDetails.color}`} />}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Application Status</h3>
                    <Badge
                      className={`mt-2 rounded-full px-4 py-1 text-sm font-semibold border ${statusDetails?.bgColor} ${statusDetails?.color} ${statusDetails?.borderColor}`}
                    >
                      {statusDetails?.label}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {statusDetails?.message}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-3xl border-none">
              <CardContent className="p-8">
                <h3 className="font-serif text-lg font-bold mb-4">Application Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">Application ID</span>
                    <span className="font-semibold">{buyerApplication.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">Submitted Date</span>
                    <span className="font-semibold">{format(new Date(buyerApplication.createdAt), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">Business Name</span>
                    <span className="font-semibold">{buyerApplication.businessName}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Business Type</span>
                    <span className="font-semibold">{buyerApplication.businessType || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="shadow-xl rounded-3xl border-none bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Buyer Benefits</h3>
                  </div>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Save up to 40% on bulk orders</li>
                  <li>• Dedicated account manager</li>
                  <li>• Priority customer support</li>
                  <li>• Early access to new products</li>
                  <li>• Flexible payment terms</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-3xl border-none">
              <CardContent className="p-8 space-y-6">
                <h3 className="font-serif text-xl font-bold">Buyer Application Form</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="businessName" className="text-base font-semibold">
                      Business Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      placeholder="Enter business name"
                      value={formData.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-business-name"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="businessType" className="text-base font-semibold">
                      Business Type
                    </Label>
                    <Input
                      id="businessType"
                      placeholder="e.g., Pharmacy, Clinic, Hospital"
                      value={formData.businessType}
                      onChange={(e) => handleChange("businessType", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-business-type"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="contactNumber" className="text-base font-semibold">
                      Contact Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contactNumber"
                      placeholder="+92 XXX XXXXXXX"
                      value={formData.contactNumber}
                      onChange={(e) => handleChange("contactNumber", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-contact-number"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <EmailInput
                      id="email"
                      placeholder="business@example.com"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("email", e.target.value)}
                      className="rounded-full h-12 px-4"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-base font-semibold">
                      City
                    </Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-city"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="province" className="text-base font-semibold">
                      Province
                    </Label>
                    <Input
                      id="province"
                      placeholder="Enter province"
                      value={formData.province}
                      onChange={(e) => handleChange("province", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-province"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="address" className="text-base font-semibold">
                    Business Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Complete address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="rounded-full h-14 px-6 text-base shadow-sm"
                    data-testid="input-address"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Business Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your business and requirements..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="rounded-3xl min-h-32 px-6 py-4 text-base shadow-sm"
                    data-testid="input-description"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    className="flex-1 rounded-full h-14 text-base font-semibold shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-application"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full h-14 text-base font-semibold"
                    onClick={() => router.push("/become-partner")}
                    data-testid="button-cancel"
                  >
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
