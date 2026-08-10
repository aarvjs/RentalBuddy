"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logoutProvider } from "@/lib/service-provider/provider-auth";
import {
  Settings,
  Lock,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Mail,
} from "lucide-react";

export default function ServiceProviderSettingsPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const user = auth.currentUser;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!user) return;

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await updatePassword(user, newPassword);
      setSuccessMessage("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err?.code === "auth/requires-recent-login") {
        setErrorMessage("For security reasons, please logout and log back in before changing your password.");
      } else {
        setErrorMessage(err?.message || "Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!user?.email) return;
    setSuccessMessage("");
    setErrorMessage("");

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, user.email);
      setSuccessMessage(`Password reset link sent to ${user.email}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutProvider();
    router.push("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Provider Settings
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Manage your provider account security, preferences, and notifications.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Security & Password Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-6">
        <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-pink-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-pink-500" /> Security & Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleSendResetLink}
              disabled={resetLoading}
              className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Send Password Reset Email Link
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-6">
        <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-pink-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-pink-500" /> Notifications & Alerts
        </h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/40 border border-pink-100 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-purple-950">Email Notifications</p>
              <p className="text-[11px] text-purple-900/60">Receive booking updates and platform news via email.</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 accent-pink-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/40 border border-pink-100 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-purple-950">SMS Booking Alerts</p>
              <p className="text-[11px] text-purple-900/60">Get instant SMS alerts for customer booking requests.</p>
            </div>
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
              className="w-4 h-4 accent-pink-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/40 border border-pink-100 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-purple-950">Payout & Earnings Alerts</p>
              <p className="text-[11px] text-purple-900/60">Notifications when payout funds are credited to your account.</p>
            </div>
            <input
              type="checkbox"
              checked={bookingAlerts}
              onChange={(e) => setBookingAlerts(e.target.checked)}
              className="w-4 h-4 accent-pink-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Logout Action */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-rose-100 shadow-md flex items-center justify-between">
        <div>
          <h4 className="text-base font-extrabold text-purple-950">Provider Session</h4>
          <p className="text-xs text-purple-900/60">Sign out of your Service Provider console safely.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-100 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout Provider
        </button>
      </div>
    </div>
  );
}
