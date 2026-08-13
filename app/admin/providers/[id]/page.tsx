"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getProviderDetails,
  updateProviderStatus,
} from "@/lib/admin/admin-providers";
import { getProviderKyc } from "@/lib/service-provider/provider-kyc";
import { getProviderServices } from "@/lib/service-provider/provider-services";
import { getProviderBookings } from "@/lib/service-provider/provider-bookings";
import { getProviderEarningsSummary } from "@/lib/service-provider/provider-earnings";
import { AdminProviderListItem } from "@/types/admin";
import { ProviderKyc, ProviderService, ProviderBooking, EarningsSummary, ProviderAccountStatus } from "@/types/service-provider";
import { AdminKycReview } from "@/components/admin/AdminKycReview";
import { reviewProviderKyc } from "@/lib/admin/admin-kyc";
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Briefcase,
  Calendar,
  IndianRupee,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function AdminProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: providerId } = use(params);
  const router = useRouter();

  const [provider, setProvider] = useState<AdminProviderListItem | null>(null);
  const [kyc, setKyc] = useState<ProviderKyc | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [pData, kData, sData, bData, eData] = await Promise.all([
          getProviderDetails(providerId),
          getProviderKyc(providerId),
          getProviderServices(providerId),
          getProviderBookings(providerId),
          getProviderEarningsSummary(providerId),
        ]);

        setProvider(pData);
        setKyc(kData);
        setServices(sData);
        setBookings(bData);
        setEarnings(eData);
      } catch (err) {
        console.error("Failed to load provider details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [providerId]);

  const handleUpdateStatus = async (status: ProviderAccountStatus) => {
    try {
      setStatusUpdating(true);
      await updateProviderStatus(providerId, status);
      setProvider((prev) => (prev ? { ...prev, providerStatus: status } : null));
    } catch (err) {
      console.error("Failed to update provider status:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleKycReview = async (
    uid: string,
    decision: "approved" | "rejected" | "resubmission_required",
    reason?: string
  ) => {
    await reviewProviderKyc(uid, decision, reason);
    setKyc((prev) =>
      prev
        ? {
            ...prev,
            status: decision,
            rejectionReason: decision === "rejected" ? reason : prev.rejectionReason,
            resubmissionReason: decision === "resubmission_required" ? reason : prev.resubmissionReason,
          }
        : null
    );
    setProvider((prev) =>
      prev
        ? {
            ...prev,
            kycStatus: decision,
            providerStatus: decision === "approved" ? "active" : "pending",
          }
        : null
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-purple-950">Provider Record Not Found</h2>
        <Link href="/admin/providers" className="text-xs font-bold text-pink-600 hover:underline">
          Return to Service Providers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/providers"
          className="w-10 h-10 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-purple-950 hover:bg-purple-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            Provider Details
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-0.5">
            Full administrative overview for {provider.fullName}.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg overflow-hidden shrink-0 border-2 border-white">
            {provider.photoURL ? (
              <img src={provider.photoURL} alt={provider.fullName} className="w-full h-full object-cover" />
            ) : (
              provider.fullName?.charAt(0)?.toUpperCase() || "P"
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-purple-950">{provider.fullName}</h3>
            <p className="text-xs font-semibold text-purple-600">{provider.email}</p>
            <div className="flex items-center gap-3 text-xs text-purple-900/70 pt-1 font-medium">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-purple-500" /> {provider.mobileNumber}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-pink-500" /> {provider.city}, {provider.state}</span>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-900/70">Account Status:</span>
            <select
              value={provider.providerStatus}
              onChange={(e) => handleUpdateStatus(e.target.value as ProviderAccountStatus)}
              disabled={statusUpdating}
              className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-extrabold focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="text-xs text-purple-900/60 font-semibold">
            KYC Status: <span className="font-extrabold text-purple-950 uppercase">{provider.kycStatus}</span>
          </div>
        </div>
      </div>

      {/* KYC Review Component */}
      {kyc ? (
        <AdminKycReview kyc={kyc} onReview={handleKycReview} />
      ) : (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm">KYC Not Yet Submitted</h4>
            <p className="text-xs text-amber-800/80 mt-0.5">
              This provider has not submitted identity verification documents.
            </p>
          </div>
        </div>
      )}

      {/* Performance & Earnings Overview */}
      {earnings && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-3xl bg-white/90 border border-purple-100 shadow-md">
            <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Total Earnings</span>
            <span className="text-2xl font-extrabold text-purple-950 mt-1 block">₹{earnings.totalEarnings.toLocaleString("en-IN")}</span>
          </div>
          <div className="p-5 rounded-3xl bg-white/90 border border-purple-100 shadow-md">
            <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Published Services</span>
            <span className="text-2xl font-extrabold text-purple-950 mt-1 block">{services.length}</span>
          </div>
          <div className="p-5 rounded-3xl bg-white/90 border border-purple-100 shadow-md">
            <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Total Bookings</span>
            <span className="text-2xl font-extrabold text-purple-950 mt-1 block">{bookings.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
