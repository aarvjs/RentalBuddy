"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/buttons/Buttons";
import { SITE_CONFIG } from "@/lib/constants";
import { loginUser, resetPassword } from "@/lib/firebase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

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
      await loginUser(email.trim(), password);
      setSuccessMessage("Login Successful! Welcome back to Amora Luxe.");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    } catch (err: any) {
      // Suppress raw console exception throwing & display clean UI message
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setErrorMessage("Invalid email or password. Please check your details or create an account.");
      } else if (code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setErrorMessage("Access temporarily blocked due to multiple failed attempts. Please reset your password.");
      } else {
        setErrorMessage("Invalid email or password. Please check your credentials or create a new account.");
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
          Enter your email and password to access your account.
        </p>
      </div>

      {/* Clean UI Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Clean UI Success Alert */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Password Reset Alert */}
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
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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
              className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
            >
              {resetLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4"
          disabled={loading || !!successMessage}
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
        <Link
          href={`/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="font-bold text-pink-600 hover:underline"
        >
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
        <div className="lg:col-span-5 relative p-10 bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1510525009512-ad7dc1c23716?auto=format&fit=crop&q=80&w=1000"
              alt="Luxury Lifestyle"
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
              Encrypted Member Portal
            </span>
          </div>

          <div className="relative z-10 my-12">
            <p className="font-serif italic text-lg leading-relaxed mb-4 text-pink-100">
              &quot;Discretion is the cornerstone of luxury. Entering Amora guarantees complete anonymity and world-class companionship.&quot;
            </p>
            <span className="text-xs font-semibold text-pink-300">— Swiss Concierge Office</span>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-pink-200/80">
            <ShieldCheck className="w-4 h-4 text-pink-400" />
            <span>Swiss 256-Bit SSL Encryption</span>
          </div>
        </div>

        {/* Right Side: Form wrapped in Suspense */}
        <Suspense fallback={<div className="lg:col-span-7 p-12 text-center text-purple-900/60 font-semibold">Loading member portal...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
