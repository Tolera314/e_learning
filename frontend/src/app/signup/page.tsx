"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";

const signupSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(9, { message: "Phone number is too short" }).regex(/^[0-9+]+$/, { message: "Invalid phone format" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR" | null>(null);
  const [step, setStep] = useState(0); // 0: Role, 1: Details, 2: OTP, 3: Success
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    getValues
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const handleRoleSelect = (selectedRole: "STUDENT" | "INSTRUCTOR") => {
    setRole(selectedRole);
    setStep(1);
  };

  const handleNextStep = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setLoading(true);
    setGlobalError("");

    try {
      const values = getValues();
      const response = await api.post("/auth/register", {
        name: values.name,
        email: values.email || undefined,
        phoneNumber: values.phone,
        password: values.password,
        role: role || undefined,
      });

      const data = response.data;

      setUserId(data.userId);
      setStep(2);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinalSubmit = async (formData: any) => {
    const otp = (document.getElementById("otp") as HTMLInputElement).value;
    if (otp.length !== 6) {
      setGlobalError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setGlobalError("");

    try {
      const response = await api.post("/auth/verify-otp", {
        userId,
        otp,
      });

      const data = response.data;

      // Success: Store tokens
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (!data.user.onboardingCompleted) {
        setStep(3); // Success step with "Start Onboarding" button
      } else {
        router.push(`/dashboard/${data.user.role.toLowerCase()}`);
      }
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userId) return;
    try {
      await api.post("/auth/resend-otp", { userId });
      alert("OTP Resent!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthLayout
      imagePosition="left"
      imageUrl="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80"
      imageQuote="Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
      imageAuthor="Malcolm X"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {step === 0 ? "Join Ethio-Digital-Academy" : "Create your account"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          {step === 0 ? "Select your role to get started" : "Fill in your details below"}
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

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="role-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grid grid-cols-1 gap-4"
            >
              <button
                onClick={() => handleRoleSelect("STUDENT")}
                className="group p-6 bg-white dark:bg-[#111] border-2 border-transparent hover:border-emerald-500 rounded-2xl shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-xl">
                    <ArrowRight size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">I'm a Student</h3>
                    <p className="text-sm text-gray-500">Learn courses, watch lessons, and track progress.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("INSTRUCTOR")}
                className="group p-6 bg-white dark:bg-[#111] border-2 border-transparent hover:border-emerald-500 rounded-2xl shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                    <ArrowRight size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">I'm an Instructor</h3>
                    <p className="text-sm text-gray-500">Teach courses, host live classes, and earn income.</p>
                  </div>
                </div>
              </button>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setStep(0)} className="text-sm font-medium text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
                  ← Change role
                </button>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase">
                  {role} Registration
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="mt-1">
                  <input {...register("name")} type="text"
                    className={`appearance-none block w-full px-4 py-3 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm bg-transparent dark:text-white transition-colors`}
                  />
                  {errors.name && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {errors.name.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <div className="mt-1">
                  <input {...register("email")} type="email"
                    className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm bg-transparent dark:text-white transition-colors`}
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number (+251)</label>
                <div className="mt-1">
                  <input {...register("phone")} type="tel" placeholder="911234567"
                    className={`appearance-none block w-full px-4 py-3 border ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm bg-transparent dark:text-white transition-colors`}
                  />
                  {errors.phone && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="mt-1">
                  <input {...register("password")} type="password"
                    className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm bg-transparent dark:text-white transition-colors`}
                  />
                  {errors.password && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {errors.password.message}</p>}
                </div>
              </div>

              <div className="pt-2">
                <button type="button" onClick={handleNextStep} disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors gap-2 items-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
              onSubmit={handleSubmit(onFinalSubmit)}
            >
              <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Verify your email</h3>
                <p className="text-sm text-gray-500">We've sent a 6-digit code to your inbox. Please enter it below.</p>
              </div>

              <div className="flex justify-center gap-2">
                <input id="otp" name="otp" type="text" maxLength={6} required placeholder="------"
                  className="appearance-none block w-full text-center text-3xl tracking-[1em] px-4 py-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-transparent dark:text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} disabled={loading}
                  className="w-1/3 flex justify-center py-3.5 px-4 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button type="submit" onClick={onFinalSubmit} disabled={loading}
                  className="w-2/3 flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xl shadow-emerald-500/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-colors items-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Account"}
                </button>
              </div>

              <div className="text-center">
                <button type="button" onClick={handleResendOTP} className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                  Didn't receive a code? Resend
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h3>
              <p className="text-gray-500 mb-8 max-w-[250px] mx-auto">Welcome to the community. Let's personalize your experience.</p>
              <Link href="/onboarding" className="inline-flex justify-center w-full py-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                Start Onboarding
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthLayout>
  );
}
