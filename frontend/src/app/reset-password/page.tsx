"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

const resetSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) {
      setGlobalError("Invalid or missing password reset token.");
    }
  }, [token]);

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) return;

    setLoading(true);
    setGlobalError("");

    try {
      await api.post("/auth/reset-password", { token, newPassword: data.password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Request</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
        Set New Password
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
        Create a new password for {email || "your account"}.
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

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-md flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Password reset successfully! Redirecting to login...
          </p>
        </motion.div>
      )}

      {!success && (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="mt-1">
              <input
                {...register("password")}
                type="password"
                className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm bg-transparent dark:text-white transition-colors`}
              />
              {errors.password && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {errors.password.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                {...register("confirmPassword")}
                type="password"
                className={`appearance-none block w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm bg-transparent dark:text-white transition-colors`}
              />
              {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xl shadow-emerald-500/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

export default function ResetPassword() {
  return (
    <AuthLayout
      imagePosition="left"
      imageUrl="/images/placeholder.jpg" // Will be updated
      imageQuote="The roots of education are bitter, but the fruit is sweet."
      imageAuthor="Aristotle"
    >
      <div className="w-full max-w-md mx-auto">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </AuthLayout>
  );
}
