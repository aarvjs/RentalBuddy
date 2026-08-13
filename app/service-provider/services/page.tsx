"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getProviderProfile } from "@/lib/service-provider/provider-auth";
import {
  getMasterServices,
  getProviderAvailabilityConfigs,
  updateProviderAvailabilityConfig,
  MasterServiceItem,
} from "@/lib/service-provider/provider-services";
import { ProviderProfile, ProviderAvailabilityConfig } from "@/types/service-provider";
import { EmptyState } from "@/components/service-provider/EmptyState";
import {
  Briefcase,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Clock,
  Phone,
  Lock,
  Save,
  MapPin,
  PlusCircle,
} from "lucide-react";

export default function ServiceProviderServicesPage() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [masterServices, setMasterServices] = useState<MasterServiceItem[]>([]);
  const [configsMap, setConfigsMap] = useState<Record<string, ProviderAvailabilityConfig>>({});
  const [loading, setLoading] = useState(true);
  const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for configuration details
  const [timeFromMap, setTimeFromMap] = useState<Record<string, string>>({});
  const [timeToMap, setTimeToMap] = useState<Record<string, string>>({});
  const [contactMap, setContactMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const [profData, servicesList, availConfigs] = await Promise.all([
          getProviderProfile(user.uid),
          getMasterServices(),
          getProviderAvailabilityConfigs(user.uid),
        ]);

        setProfile(profData);
        setMasterServices(servicesList);
        setConfigsMap(availConfigs);

        // Pre-fill form inputs
        const initialFrom: Record<string, string> = {};
        const initialTo: Record<string, string> = {};
        const initialContact: Record<string, string> = {};

        Object.keys(availConfigs).forEach((serviceId) => {
          const cfg = availConfigs[serviceId];
          initialFrom[serviceId] = cfg.availableFrom || "";
          initialTo[serviceId] = cfg.availableTo || "";
          initialContact[serviceId] = cfg.contactNumber || profData?.mobileNumber || "";
        });

        setTimeFromMap(initialFrom);
        setTimeToMap(initialTo);
        setContactMap(initialContact);
      } catch (err) {
        console.error("Error loading services page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleEnrollService = async (service: MasterServiceItem) => {
    const user = auth.currentUser;
    if (!user) return;

    const serviceId = service.id;
    setUpdatingMap((prev) => ({ ...prev, [serviceId]: true }));
    setFeedback(null);

    try {
      const contactNum = profile?.mobileNumber || "";

      await updateProviderAvailabilityConfig(user.uid, serviceId, {
        isAvailable: false,
        availableFrom: "",
        availableTo: "",
        contactNumber: contactNum,
        serviceName: service.serviceName,
        stateId: service.stateId || profile?.stateId || "up",
        stateName: service.stateName || profile?.stateName || "Uttar Pradesh",
        cityId: service.cityId || profile?.cityId || "kanpur",
        cityName: service.cityName || profile?.cityName || "Kanpur",
        localityId: service.localityId || profile?.localityId || "panki",
        localityName: service.localityName || profile?.localityName || "Panki",
      });

      setConfigsMap((prev) => ({
        ...prev,
        [serviceId]: {
          providerId: user.uid,
          serviceId,
          serviceName: service.serviceName,
          available: false,
          isAvailable: false,
          availableFrom: "",
          availableTo: "",
          contactNumber: contactNum,
        },
      }));

      setFeedback({
        type: "success",
        text: `Enrolled in ${service.serviceName}! You can now turn your availability ON/OFF and configure your preferences below.`,
      });
    } catch (err: any) {
      console.error("Failed to enroll in service:", err);
      setFeedback({
        type: "error",
        text: err?.message || "Failed to enroll in service in Firestore.",
      });
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleToggleAvailability = async (service: MasterServiceItem, currentAvailable: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    const nextAvailable = !currentAvailable;
    const serviceId = service.id;

    setUpdatingMap((prev) => ({ ...prev, [serviceId]: true }));
    setFeedback(null);

    try {
      const fromTime = timeFromMap[serviceId] || "";
      const toTime = timeToMap[serviceId] || "";
      const contactNum = contactMap[serviceId] || profile?.mobileNumber || "";

      await updateProviderAvailabilityConfig(user.uid, serviceId, {
        isAvailable: nextAvailable,
        availableFrom: fromTime,
        availableTo: toTime,
        contactNumber: contactNum,
        serviceName: service.serviceName,
        stateId: service.stateId || profile?.stateId || "up",
        stateName: service.stateName || profile?.stateName || "Uttar Pradesh",
        cityId: service.cityId || profile?.cityId || "kanpur",
        cityName: service.cityName || profile?.cityName || "Kanpur",
        localityId: service.localityId || profile?.localityId || "panki",
        localityName: service.localityName || profile?.localityName || "Panki",
      });

      setConfigsMap((prev) => ({
        ...prev,
        [serviceId]: {
          providerId: user.uid,
          serviceId,
          serviceName: service.serviceName,
          available: nextAvailable,
          isAvailable: nextAvailable,
          availableFrom: fromTime,
          availableTo: toTime,
          contactNumber: contactNum,
        },
      }));

      setFeedback({
        type: "success",
        text: `Availability updated for ${service.serviceName}! Status: ${
          nextAvailable ? "AVAILABLE ✓" : "UNAVAILABLE (OFF)"
        }`,
      });
    } catch (err: any) {
      console.error("Failed to update service availability:", err);
      setFeedback({
        type: "error",
        text: err?.message || "Failed to update service availability in Firestore.",
      });
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleSaveDetails = async (service: MasterServiceItem) => {
    const user = auth.currentUser;
    if (!user) return;

    const serviceId = service.id;
    const isAvailable = configsMap[serviceId]?.isAvailable ?? false;

    setUpdatingMap((prev) => ({ ...prev, [serviceId]: true }));
    setFeedback(null);

    try {
      const fromTime = timeFromMap[serviceId] || "";
      const toTime = timeToMap[serviceId] || "";
      const contactNum = contactMap[serviceId] || profile?.mobileNumber || "";

      await updateProviderAvailabilityConfig(user.uid, serviceId, {
        isAvailable,
        availableFrom: fromTime,
        availableTo: toTime,
        contactNumber: contactNum,
        serviceName: service.serviceName,
        stateId: service.stateId || profile?.stateId || "up",
        stateName: service.stateName || profile?.stateName || "Uttar Pradesh",
        cityId: service.cityId || profile?.cityId || "kanpur",
        cityName: service.cityName || profile?.cityName || "Kanpur",
        localityId: service.localityId || profile?.localityId || "panki",
        localityName: service.localityName || profile?.localityName || "Panki",
      });

      setConfigsMap((prev) => ({
        ...prev,
        [serviceId]: {
          providerId: user.uid,
          serviceId,
          serviceName: service.serviceName,
          available: isAvailable,
          isAvailable,
          availableFrom: fromTime,
          availableTo: toTime,
          contactNumber: contactNum,
        },
      }));

      setFeedback({
        type: "success",
        text: `Availability details saved for ${service.serviceName}!`,
      });
    } catch (err: any) {
      console.error("Failed to save availability details:", err);
      setFeedback({
        type: "error",
        text: err?.message || "Failed to save details in Firestore.",
      });
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  const cleanLoc = (str?: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const provCity = cleanLoc(profile?.cityId || profile?.cityName || profile?.city);
  const provLoc = cleanLoc(profile?.localityId || profile?.localityName || profile?.locality);
  const hasSavedLocation = Boolean(provCity && provLoc);

  const isKycApproved = profile?.kycStatus === "approved";
  const activeCount = Object.values(configsMap).filter((cfg) => cfg.isAvailable).length;

  const locationMatchingServices = masterServices.filter((s) => {
    const servCity = cleanLoc(s.cityId || s.cityName || s.city || s.location?.city);
    const servLoc = cleanLoc(s.localityId || s.localityName || s.locality || s.location?.locality);

    if (servCity && provCity && servCity !== provCity) return false;
    if (servLoc && provLoc && servLoc !== provLoc) return false;
    if (servCity && provCity && servCity === provCity) return true;
    return false;
  });

  const availableToEnrollServices = locationMatchingServices.filter((s) => !configsMap[s.id]);
  const enrolledServices = locationMatchingServices.filter((s) => Boolean(configsMap[s.id]));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Service Enrollment & Availability
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            SERVICE ENROLLMENT & AVAILABILITY
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-1 max-w-2xl">
            Enroll in Admin services created for your operating location, turn availability ON/OFF, and configure optional time slots & private contact info.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200/80 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold flex items-center justify-center shadow-sm">
            {activeCount}
          </div>
          <div>
            <span className="text-xs font-extrabold text-purple-950 block">Active Availability</span>
            <span className="text-[11px] text-pink-600 font-bold">
              {activeCount} of {enrolledServices.length} Enrolled Services ON
            </span>
          </div>
        </div>
      </div>

      {/* Check Provider Location Onboarding State */}
      {!hasSavedLocation ? (
        <div className="p-10 rounded-3xl bg-white/90 border border-amber-200 shadow-md text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-purple-950">Set your service location</h3>
            <p className="text-xs text-purple-900/70 leading-relaxed">
              Choose your operating location to discover services available in your area before enrolling.
            </p>
          </div>
          <Link
            href="/service-provider/settings"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95"
          >
            <MapPin className="w-4 h-4" /> Set Location in Settings
          </Link>
        </div>
      ) : (
        <>
          {/* Operating Location Header Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/90 border border-pink-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                  <span>Operating Location:</span>
                  <span className="text-pink-600 font-extrabold">
                    {profile?.localityName || profile?.locality || profile?.cityName || profile?.city}, {profile?.cityName || profile?.city}
                  </span>
                </div>
                <p className="text-[11px] text-purple-900/60 font-medium">
                  {profile?.stateName || profile?.state || "India"} • Master services created by Admin for this location are listed below.
                </p>
              </div>
            </div>

            <Link
              href="/service-provider/settings"
              className="px-4 py-2 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-purple-950 text-xs font-extrabold transition-colors shadow-xs shrink-0"
            >
              Change Location
            </Link>
          </div>

          {/* KYC Warning notice if applicable */}
          {!isKycApproved && (
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm">KYC Verification Pending</h4>
                  <p className="text-xs text-amber-800/80 mt-0.5">
                    You can enroll in services and configure your availability preferences below. Once your KYC is approved by Admin, your services will be published to customers.
                  </p>
                </div>
              </div>
              <Link
                href="/service-provider/kyc"
                className="px-5 py-2.5 rounded-full bg-amber-600 text-white font-extrabold text-xs hover:bg-amber-700 transition-colors shrink-0"
              >
                Complete KYC
              </Link>
            </div>
          )}

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center gap-2.5 transition-all shadow-sm ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* SECTION 1: SERVICES AVAILABLE IN YOUR AREA (FOR ENROLLMENT) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-purple-950">
                  Services Available in Your Area
                </h3>
                <p className="text-xs text-purple-900/60">
                  Master services created by Admin for {profile?.localityName || profile?.cityName || "your area"}. Click Enroll to start offering them.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-extrabold">
                {availableToEnrollServices.length} Available
              </span>
            </div>

            {availableToEnrollServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableToEnrollServices.map((service) => {
                  const isUpdating = updatingMap[service.id] === true;

                  return (
                    <div
                      key={service.id}
                      className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md hover:border-pink-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-4">
                        {service.imageUrl && (
                          <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-purple-50">
                            <img
                              src={service.imageUrl}
                              alt={service.serviceName}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-purple-950 border border-pink-200 shadow-sm">
                              {service.category}
                            </span>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-base font-extrabold text-purple-950">
                              {service.serviceName}
                            </h4>
                            {service.price ? (
                              <span className="text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200/60">
                                ${service.price} / {service.priceType || "hr"}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-purple-900/70 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-pink-100">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleEnrollService(service)}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" /> Enrolling...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4 text-white" /> Enroll in Service
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white/80 border border-pink-100 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-extrabold text-purple-950">All Available Services Enrolled!</h4>
                <p className="text-xs text-purple-900/60">
                  You have enrolled in all master services available for your location. Check &apos;My Enrolled Services&apos; below.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 2: MY ENROLLED SERVICES (CONFIGURABLE) */}
          <div className="space-y-4 pt-6 border-t border-pink-200/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-purple-950">
                  My Enrolled Services
                </h3>
                <p className="text-xs text-purple-900/60">
                  Configure availability status (ON/OFF), optional time slots, and private contact numbers.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold">
                {enrolledServices.length} Enrolled
              </span>
            </div>

            {enrolledServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledServices.map((service) => {
                  const config = configsMap[service.id];
                  const isAvailable = config?.isAvailable === true;
                  const isUpdating = updatingMap[service.id] === true;

                  const fromVal = timeFromMap[service.id] ?? config?.availableFrom ?? "";
                  const toVal = timeToMap[service.id] ?? config?.availableTo ?? "";
                  const contactVal = contactMap[service.id] ?? config?.contactNumber ?? profile?.mobileNumber ?? "";

                  return (
                    <div
                      key={service.id}
                      className={`p-6 rounded-3xl bg-white/90 backdrop-blur-xl border transition-all shadow-md flex flex-col justify-between space-y-4 ${
                        isAvailable
                          ? "border-pink-300 ring-2 ring-pink-400/20"
                          : "border-pink-100 opacity-90"
                      }`}
                    >
                      <div className="space-y-4">
                        {service.imageUrl && (
                          <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-purple-50">
                            <img
                              src={service.imageUrl}
                              alt={service.serviceName}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-purple-950 border border-pink-200 shadow-sm">
                              {service.category}
                            </span>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-base font-extrabold text-purple-950">
                              {service.serviceName}
                            </h4>
                            {service.price ? (
                              <span className="text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200/60">
                                ${service.price} / {service.priceType || "hr"}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-purple-900/70 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {/* Availability Toggle Control */}
                      <div className="pt-4 border-t border-pink-100 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wider">
                              Availability Status
                            </span>
                            <span
                              className={`text-xs font-extrabold ${
                                isAvailable ? "text-emerald-600" : "text-slate-400"
                              }`}
                            >
                              {isAvailable ? "Available ✓" : "Unavailable (OFF)"}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleAvailability(service, isAvailable)}
                            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs transition-all shadow-sm shrink-0 ${
                              isAvailable
                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-500/20 hover:opacity-95"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin text-current" />
                            ) : isAvailable ? (
                              <>
                                <span>ON</span>
                                <ToggleRight className="w-5 h-5 text-white" />
                              </>
                            ) : (
                              <>
                                <span>OFF</span>
                                <ToggleLeft className="w-5 h-5 text-slate-400" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Config Details when ON */}
                        {isAvailable && (
                          <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3.5 animate-fadeIn">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-950 border-b border-pink-100 pb-2">
                              <Clock className="w-3.5 h-3.5 text-pink-500" /> Available Time & Contact Info
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="block text-[10px] font-bold text-purple-900/60 uppercase mb-1">
                                  From (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 06:00 PM"
                                  value={fromVal}
                                  onChange={(e) =>
                                    setTimeFromMap((prev) => ({ ...prev, [service.id]: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 text-purple-950 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-purple-900/60 uppercase mb-1">
                                  To (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 10:00 PM"
                                  value={toVal}
                                  onChange={(e) =>
                                    setTimeToMap((prev) => ({ ...prev, [service.id]: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 text-purple-950 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                                />
                              </div>
                            </div>

                            <div className="text-xs space-y-1">
                              <label className="block text-[10px] font-bold text-purple-900/60 uppercase flex items-center justify-between">
                                <span>Private Contact Number</span>
                                <span className="text-[9px] text-pink-600 font-semibold flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> Post-Purchase Only
                                </span>
                              </label>
                              <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={contactVal}
                                onChange={(e) =>
                                  setContactMap((prev) => ({ ...prev, [service.id]: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 text-purple-950 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                              />
                              <p className="text-[10px] text-purple-900/50 italic">
                                Shared ONLY with customer after successful booking purchase. Not shown publicly.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSaveDetails(service)}
                              disabled={isUpdating}
                              className="w-full py-2 rounded-xl bg-purple-950 text-white font-extrabold text-xs hover:bg-purple-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5" /> Save Details
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No Services Enrolled Yet"
                description="Click 'Enroll in Service' on any available service above to start offering it in your area."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
