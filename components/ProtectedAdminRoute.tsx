import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
      return;
    }

    if (user?.userType !== 'admin') {
      setLocation("/home");
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated || user?.userType !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
