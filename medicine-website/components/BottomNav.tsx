"use client";

import { Home, ShoppingCart, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/", testId: "nav-home" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", testId: "nav-cart" },
    { icon: User, label: "Profile", path: "/profile", testId: "nav-profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card rounded-full shadow-2xl border z-50 mx-4 mb-4">
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-full transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:bg-accent"
              }`}
              data-testid={item.testId}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
