"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function SessionRedirect() {
  const router = useRouter();

  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      if (user.role === "ADMIN" || user.onboardingCompleted) {
        router.push(`/dashboard/${user.role.toLowerCase()}`);
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, isLoading, router]);

  return null;
}
