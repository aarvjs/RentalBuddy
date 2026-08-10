"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { updatePassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getAdminProfile, logoutAdmin } from "@/lib/admin/admin-auth";
import { AdminProfile } from "@/types/admin";
import { useRouter } from "next/navigation";
import {
  Settings,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Save,
} from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadAdminProfile() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await getAdminProfile(user.uid);
        if (data) {
          setAdmin(data);
          setFullName(data.fullName || "");
          setMobileNumber(data.mobileNumber || "");
        }
      } catch (err) {
        console.error("Error loading admin profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const user = auth.currentUser;
    if (!user) return;

    try {
      setSaving(true);
      await updateProfile(user, { displayName: fullName.trim() });
      await setDoc(
        doc(db, "admins", user.uid),
        {
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setSuccessMsg("Admin profile updated successfully!");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const user = auth.currentUser;
    if (!user) return;

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      setPassLoading(true);
      await updatePassword(user, newPassword);
      setSuccessMsg("Admin password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err?.code === "auth/requires-recent-login") {
        setErrorMsg("For security, please logout and log back in before changing password.");
      } else {
        setErrorMsg(err?.message || "Failed to change password.");
      }
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Admin Settings
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Manage system administrator credentials and security settings.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Admin Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md space-y-6">
        <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-purple-100 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" /> Admin Account Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Email (Admin Account ID)
            </label>
            <input
              type="email"
              disabled
              value={admin?.email || ""}
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-purple-950/60 text-sm font-medium cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Mobile Number
            </label>
            <input
              type="tel"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <input
              type="text"
              disabled
              value="System Administrator (role: admin)"
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-purple-950/60 text-sm font-bold cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
          </button>
        </div>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handleChangePassword} className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md space-y-6">
        <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-purple-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-600" /> Security & Password Update
        </h3>

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
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
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
              placeholder="Re-enter password"
              className="w-full px-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={passLoading}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all"
          >
            {passLoading ? "Updating..." : "Update Admin Password"}
          </button>
        </div>
      </form>

      {/* Logout Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-rose-100 shadow-md flex items-center justify-between">
        <div>
          <h4 className="text-base font-extrabold text-purple-950">Admin Session</h4>
          <p className="text-xs text-purple-900/60">Sign out of the system administration console safely.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-100 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout Admin
        </button>
      </div>
    </div>
  );
}
