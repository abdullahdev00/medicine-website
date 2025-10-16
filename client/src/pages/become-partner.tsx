import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function BecomePartnerPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [hasApplied, setHasApplied] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<"pending" | "approved" | "rejected">("pending");

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    moq: "",
    message: "",
  });

  const handleSubmit = () => {
    toast({
      title: "Application Submitted",
      description: "Your partnership application has been submitted successfully.",
    });
    setHasApplied(true);
    setApplicationStatus("pending");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusDetails = () => {
    switch (applicationStatus) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-chart-2",
          bgColor: "bg-chart-2/20",
          borderColor: "border-chart-2/30",
          label: "Approved",
          message: "Your partnership application has been approved! You can now purchase at wholesale rates.",
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

  const statusDetails = getStatusDetails();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => setLocation("/profile")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-bold">Become a Partner</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Apply for wholesale rates
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {hasApplied ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="shadow-xl rounded-3xl border-none">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full ${statusDetails.bgColor} flex items-center justify-center`}>
                    <statusDetails.icon className={`w-8 h-8 ${statusDetails.color}`} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Application Status</h3>
                    <Badge
                      className={`mt-2 rounded-full px-4 py-1 text-sm font-semibold border ${statusDetails.bgColor} ${statusDetails.color} ${statusDetails.borderColor}`}
                    >
                      {statusDetails.label}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {statusDetails.message}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-3xl border-none">
              <CardContent className="p-8">
                <h3 className="font-serif text-lg font-bold mb-4">Application Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">Application ID</span>
                    <span className="font-semibold">PART-2024-001</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">Submitted Date</span>
                    <span className="font-semibold">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Business Type</span>
                    <span className="font-semibold">Pharmacy</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full rounded-full h-14 text-base font-semibold"
              onClick={() => setHasApplied(false)}
              data-testid="button-reapply"
            >
              Submit New Application
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="shadow-xl rounded-3xl border-none bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Partner Benefits</h3>
                  </div>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Wholesale pricing on all products</li>
                  <li>• Minimum Order Quantity (MOQ) applies</li>
                  <li>• Priority customer support</li>
                  <li>• Exclusive product access</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-3xl border-none">
              <CardContent className="p-8 space-y-6">
                <h3 className="font-serif text-xl font-bold">Application Form</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="businessName" className="text-base font-semibold">
                      Business Name
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
                      placeholder="e.g., Pharmacy, Clinic"
                      value={formData.businessType}
                      onChange={(e) => handleChange("businessType", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-business-type"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="contactPerson" className="text-base font-semibold">
                      Contact Person
                    </Label>
                    <Input
                      id="contactPerson"
                      placeholder="Full name"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange("contactPerson", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-contact-person"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-semibold">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+92 XXX XXXXXXX"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="rounded-full h-14 px-6 text-base shadow-sm"
                    data-testid="input-email"
                  />
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
                  <Label htmlFor="moq" className="text-base font-semibold">
                    Expected Monthly Order Quantity
                  </Label>
                  <Input
                    id="moq"
                    placeholder="e.g., 100 units"
                    value={formData.moq}
                    onChange={(e) => handleChange("moq", e.target.value)}
                    className="rounded-full h-14 px-6 text-base shadow-sm"
                    data-testid="input-moq"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-base font-semibold">
                    Additional Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your business..."
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="rounded-3xl min-h-32 px-6 py-4 text-base shadow-sm"
                    data-testid="input-message"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    className="flex-1 rounded-full h-14 text-base font-semibold shadow-lg"
                    onClick={handleSubmit}
                    data-testid="button-submit-application"
                  >
                    Submit Application
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full h-14 text-base font-semibold"
                    onClick={() => setLocation("/profile")}
                    data-testid="button-cancel"
                  >
                    Cancel
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
