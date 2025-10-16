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
    <div className="fixed bottom-0 left-0 right-0 bg-background z-50">
      <div className="max-w-7xl mx-auto px-6 pb-6 pt-4">
        <div className="bg-card rounded-full shadow-2xl border">
          <div className="grid grid-cols-3 gap-2 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-full transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                  data-testid={item.testId}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
