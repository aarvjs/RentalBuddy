import React from "react";
import { ShieldCheck, Clock, AlertTriangle, FileCheck, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ProviderKycStatus } from "@/types/service-provider";

interface KycStatusCardProps {
  status: ProviderKycStatus;
  rejectionReason?: string;
  resubmissionReason?: string;
  showAction?: boolean;
}

export function KycStatusCard({
  status,
  rejectionReason,
  resubmissionReason,
  showAction = true,
}: KycStatusCardProps) {
  if (status === "approved") {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 shadow-md shadow-emerald-500/5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-emerald-950">✓ KYC Verified</h4>
            <p className="text-xs text-emerald-800/80 mt-1 max-w-lg">
              Your identity verification is complete. You can create and publish your services for customers across RentasBuddy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-white border border-amber-200/80 shadow-md shadow-amber-500/5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: "6s" }} />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-amber-950">Status: Under Review</h4>
            <p className="text-xs text-amber-800/80 mt-1 max-w-lg">
              Admin is reviewing your verification documents. Service creation will be enabled upon approval.
            </p>
          </div>
        </div>
        {showAction && (
          <Link
            href="/service-provider/kyc"
            className="px-5 py-2 rounded-full bg-white border border-amber-300 text-amber-900 font-bold text-xs shadow-sm hover:bg-amber-100/50 transition-colors shrink-0 text-center"
          >
            View Submitted KYC
          </Link>
        )}
      </div>
    );
  }

  if (status === "resubmission_required") {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-white border border-amber-300 shadow-md mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-amber-950">Documents Need Attention</h4>
            <p className="text-xs font-semibold text-amber-900 mt-1 max-w-lg">
              Reason: <span className="font-normal italic">{resubmissionReason || rejectionReason || "Admin requested corrections for your KYC documents."}</span>
            </p>
          </div>
        </div>
        {showAction && (
          <Link
            href="/service-provider/kyc"
            className="px-5 py-2 rounded-full bg-amber-600 text-white font-bold text-xs shadow-md hover:bg-amber-700 transition-colors shrink-0 flex items-center gap-1.5 justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Resubmit Documents
          </Link>
        )}
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-white border border-rose-200/80 shadow-md shadow-rose-500/5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-rose-950">KYC Rejected</h4>
            <p className="text-xs text-rose-800/80 mt-1 max-w-lg">
              Reason: <span className="font-semibold">{rejectionReason || "Your previous KYC submission was not approved. Please re-submit your details and document photos."}</span>
            </p>
          </div>
        </div>
        {showAction && (
          <Link
            href="/service-provider/kyc"
            className="px-5 py-2 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:bg-rose-700 transition-colors shrink-0 flex items-center gap-1.5 justify-center"
          >
            Resubmit Documents <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50 to-white border border-pink-200/80 shadow-md shadow-pink-500/5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
          <FileCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-base text-purple-950">KYC Verification Required</h4>
          <p className="text-xs text-purple-900/70 mt-1 max-w-lg">
            Complete identity verification (Mobile Verification, Aadhaar & Profile Photo) to start offering services and receive customer bookings.
          </p>
        </div>
      </div>
      {showAction && (
        <Link
          href="/service-provider/kyc"
          className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all shrink-0 flex items-center gap-1.5 justify-center"
        >
          Complete KYC <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
