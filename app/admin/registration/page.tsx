"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { registerAdminAccount } from "@/lib/admin/admin-auth";

export default function AdminRegistrationPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMessage("Mobile Number is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email Address is required.");
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

    try {
      setLoading(true);
      await registerAdminAccount({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        password,
      });

      setSuccessMessage("Admin account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create Admin account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-pink-50/40 py-12 px-4 sm:px-8 text-purple-950 font-sans flex items-center justify-center">
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-2xl rounded-3xl border border-purple-200/80 shadow-2xl p-8 sm:p-12 relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-purple-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 mb-2">
            Administrator Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            Admin Registration
          </h1>
          <p className="text-xs text-purple-900/60 mt-1">
            Create an authorized System Administrator account for RentasBuddy.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="System Administrator"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rentasbuddy.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white font-extrabold text-base shadow-xl shadow-purple-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Creating Admin Account...
              </>
            ) : (
              <>
                Create Admin Account <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-purple-100">
          <Link href="/admin/login" className="text-xs font-extrabold text-purple-700 hover:underline">
            Already have an Admin Account? Login to Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
