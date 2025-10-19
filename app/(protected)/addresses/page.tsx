"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Edit2, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function MyAddresses() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["/api/addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/addresses?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user?.id, isDefault: false }),
      });
      if (!res.ok) throw new Error("Failed to add address");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses", user?.id] });
      toast({ title: "Address added", description: "Your new address has been added successfully." });
      setIsAdding(false);
      setFormData({ label: "", address: "", city: "", province: "", postalCode: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add address. Please try again.", variant: "destructive" });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update address");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses", user?.id] });
      toast({ title: "Address updated", description: "Your address has been updated successfully." });
      setEditingId(null);
      setFormData({ label: "", address: "", city: "", province: "", postalCode: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update address. Please try again.", variant: "destructive" });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses", user?.id] });
      toast({ title: "Address deleted", description: "Your address has been deleted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete address. Please try again.", variant: "destructive" });
    },
  });

  const handleAddAddress = () => {
    if (!formData.label || !formData.address || !formData.city || !formData.province || !formData.postalCode) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    addAddressMutation.mutate(formData);
  };

  const handleUpdateAddress = () => {
    if (!editingId) return;
    if (!formData.label || !formData.address || !formData.city || !formData.province || !formData.postalCode) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    updateAddressMutation.mutate({ id: editingId, data: formData });
  };

  const handleEdit = (address: any) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      address: address.address,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ label: "", address: "", city: "", province: "", postalCode: "" });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading addresses...</p>
        </div>
      </div>
    );
  }

  const renderAddressForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label" className="text-base font-semibold">Address Label</Label>
        <Input
          id="label"
          placeholder="e.g., Home, Office, etc."
          value={formData.label}
          onChange={(e) => handleChange("label", e.target.value)}
          className="rounded-full h-12 mt-2"
          data-testid={editingId ? "input-edit-label" : "input-add-label"}
        />
      </div>
      <div>
        <Label htmlFor="address" className="text-base font-semibold">Street Address</Label>
        <Input
          id="address"
          placeholder="House/Building number, Street name"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="rounded-full h-12 mt-2"
          data-testid={editingId ? "input-edit-address" : "input-add-address"}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-base font-semibold">City</Label>
          <Input
            id="city"
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="rounded-full h-12 mt-2"
            data-testid={editingId ? "input-edit-city" : "input-add-city"}
          />
        </div>
        <div>
          <Label htmlFor="province" className="text-base font-semibold">Province</Label>
          <Input
            id="province"
            placeholder="Province"
            value={formData.province}
            onChange={(e) => handleChange("province", e.target.value)}
            className="rounded-full h-12 mt-2"
            data-testid={editingId ? "input-edit-province" : "input-add-province"}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="postalCode" className="text-base font-semibold">Postal Code</Label>
        <Input
          id="postalCode"
          placeholder="Postal Code"
          value={formData.postalCode}
          onChange={(e) => handleChange("postalCode", e.target.value)}
          className="rounded-full h-12 mt-2"
          data-testid={editingId ? "input-edit-postal" : "input-add-postal"}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          onClick={editingId ? handleUpdateAddress : handleAddAddress}
          disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
          className="flex-1 rounded-full h-12"
          data-testid={editingId ? "button-update-address" : "button-save-address"}
        >
          {editingId ? "Update Address" : "Save Address"}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex-1 rounded-full h-12"
          data-testid="button-cancel"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-chart-3/10 via-chart-3/5 to-accent/10 border-b">
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
              <h1 className="font-serif text-2xl font-bold">My Addresses</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your delivery addresses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {addresses.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-chart-3/10 flex items-center justify-center mb-6">
              <MapPin className="w-12 h-12 text-chart-3" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Saved Addresses</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              You haven't added any delivery addresses yet. Add your addresses for faster checkout and smooth delivery.
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              size="lg"
              className="rounded-full"
              data-testid="button-add-address-empty"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Address
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {addresses.map((address: any, index: number) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {editingId === address.id ? (
                    <Card className="shadow-lg rounded-3xl border-primary/20 border-2">
                      <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-xl font-bold">Edit Address</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={handleCancel}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                        {renderAddressForm()}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-lg rounded-3xl border-none">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-7 h-7 text-chart-3" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg">{address.label}</h3>
                              {address.isDefault && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground">
                              {address.address}, {address.city}, {address.province} - {address.postalCode}
                            </p>
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(address)}
                                className="rounded-full"
                                data-testid={`button-edit-${address.id}`}
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteAddressMutation.mutate(address.id)}
                                className="rounded-full text-destructive hover:text-destructive"
                                data-testid={`button-delete-${address.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}

              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="shadow-lg rounded-3xl border-primary/20 border-2">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl font-bold">Add New Address</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          onClick={handleCancel}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      {renderAddressForm()}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {!isAdding && !editingId && (
              <Button
                onClick={() => setIsAdding(true)}
                className="w-full h-14 rounded-full"
                variant="outline"
                data-testid="button-add-new"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Address
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
