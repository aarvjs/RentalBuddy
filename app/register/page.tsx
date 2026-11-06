"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
  Briefcase,
  MapPin,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/buttons/Buttons";
import { SITE_CONFIG } from "@/lib/constants";
import { registerProviderAccount, registerCustomerUser } from "@/lib/firebase";
import { CelebrationParticles } from "@/components/animations/Confetti";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const isProvider = typeParam === "provider";
  const redirectUrl = searchParams.get("redirect") || (isProvider ? "/service-provider/dashboard" : "/services");

  // Common Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // Customer Specific Fields
  const [gender, setGender] = useState("");
  const [preference, setPreference] = useState<"Find a Partner" | "Both">("Find a Partner");

  // Provider Specific Fields
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!city.trim()) {
      setErrorMessage("City is required.");
      return;
    }

    if (isProvider) {
      if (!mobileNumber.trim()) {
        setErrorMessage("Mobile Number is required for Service Providers.");
        return;
      }
      if (!state.trim()) {
        setErrorMessage("State is required for Service Providers.");
        return;
      }
      if (!pincode.trim()) {
        setErrorMessage("Pincode is required.");
        return;
      }
    } else {
      if (!gender) {
        setErrorMessage("Please select your gender.");
        return;
      }
    }

    try {
      setLoading(true);

      if (isProvider) {
        await registerProviderAccount({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          mobileNumber: mobileNumber.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        });
      } else {
        await registerCustomerUser({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          city: city.trim(),
          gender,
          preference,
          mobileNumber: mobileNumber.trim(),
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please sign in instead.");
      } else if (code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setErrorMessage("Password should be at least 6 characters long.");
      } else {
        setErrorMessage(err.message || "Failed to create account. Please check your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center relative">
      {isSuccess && <CelebrationParticles />}

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-extrabold uppercase tracking-wider mb-2">
          {isProvider ? <Briefcase className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          {isProvider ? "Service Provider Onboarding" : "Customer Portal Registration"}
        </div>
        <h2 className="text-3xl font-extrabold text-purple-950 mb-1">
          {isProvider ? "Service Provider Registration" : "Create Customer Account"}
        </h2>
        <p className="text-purple-900/70 text-sm">
          {isProvider
            ? "Register as an accredited companion service provider to manage availability and receive client bookings."
            : "Sign up to discover verified companions, check live availability windows, and schedule experiences."}
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Banner */}
      {isSuccess && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-sm font-bold flex items-center gap-3 shadow-xl animate-bounce">
          <CheckCircle2 className="w-6 h-6 shrink-0 text-white" />
          <div>
            <span className="block font-black text-base">🎉 Account Created Successfully!</span>
            <span className="text-xs text-pink-100 font-medium">
              {isProvider
                ? "Welcome to the Provider Portal. Redirecting to your dashboard..."
                : "Welcome to RentasBuddy. Redirecting to your booking experience..."}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={isSuccess}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohan Malhotra"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled={isSuccess}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={isSuccess}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={isSuccess}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* CUSTOMER ONLY FIELDS */}
        {!isProvider && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={isSuccess}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kanpur, Delhi, Mumbai..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                  Gender *
                </label>
                <select
                  required
                  disabled={isSuccess}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                  I want to *
                </label>
                <select
                  disabled={isSuccess}
                  value={preference}
                  onChange={(e) => setPreference(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-semibold"
                >
                  <option value="Find a Partner">Find a Partner</option>
                  <option value="Both">Both (Find & Offer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-900/70 mb-1.5">
                  Mobile Number <span className="text-[10px] text-purple-900/50">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    disabled={isSuccess}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* PROVIDER ONLY FIELDS */}
        {isProvider && (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                Mobile Number * (Used for booking OTP verification)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  disabled={isSuccess}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={isSuccess}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kanpur"
                    className="w-full pl-9 pr-3 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  required
                  disabled={isSuccess}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Uttar Pradesh"
                  className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  disabled={isSuccess}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="208020"
                  className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                />
              </div>
            </div>
          </>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4"
          disabled={loading || isSuccess}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Registration Successful!
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {isProvider ? "Register as Service Provider" : "Create Customer Account"}{" "}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      {/* Bottom Switch Links - Focused on Sign In only */}
      <div className="mt-8 pt-6 border-t border-pink-100 text-center text-xs">
        <span className="text-purple-900/70">
          {isProvider ? "Already registered as a Service Provider? " : "Already have an account? "}
        </span>
        <Link href="/login" className="font-extrabold text-pink-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gradient-to-b from-pink-100/60 via-purple-50/40 to-white px-4 sm:px-8">
      <div className="max-w-5xl w-full rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-pink-200 shadow-2xl shadow-purple-500/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side Visual Showcase */}
        <div className="lg:col-span-5 relative p-10 bg-gradient-to-br from-pink-950 via-purple-950 to-purple-900 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-35">
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000"
              alt="RentasBuddy Member"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-950/60 to-transparent" />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">{SITE_CONFIG.name}</span>
            </Link>

            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-pink-200">
              Registration
            </span>
          </div>

          <div className="relative z-10 my-10 space-y-4">
            <h3 className="text-2xl font-extrabold">Verified Companion Marketplace</h3>
            <ul className="space-y-3 text-xs text-pink-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Verified companion profiles & discrete service arrangements</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Real-time availability windows & hourly rate transparency</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>In-person 6-digit connection OTP protocol</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>256-bit encrypted data privacy & non-disclosure protection</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-pink-200/80">
            <ShieldCheck className="w-4 h-4 text-pink-400" />
            <span>Strict Privacy Protection Guaranteed</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <Suspense fallback={<div className="lg:col-span-7 p-12 text-center text-purple-900/60 font-semibold">Loading registration form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
