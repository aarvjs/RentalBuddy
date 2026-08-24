"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, getUserProfile } from "@/lib/firebase";
import { logoutProvider, getProviderProfile } from "@/lib/service-provider/provider-auth";
import { LocationSearchSelector, ServiceLocationData } from "@/components/location/LocationSearchSelector";
import { isValidLocation } from "@/lib/locations";
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
  MapPin,
  Save,
  Copy,
} from "lucide-react";

export default function ServiceProviderSettingsPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);

  // OpenStreetMap Location state
  const [providerLoc, setProviderLoc] = useState<ServiceLocationData | null>(null);
  const [custLocData, setCustLocData] = useState<ServiceLocationData | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    async function loadLocations() {
      if (!user) return;
      try {
        const [prof, userProf] = await Promise.all([
          getProviderProfile(user.uid),
          getUserProfile(user.uid),
        ]);

        const provLocation = prof?.providerLocation || prof?.location;
        if (prof && isValidLocation(provLocation)) {
          setProviderLoc({
            fullAddress: provLocation?.address || `${provLocation?.locality || ""}, ${provLocation?.city || ""}, ${provLocation?.state || ""}`,
            country: provLocation?.country || "India",
            state: provLocation?.state || provLocation?.stateName || prof.stateName || prof.state || "",
            city: provLocation?.city || provLocation?.cityName || prof.cityName || prof.city || "",
            locality: provLocation?.locality || provLocation?.localityName || prof.localityName || prof.locality || "",
            pincode: provLocation?.pincode || prof.pincode || "",
            latitude: Number(provLocation?.latitude) || 26.4499,
            longitude: Number(provLocation?.longitude) || 80.3319,
            stateId: provLocation?.stateId || prof.stateId || "",
            stateName: provLocation?.stateName || provLocation?.state || prof.stateName || prof.state || "",
            cityId: provLocation?.cityId || prof.cityId || "",
            cityName: provLocation?.cityName || provLocation?.city || prof.cityName || prof.city || "",
            localityId: provLocation?.localityId || prof.localityId || "",
            localityName: provLocation?.localityName || provLocation?.locality || prof.localityName || prof.locality || "",
          });
        } else if (prof && (prof.cityId || prof.city) && (prof.localityId || prof.locality || prof.address)) {
          setProviderLoc({
            fullAddress: `${prof.localityName || prof.locality || ""}, ${prof.cityName || prof.city || ""}, ${prof.stateName || prof.state || ""}`,
            country: "India",
            state: prof.stateName || prof.state || "",
            city: prof.cityName || prof.city || "",
            locality: prof.localityName || prof.locality || "",
            pincode: prof.pincode || "",
            latitude: 26.4499,
            longitude: 80.3319,
            stateId: prof.stateId || "",
            stateName: prof.stateName || prof.state || "",
            cityId: prof.cityId || "",
            cityName: prof.cityName || prof.city || "",
            localityId: prof.localityId || "",
            localityName: prof.localityName || prof.locality || "",
          });
        }

        const customerLoc = userProf?.customerLocation || userProf?.location;
        if (userProf && isValidLocation(customerLoc)) {
          setCustLocData({
            fullAddress: customerLoc?.address || `${customerLoc?.locality || ""}, ${customerLoc?.city || ""}`,
            country: customerLoc?.country || "India",
            state: customerLoc?.state || customerLoc?.stateName || userProf.stateName || userProf.state || "",
            city: customerLoc?.city || customerLoc?.cityName || userProf.cityName || userProf.city || "",
            locality: customerLoc?.locality || customerLoc?.localityName || userProf.localityName || "",
            pincode: customerLoc?.pincode || userProf.pincode || "",
            latitude: Number(customerLoc?.latitude) || 26.4499,
            longitude: Number(customerLoc?.longitude) || 80.3319,
            stateId: customerLoc?.stateId || userProf.stateId || "",
            stateName: customerLoc?.stateName || customerLoc?.state || userProf.stateName || userProf.state || "",
            cityId: customerLoc?.cityId || userProf.cityId || "",
            cityName: customerLoc?.cityName || customerLoc?.city || userProf.cityName || userProf.city || "",
            localityId: customerLoc?.localityId || userProf.localityId || "",
            localityName: customerLoc?.localityName || customerLoc?.locality || userProf.localityName || "",
          });
        }
      } catch (e) {
        console.warn("Could not load provider/user location:", e);
      }
    }
    loadLocations();
  }, [user]);

  const handleUseCustomerLocation = () => {
    if (custLocData) {
      setProviderLoc(custLocData);
      setSuccessMessage("Customer location copied! Click 'Save Operating Location Setup' below to save.");
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!user) return;

    if (!providerLoc) {
      setErrorMessage("Please search and select your operating location.");
      return;
    }

    try {
      setSavingLocation(true);

      const locObj = {
        country: providerLoc.country,
        state: providerLoc.state,
        city: providerLoc.city,
        locality: providerLoc.locality,
        address: providerLoc.fullAddress,
        pincode: providerLoc.pincode,
        latitude: providerLoc.latitude,
        longitude: providerLoc.longitude,
        placeId: providerLoc.placeId,
        stateId: providerLoc.stateId,
        stateName: providerLoc.stateName,
        cityId: providerLoc.cityId,
        cityName: providerLoc.cityName,
        localityId: providerLoc.localityId,
        localityName: providerLoc.localityName,
      };

      const locPayload = {
        city: providerLoc.city,
        state: providerLoc.state,
        pincode: providerLoc.pincode,
        stateId: providerLoc.stateId,
        stateName: providerLoc.stateName,
        cityId: providerLoc.cityId,
        cityName: providerLoc.cityName,
        localityId: providerLoc.localityId,
        localityName: providerLoc.localityName,
        providerLocation: locObj,
        location: locObj,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "providers", user.uid), locPayload, { merge: true });
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            city: providerLoc.city,
            state: providerLoc.state,
            pincode: providerLoc.pincode,
            stateId: providerLoc.stateId,
            stateName: providerLoc.stateName,
            cityId: providerLoc.cityId,
            cityName: providerLoc.cityName,
            localityId: providerLoc.localityId,
            localityName: providerLoc.localityName,
            customerLocation: locObj,
            location: locObj,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Could not sync location to users document:", e);
      }

      setSuccessMessage("Operating service location updated successfully! Admin services matching your location will be available for enrollment.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update provider location.");
    } finally {
      setSavingLocation(false);
    }
  };

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

      {/* Service Location Setup Section */}
      <form onSubmit={handleSaveLocation} className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-6">
        <div className="pb-3 border-b border-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-500" /> Service Operating Location Setup
            </h3>
            <p className="text-xs text-purple-900/60 mt-0.5">
              Search & select your operating location using OpenStreetMap. You will discover and enroll in master services created by Admin for this location.
            </p>
          </div>
          {custLocData && (
            <button
              type="button"
              onClick={handleUseCustomerLocation}
              className="px-4 py-2 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-purple-950 text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Copy className="w-3.5 h-3.5 text-pink-500" />
              <span>Use my customer location</span>
            </button>
          )}
        </div>

        <LocationSearchSelector
          value={providerLoc || undefined}
          onChange={(val) => setProviderLoc(val)}
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingLocation || !providerLoc}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {savingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Operating Location Setup
          </button>
        </div>
      </form>

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
