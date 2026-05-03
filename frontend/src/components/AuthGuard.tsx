"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      console.log("[AUTH_GUARD] No user session found, redirecting to login");
      router.push("/login");
      return;
    }

    // Role-based logic: Admin bypasses onboarding
    const isAdmin = user.role === "ADMIN";
    const needsOnboarding = !user.onboardingCompleted && !isAdmin;

    if (needsOnboarding && pathname !== "/onboarding") {
      console.log("[AUTH_GUARD] Onboarding incomplete, redirecting...");
      router.push("/onboarding");
      return;
    }

    if (!needsOnboarding && pathname === "/onboarding") {
      console.log("[AUTH_GUARD] Onboarding already complete, skipping...");
      router.push(`/dashboard/${user.role.toLowerCase()}`);
      return;
    }

    setIsAuthorized(true);
  }, [user, isLoading, router, pathname]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black">
         <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
         <p className="text-sm font-medium text-gray-500 animate-pulse tracking-tight">Securing your session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
