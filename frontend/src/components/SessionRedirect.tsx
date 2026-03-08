"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          // If they haven't completed onboarding, the dashboard check might still catch them,
          // but let's be safe and send them to the appropriate place
          if (!user.onboardingCompleted) {
            router.push("/onboarding");
          } else {
            router.push(`/dashboard/${user.role.toLowerCase()}`);
          }
        }
      } catch (e) {
        console.error("Session check failed", e);
      }
    }
  }, [router]);

  return null;
}
