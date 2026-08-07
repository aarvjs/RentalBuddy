"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  Lock,
  ChevronRight,
  Loader2,
  X,
  Save,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/buttons/Buttons";
import { FadeIn } from "@/components/animations/Animations";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName || "");
      setEditMobile(profile.mobileNumber || "");
      setEditCity(profile.city || "");
      setEditPincode(profile.pincode || "");
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-sm font-bold text-purple-950">Loading profile details...</span>
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
            Please sign in or create an account to view your private profile.
          </p>
          <div className="flex flex-col gap-3">
            <Button href="/login?redirect=/profile" variant="primary" className="w-full">
              Sign In
            </Button>
            <Button href="/register?redirect=/profile" variant="secondary" className="w-full">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, "users", user.uid), {
        fullName: editName.trim(),
        mobileNumber: editMobile.trim(),
        city: editCity.trim(),
        pincode: editPincode.trim(),
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.fullName || user.displayName || user.email?.split("@")[0] || "Member";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-pink-100/50 via-purple-50/30 to-[#FFF9FA]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-8">
        {/* Breadcrumb */}
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 text-xs font-semibold text-purple-950 shadow-sm">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-pink-600 font-bold">My Profile</span>
          </div>
        </FadeIn>

        {saveSuccess && (
          <FadeIn>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          </FadeIn>
        )}

        {/* Profile Header Card */}
        <FadeIn delay={0.2}>
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* User Avatar */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-pink-500/25 shrink-0 border-4 border-white">
                {avatarLetter}
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
                    {displayName}
                  </h1>
                  {profile?.userType && (
                    <span className="px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-xs font-extrabold uppercase tracking-wider">
                      {profile.userType === "provider" ? "Partner Provider" : profile.userType === "both" ? "Dual Member" : "Client Member"}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-purple-900/70 font-medium mb-3">
                  {user.email}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-purple-950/80">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-pink-500" />
                    {profile?.city || "Location Pending"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-pink-500" />
                    {profile?.gender || "Gender Unspecified"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
            >
              <Edit3 className="w-4 h-4 text-pink-500" />
              <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
            </Button>
          </div>
        </FadeIn>

        {/* Profile Information Card / Edit Form */}
        <FadeIn delay={0.3}>
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-pink-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-purple-950">
                  {isEditing ? "Edit Personal Details" : "Account Information"}
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  {isEditing ? "Update your personal details below." : "Protected by Swiss 256-bit encryption standards."}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
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
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                      Pincode / Postal Code
                    </label>
                    <input
                      type="text"
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value)}
                      placeholder="10001"
                      className="w-full px-5 py-3.5 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={saving} icon>
                    {saving ? "Saving Changes..." : "Save Profile Details"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-4">
                    <UserIcon className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">Full Name</span>
                      <span className="text-base font-extrabold text-purple-950">{displayName}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-4">
                    <Mail className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">Primary Email</span>
                      <span className="text-base font-extrabold text-purple-950">{user.email}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-4">
                    <Phone className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">Mobile Number</span>
                      <span className="text-base font-extrabold text-purple-950">
                        {profile?.mobileNumber || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">City / Metro</span>
                      <span className="text-base font-extrabold text-purple-950">
                        {profile?.city || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-4">
                    <Sparkles className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">Pincode / Postal Code</span>
                      <span className="text-base font-extrabold text-purple-950">
                        {profile?.pincode || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-4">
                    <ShieldCheck className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">Account Type</span>
                      <span className="text-base font-extrabold text-purple-950 capitalize">
                        {profile?.userType === "provider" ? "Partner Companion Provider" : profile?.userType === "both" ? "Dual Member & Provider" : "Client Account"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
