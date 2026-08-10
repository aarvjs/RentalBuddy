"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/buttons/Buttons";
import { SITE_CONFIG } from "@/lib/constants";
import { loginUser, resetPassword, getUserProfile } from "@/lib/firebase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setResetSent(false);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(email.trim(), password);

      // Fetch user document from Firestore users/{uid}
      const userProf = await getUserProfile(user.uid);
      const isProvider = userProf?.userType === "provider";

      setSuccessMessage(`Login Successful! Redirecting to ${isProvider ? "Provider Portal" : "dashboard"}...`);

      setTimeout(() => {
        if (isProvider) {
          router.push("/service-provider/dashboard");
        } else {
          router.push(redirectUrl || "/dashboard");
        }
      }, 1200);
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setErrorMessage("Invalid email or password. Please check your credentials or create a new account.");
      } else if (code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setErrorMessage("Access temporarily blocked due to multiple failed attempts. Please reset your password.");
      } else {
        setErrorMessage("Invalid email or password. Please check your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!email.trim()) {
      setErrorMessage("Please enter your email address above to reset your password.");
      return;
    }

    try {
      setResetLoading(true);
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") {
        setErrorMessage("No account found with this email address.");
      } else if (code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else {
        setErrorMessage("Unable to send password reset link. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-purple-950 mb-2">Member Sign In</h2>
        <p className="text-purple-900/70 text-sm">
          Enter your registered email and password to sign in.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {resetSent && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Password reset link sent to your email address! Please check your inbox.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950">
              Password *
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-xs font-bold text-pink-600 hover:underline"
            >
              {resetLoading ? "Sending Link..." : "Forgot Password?"}
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-xs text-purple-900/70">
        Don&apos;t have an account?{" "}
        <Link href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`} className="font-bold text-pink-600 hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gradient-to-b from-pink-100/60 via-purple-50/40 to-white px-4 sm:px-8">
      <div className="max-w-5xl w-full rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-pink-200 shadow-2xl shadow-purple-500/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Visual Showcase */}
        <div className="lg:col-span-5 relative p-10 bg-gradient-to-br from-pink-950 via-purple-950 to-purple-900 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-35">
            <Image
              src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000"
              alt="Luxury Access"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-950/60 to-transparent" />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-xl">{SITE_CONFIG.name}</span>
            </Link>

            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-pink-200">
              Private Access
            </span>
          </div>

          <div className="relative z-10 my-10 space-y-4">
            <h3 className="text-2xl font-bold font-serif">Welcome Back to RentasBuddy</h3>
            <p className="text-xs text-pink-100/90 leading-relaxed">
              Sign in to manage your bookings, account settings, or service provider console securely.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-pink-200/80">
            <ShieldCheck className="w-4 h-4 text-pink-400" />
            <span>256-bit Encrypted Connection</span>
          </div>
        </div>

        {/* Right Side: Form wrapped in Suspense */}
        <Suspense fallback={<div className="lg:col-span-7 p-12 text-center text-purple-900/60 font-semibold">Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
