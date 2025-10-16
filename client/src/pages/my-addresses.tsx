import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Edit2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const mockAddresses = [
  {
    id: "1",
    label: "Home",
    address: "House 123, Street 4, Gulshan-e-Iqbal",
    city: "Karachi",
    province: "Sindh",
    postalCode: "75300",
  },
  {
    id: "2",
    label: "Office",
    address: "Office 45, Floor 3, IT Tower",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    postalCode: "44000",
  },
];

export default function MyAddresses() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const handleAddAddress = () => {
    toast({
      title: "Address added",
      description: "Your new address has been added successfully.",
    });
    setIsAdding(false);
    setNewAddress({
      label: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-chart-3/10 via-chart-3/5 to-accent/10 border-b">
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
              <h1 className="font-serif text-2xl font-bold">My Addresses</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your delivery addresses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-5">
          {mockAddresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg rounded-3xl border-none">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-chart-3/20 to-chart-3/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-7 h-7 text-chart-3" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{address.label}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {address.address}
                        <br />
                        {address.city}, {address.province}
                        <br />
                        {address.postalCode}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-12 h-12"
                        data-testid={`button-edit-address-${address.id}`}
                      >
                        <Edit2 className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-12 h-12 text-destructive hover:text-destructive"
                        data-testid={`button-delete-address-${address.id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-lg rounded-3xl border-primary/20 border-2">
                <CardContent className="p-8 space-y-6">
                  <h3 className="font-serif text-xl font-bold">Add New Address</h3>
                  
                  <div className="space-y-3">
                    <Label htmlFor="label" className="text-base font-semibold">
                      Address Label
                    </Label>
                    <Input
                      id="label"
                      placeholder="e.g., Home, Office, etc."
                      value={newAddress.label}
                      onChange={(e) => handleChange("label", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-address-label"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-base font-semibold">
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="House/Building number, Street name"
                      value={newAddress.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-base font-semibold">
                        City
                      </Label>
                      <Input
                        id="city"
                        placeholder="City name"
                        value={newAddress.city}
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
                        placeholder="Province name"
                        value={newAddress.province}
                        onChange={(e) => handleChange("province", e.target.value)}
                        className="rounded-full h-14 px-6 text-base shadow-sm"
                        data-testid="input-province"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="postalCode" className="text-base font-semibold">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      placeholder="Postal/ZIP code"
                      value={newAddress.postalCode}
                      onChange={(e) => handleChange("postalCode", e.target.value)}
                      className="rounded-full h-14 px-6 text-base shadow-sm"
                      data-testid="input-postal-code"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      className="flex-1 rounded-full h-14 text-base font-semibold shadow-lg"
                      onClick={handleAddAddress}
                      data-testid="button-save-address"
                    >
                      Save Address
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full h-14 text-base font-semibold"
                      onClick={() => setIsAdding(false)}
                      data-testid="button-cancel-add"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                className="w-full rounded-full h-14 text-base font-semibold border-2 border-dashed hover:border-primary hover:text-primary transition-all"
                onClick={() => setIsAdding(true)}
                data-testid="button-add-address"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Address
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
