"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { getProviderProfile } from "@/lib/service-provider/provider-auth";
import {
  getMasterServices,
  getProviderAvailabilityMap,
  updateProviderAvailability,
  MasterServiceItem,
} from "@/lib/service-provider/provider-services";
import { ProviderProfile } from "@/types/service-provider";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { Briefcase, ShieldAlert, Loader2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";

export default function ServiceProviderServicesPage() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [masterServices, setMasterServices] = useState<MasterServiceItem[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const [profData, servicesList, availMap] = await Promise.all([
          getProviderProfile(user.uid),
          getMasterServices(),
          getProviderAvailabilityMap(user.uid),
        ]);

        setProfile(profData);
        setMasterServices(servicesList);
        setAvailabilityMap(availMap);
      } catch (err) {
        console.error("Error loading services page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleAvailability = async (serviceId: string, currentAvailable: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    const nextAvailable = !currentAvailable;

    // Set updating state for this specific service ID
    setUpdatingMap((prev) => ({ ...prev, [serviceId]: true }));
    setFeedback(null);

    try {
      await updateProviderAvailability(user.uid, serviceId, nextAvailable);

      // Optimistically update local state
      setAvailabilityMap((prev) => ({
        ...prev,
        [serviceId]: nextAvailable,
      }));

      setFeedback({
        type: "success",
        text: `Availability updated! You are now ${nextAvailable ? "AVAILABLE" : "UNAVAILABLE"} for this service.`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  const isKycApproved = profile?.kycStatus === "approved";
  const activeCount = Object.values(availabilityMap).filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Service Availability
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            MY SERVICES
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-1 max-w-2xl">
            Select which Admin-created master services you are currently available to provide to customers on RentasBuddy.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200/80 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold flex items-center justify-center shadow-sm">
            {activeCount}
          </div>
          <div>
            <span className="text-xs font-extrabold text-purple-950 block">Active Availability</span>
            <span className="text-[11px] text-pink-600 font-bold">
              {activeCount} of {masterServices.length} Services ON
            </span>
          </div>
        </div>
      </div>

      {/* KYC Warning notice if applicable */}
      {!isKycApproved && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm">KYC Verification Pending</h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                You can configure your service availability preferences below. Once your KYC is approved, your available services will be published to customers.
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

      {/* Master Services Grid */}
      {masterServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterServices.map((service) => {
            const isAvailable = availabilityMap[service.id] === true;
            const isUpdating = updatingMap[service.id] === true;

            return (
              <div
                key={service.id}
                className={`p-6 rounded-3xl bg-white/90 backdrop-blur-xl border transition-all shadow-md flex flex-col justify-between ${
                  isAvailable
                    ? "border-pink-300 ring-2 ring-pink-400/20"
                    : "border-pink-100 opacity-90"
                }`}
              >
                <div className="space-y-4">
                  {/* Service Image / Header */}
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
                      <h3 className="text-lg font-extrabold text-purple-950">
                        {service.serviceName}
                      </h3>
                      {service.price ? (
                        <span className="text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200/60">
                          ${service.price} / {service.priceType || "hr"}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-purple-900/70 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Availability Toggle Control */}
                <div className="mt-6 pt-4 border-t border-pink-100 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wider">
                      Available to provide this service
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        isAvailable ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {isAvailable ? "Status: ON (Available)" : "Status: OFF (Unavailable)"}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggleAvailability(service.id, isAvailable)}
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
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No Master Services Available"
          description="Master services configured by Admin will appear here for availability selection."
        />
      )}
    </div>
  );
}
