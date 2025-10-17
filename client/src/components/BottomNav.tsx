import { Home, ShoppingCart, User } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface BottomNavProps {
  cartCount?: number;
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const [location, setLocation] = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/home", testId: "nav-home" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount, testId: "nav-cart" },
    { icon: User, label: "Profile", path: "/profile", testId: "nav-profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card rounded-full shadow-2xl border z-50 mx-4 mb-4">
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-full transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:bg-accent"
              }`}
              data-testid={item.testId}
            >
              <div className="relative">
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 ? (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                    {item.badge}
                  </Badge>
                ) : null}
              </div>
              {isActive && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
