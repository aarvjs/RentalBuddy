"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Camera,
  Key,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Lock,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/buttons/Buttons";
import { FadeIn } from "@/components/animations/Animations";
import { resetPassword, uploadProfileImage, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";

export default function SettingsPage() {
  const { user, profile, logout, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [gender, setGender] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);

  // Change Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingPass, setUpdatingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  // Forgot Password Reset Email State
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Preferences State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bookingNotifs, setBookingNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/settings");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setMobileNumber(profile.mobileNumber || "");
      setCity(profile.city || "");
      setPincode(profile.pincode || "");
      setGender(profile.gender || "");
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-sm font-bold text-purple-950">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF9FA] px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/90 border border-pink-200 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-purple-950 mb-2">Authentication Required</h3>
          <p className="text-purple-900/70 text-sm mb-6">
            Please sign in or create an account to manage your settings.
          </p>
          <div className="flex flex-col gap-3">
            <Button href="/login?redirect=/settings" variant="primary" className="w-full">
              Sign In
            </Button>
            <Button href="/register?redirect=/settings" variant="secondary" className="w-full">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingImage(true);
      await uploadProfileImage(user.uid, file);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      console.warn("Could not upload profile photo:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePersonalInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingProfile(true);
      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        gender,
        updatedAt: new Date().toISOString(),
      });
      setProfileSuccess(true);
      setIsEditing(false);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      console.error("Error saving personal information:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    try {
      setUpdatingPass(true);
      if (user) {
        await updatePassword(user, newPassword);
        setPassSuccess("Password updated successfully!");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err: any) {
      console.error("Error updating password:", err);
      if (err.code === "auth/requires-recent-login") {
        setPassError("For security, please log out and log in again before changing your password.");
      } else {
        setPassError(err.message || "Failed to update password.");
      }
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;
    try {
      setResetLoading(true);
      await resetPassword(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      console.error("Password reset error:", err);
    } finally {
      setResetLoading(false);
    }
  };

  const displayName = profile?.fullName || user.displayName || user.email?.split("@")[0] || "Member";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-pink-100/50 via-purple-50/30 to-[#FFF9FA]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-10">
        {/* Breadcrumb */}
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 text-xs font-semibold text-purple-950 shadow-sm">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
            <Link href="/dashboard" className="hover:text-pink-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-pink-600 font-bold">Account Settings</span>
          </div>
        </FadeIn>

        {/* Page Heading */}
        <FadeIn delay={0.2}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Account & Security
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight">
              Account Settings
            </h1>
            <p className="text-purple-900/70 text-sm sm:text-base mt-1">
              Manage your personal information, security preferences, and companion account controls.
            </p>
          </div>
        </FadeIn>

        {profileSuccess && (
          <FadeIn>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile information updated successfully!</span>
            </div>
          </FadeIn>
        )}

        {/* 1. PROFILE HEADER CARD */}
        <FadeIn delay={0.3}>
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Avatar + Change Photo */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-pink-500/25 overflow-hidden border-4 border-white">
                  {profile?.photoURL || user.photoURL ? (
                    <img src={profile?.photoURL || user.photoURL || ""} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    avatarLetter
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-2xl font-extrabold text-purple-950">{displayName}</h2>
                  <span className="px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-[11px] font-extrabold uppercase tracking-wider">
                    {profile?.userType === "provider" ? "Partner Provider" : profile?.userType === "both" ? "Dual Member" : "Client Member"}
                  </span>
                </div>

                <p className="text-xs text-purple-900/70 font-medium mb-3">{user.email}</p>

                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-600 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    <span>{uploadingImage ? "Uploading Photo..." : "Change Photo"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 2. PERSONAL INFORMATION */}
        <FadeIn delay={0.4}>
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-pink-100">
              <div>
                <h3 className="text-xl font-extrabold text-purple-950">Personal Information</h3>
                <p className="text-xs text-purple-900/60 font-medium">Update your profile details below</p>
              </div>

              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSavePersonalInformation} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      Email Address <span className="text-[10px] text-purple-900/50">(Authentication Login Email)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email || ""}
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/20 border border-pink-100 text-purple-900/50 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      Pincode / Postal Code
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="10001"
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" variant="primary" disabled={savingProfile} icon>
                    {savingProfile ? "Saving Changes..." : "Save Changes"}
                  </Button>
                  <Button type="button" onClick={() => setIsEditing(false)} variant="secondary">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">Full Name</span>
                    <span className="text-sm font-extrabold text-purple-950">{displayName}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">Email Address</span>
                    <span className="text-sm font-extrabold text-purple-950">{user.email}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">Mobile Number</span>
                    <span className="text-sm font-extrabold text-purple-950">{profile?.mobileNumber || "Not provided"}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">City / Location</span>
                    <span className="text-sm font-extrabold text-purple-950">{profile?.city || "Not specified"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* 3. PASSWORD & SECURITY */}
        <FadeIn delay={0.5}>
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 space-y-6">
            <div className="pb-4 border-b border-pink-100">
              <h3 className="text-xl font-extrabold text-purple-950">Password & Security</h3>
              <p className="text-xs text-purple-900/60 font-medium">Manage your login security and authentication options</p>
            </div>

            {passSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <Button type="submit" variant="primary" size="sm" disabled={updatingPass}>
                  {updatingPass ? "Updating Password..." : "Update Password"}
                </Button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
                >
                  {resetLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Forgot Password? Send Reset Email</span>
                </button>
              </div>
            </form>
          </div>
        </FadeIn>

        {/* 4. ACCOUNT PREFERENCES */}
        <FadeIn delay={0.6}>
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 space-y-6">
            <div className="pb-4 border-b border-pink-100">
              <h3 className="text-xl font-extrabold text-purple-950">Account Preferences</h3>
              <p className="text-xs text-purple-900/60 font-medium">Control notification channels and communication updates</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
                <div>
                  <h4 className="font-extrabold text-purple-950 text-sm">Email Notifications</h4>
                  <p className="text-xs text-purple-900/60">Receive booking confirmations and receipts via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="w-5 h-5 rounded border-pink-300 text-pink-600 focus:ring-pink-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
                <div>
                  <h4 className="font-extrabold text-purple-950 text-sm">Booking Notifications</h4>
                  <p className="text-xs text-purple-900/60">Receive instant updates regarding companion assignments</p>
                </div>
                <input
                  type="checkbox"
                  checked={bookingNotifs}
                  onChange={(e) => setBookingNotifs(e.target.checked)}
                  className="w-5 h-5 rounded border-pink-300 text-pink-600 focus:ring-pink-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
                <div>
                  <h4 className="font-extrabold text-purple-950 text-sm">Marketing Updates</h4>
                  <p className="text-xs text-purple-900/60">Receive news about new verified companion cities</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingNotifs}
                  onChange={(e) => setMarketingNotifs(e.target.checked)}
                  className="w-5 h-5 rounded border-pink-300 text-pink-600 focus:ring-pink-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 5. DANGER ZONE */}
        <FadeIn delay={0.7}>
          <div className="p-8 rounded-[2.5rem] bg-rose-50/40 border border-rose-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-purple-950 text-base">Account Actions</h4>
              <p className="text-xs text-purple-900/60">Sign out or request account closure</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-white border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-rose-600 text-white font-extrabold text-xs shadow-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm">
            <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-purple-950">Close Member Account</h3>
              <p className="text-xs text-purple-900/70 leading-relaxed">
                Deleting your account will purge your private profile and companion history. This action requires senior concierge verification.
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowDeleteModal(false)} variant="secondary" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    alert("Account deletion request submitted to concierge desk.");
                    setShowDeleteModal(false);
                  }}
                  variant="primary"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirm Request
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
