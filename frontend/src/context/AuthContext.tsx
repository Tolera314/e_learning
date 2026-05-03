"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  role: string;
  onboardingCompleted: boolean;
  avatar?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 15 days in milliseconds
const SESSION_EXPIRY_MS = 15 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");
    setUser(null);
    setToken(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const handleHydration = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUserStr = localStorage.getItem("user");
        const loginTimestamp = localStorage.getItem("loginTimestamp");

        if (storedToken && storedUserStr && loginTimestamp) {
          const now = Date.now();
          const loginTime = parseInt(loginTimestamp);

          // ENFORCE 15-DAY EXPIRY
          if (now - loginTime > SESSION_EXPIRY_MS) {
            console.warn("[AUTH] Session expired (15-day policy)");
            logout();
          } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUserStr));
          }
        }
      } catch (error) {
        console.error("[AUTH] Hydration failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleHydration();
  }, [logout]);

  const login = (newToken: string, newRefreshToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("loginTimestamp", Date.now().toString());
    
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
