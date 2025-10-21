import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers";

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    if (user?.userType !== 'admin') {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.userType !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
