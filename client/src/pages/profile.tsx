import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, LogOut, Package, MapPin, Edit2, ChevronRight, Wallet, Users, Briefcase } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  const menuItems = [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Update your personal details",
      icon: Edit2,
      route: "/edit-profile",
      testId: "button-personal-info",
      color: "from-primary/20 to-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "wallet",
      title: "My Wallet",
      description: "View your balance & transactions",
      icon: Wallet,
      route: "/wallet",
      testId: "button-wallet",
      color: "from-chart-4/20 to-chart-4/10",
      iconColor: "text-chart-4",
    },
    {
      id: "my-orders",
      title: "My Orders",
      description: "Track your order history",
      icon: Package,
      route: "/my-orders",
      testId: "button-my-orders",
      color: "from-chart-2/20 to-chart-2/10",
      iconColor: "text-chart-2",
    },
    {
      id: "affiliate",
      title: "Affiliate Program",
      description: "Earn with your referral code",
      icon: Users,
      route: "/affiliate",
      testId: "button-affiliate",
      color: "from-chart-5/20 to-chart-5/10",
      iconColor: "text-chart-5",
    },
    {
      id: "addresses",
      title: "Delivery Addresses",
      description: "Manage your addresses",
      icon: MapPin,
      route: "/my-addresses",
      testId: "button-addresses",
      color: "from-chart-3/20 to-chart-3/10",
      iconColor: "text-chart-3",
    },
    {
      id: "become-partner",
      title: "Become a Partner",
      description: "Apply for wholesale rates",
      icon: Briefcase,
      route: "/become-partner",
      testId: "button-become-partner",
      color: "from-primary/30 to-primary/20",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl">
              <User className="w-14 h-14 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Ahmad Khan</h1>
              <p className="text-muted-foreground mt-1">ahmad.khan@example.com</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="shadow-lg rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-none"
                onClick={() => setLocation(item.route)}
                data-testid={item.testId}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button
            variant="destructive"
            className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>

      <BottomNav cartCount={0} wishlistCount={0} />
    </div>
  );
}
