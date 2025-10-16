import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Package, MapPin, Edit2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

const mockOrders = [
  {
    id: "MED-ABC123",
    date: "2024-01-15",
    total: "1280",
    status: "delivered",
    items: ["Paracetamol 500mg", "Vitamin C 1000mg"],
  },
  {
    id: "MED-XYZ789",
    date: "2024-01-20",
    total: "890",
    status: "pending",
    items: ["Cough Syrup"],
  },
];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-chart-2/10 text-chart-2";
      case "pending":
        return "bg-chart-3/10 text-chart-3";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary/10 to-accent/20 border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">Ahmad Khan</h1>
              <p className="text-muted-foreground">ahmad.khan@example.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="shadow-md rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="rounded-full"
                    data-testid="button-edit-profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue="Ahmad Khan"
                    disabled={!isEditing}
                    className="rounded-xl"
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="ahmad.khan@example.com"
                    disabled={!isEditing}
                    className="rounded-xl"
                    data-testid="input-email"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      defaultValue="+92 300 1234567"
                      disabled={!isEditing}
                      className="rounded-xl"
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      defaultValue="+92 300 1234567"
                      disabled={!isEditing}
                      className="rounded-xl"
                      data-testid="input-whatsapp"
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 rounded-xl"
                      onClick={handleSaveProfile}
                      data-testid="button-save-profile"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => setIsEditing(false)}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              variant="destructive"
              className="w-full rounded-xl"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {mockOrders.map((order) => (
              <Card key={order.id} className="shadow-md rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                          {order.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {item}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-serif text-lg font-bold">
                      PKR {order.total}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <Card className="shadow-md rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Home</p>
                    <p className="text-sm text-muted-foreground">
                      House 123, Street 4, Gulshan-e-Iqbal
                      <br />
                      Karachi, Sindh
                      <br />
                      Pakistan
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    data-testid="button-edit-address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              data-testid="button-add-address"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav cartCount={0} wishlistCount={0} />
    </div>
  );
}
