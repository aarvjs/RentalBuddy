"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getProviderProfile } from "@/lib/service-provider/provider-auth";
import {
  updateProviderProfileData,
  uploadProviderAvatar,
} from "@/lib/service-provider/provider-profile";
import { ProviderProfile } from "@/types/service-provider";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

export default function ServiceProviderProfilePage() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await getProviderProfile(user.uid);
        if (data) {
          setProfile(data);
          setFullName(data.fullName || "");
          setEmail(data.email || user.email || "");
          setMobileNumber(data.mobileNumber || "");
          setAddress(data.address || "");
          setCity(data.city || "");
          setState(data.state || "");
          setPincode(data.pincode || "");
          setBio(data.bio || "");
          setAvatarPreview(data.photoURL || user.photoURL || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));

      const user = auth.currentUser;
      if (user) {
        try {
          setSaving(true);
          setErrorMessage("");
          setSuccessMessage("");
          const url = await uploadProviderAvatar(user.uid, file);
          setAvatarPreview(url);
          setProfile((prev) => (prev ? { ...prev, photoURL: url } : null));
          setSuccessMessage("Profile photo uploaded & updated successfully!");
          setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err: any) {
          console.error("Avatar upload failed:", err);
          setErrorMessage(err?.message || "Failed to upload profile photo.");
        } finally {
          setSaving(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const user = auth.currentUser;
    if (!user) return;

    try {
      setSaving(true);

      let photoURL = avatarPreview;
      if (avatarFile) {
        photoURL = await uploadProviderAvatar(user.uid, avatarFile);
      }

      await updateProviderProfileData(user.uid, {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        bio: bio.trim(),
        photoURL,
      });

      setSuccessMessage("Provider profile updated successfully!");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Provider Profile
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Manage your personal and professional profile details displayed on RentasBuddy.
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Avatar Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg overflow-hidden border-4 border-white">
              {avatarPreview ? (
                <img src={avatarPreview} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName?.charAt(0)?.toUpperCase() || "P"
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-pink-600 transition-colors">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-lg font-extrabold text-purple-950">{fullName || "Provider Name"}</h3>
            <p className="text-xs text-pink-600 font-semibold">{email}</p>
            <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 mt-2">
              Role: Service Provider
            </span>
          </div>
        </div>

        {/* Basic Information Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-6">
          <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-pink-100">
            Personal & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-pink-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Email Address (Account ID)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-pink-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-purple-950/60 text-sm font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-pink-400 absolute left-4 top-3.5" />
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-pink-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address / locality"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City name"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State name"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit pincode"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Professional Bio
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Introduce your background, experience, and companion/service domain..."
              className="w-full p-4 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
