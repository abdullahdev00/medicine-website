import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "Ahmad Khan",
    email: "ahmad.khan@example.com",
    phone: "+92 300 1234567",
    whatsapp: "+92 300 1234567",
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    setLocation("/profile");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
              <h1 className="font-serif text-2xl font-bold">Edit Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Update your personal information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl">
              <User className="w-16 h-16 text-white" />
            </div>
          </div>

          <Card className="shadow-lg rounded-3xl border-none">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-semibold">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="rounded-full h-14 px-6 text-base shadow-sm"
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="rounded-full h-14 px-6 text-base shadow-sm"
                  data-testid="input-email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="rounded-full h-14 px-6 text-base shadow-sm"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="whatsapp" className="text-base font-semibold">
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    className="rounded-full h-14 px-6 text-base shadow-sm"
                    data-testid="input-whatsapp"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button
              className="flex-1 rounded-full h-14 text-base font-semibold shadow-lg"
              onClick={handleSaveProfile}
              data-testid="button-save-profile"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full h-14 text-base font-semibold"
              onClick={() => setLocation("/profile")}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
