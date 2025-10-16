import { Home, Heart, ShoppingCart, User } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface BottomNavProps {
  cartCount?: number;
  wishlistCount?: number;
}

export function BottomNav({ cartCount = 0, wishlistCount = 0 }: BottomNavProps) {
  const [location, setLocation] = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/home", testId: "nav-home" },
    { icon: Heart, label: "Favorites", path: "/wishlist", badge: wishlistCount, testId: "nav-favorites" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount, testId: "nav-cart" },
    { icon: User, label: "Profile", path: "/profile", testId: "nav-profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 gap-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all hover-elevate active-elevate-2 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={item.testId}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge ? (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs rounded-full"
                    >
                      {item.badge}
                    </Badge>
                  ) : null}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
