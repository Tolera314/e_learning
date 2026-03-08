"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";

const loginSchema = z.object({
  phoneOrEmail: z.string().min(1, { message: "Email or Phone is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setGlobalError("");

    try {
      const response = await api.post("/auth/login", {
        identifier: data.phoneOrEmail,
        password: data.password,
      });

      const resData = response.data;

      // Store JWTs
      localStorage.setItem("token", resData.token);
      localStorage.setItem("refreshToken", resData.refreshToken);
      localStorage.setItem("user", JSON.stringify(resData.user));

      if (!resData.user.onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push(`/dashboard/${resData.user.role.toLowerCase()}`);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      imagePosition="right"
      imageUrl="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&q=80"
      imageQuote="The beautiful thing about learning is that nobody can take it away from you."
      imageAuthor="B.B. King"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
            Sign up for free
          </Link>
        </p>

        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{globalError}</p>
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address or Phone Number
            </label>
            <div className="mt-1">
              <input
                {...register("phoneOrEmail")}
                type="text"
                placeholder="e.g., student@domain.com or 0911..."
                className={`appearance-none block w-full px-4 py-3 border ${errors.phoneOrEmail ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm bg-transparent dark:text-white transition-colors`}
              />
              {errors.phoneOrEmail && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {errors.phoneOrEmail.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="mt-1">
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm bg-transparent dark:text-white transition-colors`}
              />
              {errors.password && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xl shadow-emerald-500/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in to Dashboard"}
            </button>
          </div>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
