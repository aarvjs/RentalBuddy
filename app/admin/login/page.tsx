"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { loginAdminAccount, resetAdminPassword } from "@/lib/admin/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }
    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    try {
      setLoading(true);
      await loginAdminAccount(email.trim(), password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid admin credentials or unauthorized account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    setResetError("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your admin email address.");
      return;
    }

    try {
      setResetLoading(true);
      await resetAdminPassword(resetEmail.trim());
      setResetMessage("Password reset instructions sent to " + resetEmail);
    } catch (err: any) {
      setResetError(err?.message || "Failed to send reset link.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-pink-50/40 py-12 px-4 sm:px-8 text-purple-950 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-3xl border border-purple-200/80 shadow-2xl p-8 sm:p-10 relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-purple-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 mb-2">
            Administrator Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            Admin Sign In
          </h1>
          <p className="text-xs text-purple-900/60 mt-1">
            Access platform administration, user records, and provider KYC verification.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetModalOpen(true);
                }}
                className="text-xs font-bold text-pink-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white font-extrabold text-base shadow-xl shadow-purple-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Login to Admin Panel...
              </>
            ) : (
              <>
                Login to Admin Panel <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-purple-100 space-y-2">
          <div>
            <Link href="/admin/registration" className="text-xs font-extrabold text-purple-700 hover:underline">
              Need to create an Admin Account? Register
            </Link>
          </div>
          <div>
            <Link href="/" className="text-xs font-semibold text-purple-900/60 hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Website
            </Link>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 bg-purple-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-purple-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-purple-950">Reset Admin Password</h3>
                  <p className="text-[11px] text-purple-900/60">Send password reset email link</p>
                </div>
              </div>

              {resetMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  {resetMessage}
                </div>
              )}

              {resetError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold">
                  {resetError}
                </div>
              )}

              <form onSubmit={handleSendResetLink} className="space-y-4">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@rentasbuddy.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-xs text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-xs font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2 rounded-full bg-purple-700 text-white text-xs font-extrabold shadow-md hover:bg-purple-800"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
