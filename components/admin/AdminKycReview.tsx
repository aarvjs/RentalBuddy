"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Lock,
  User,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { ProviderKyc } from "@/types/service-provider";

interface AdminKycReviewProps {
  kyc: ProviderKyc;
  onReview: (uid: string, decision: "approved" | "rejected", reason?: string) => Promise<void>;
}

export function AdminKycReview({ kyc, onReview }: AdminKycReviewProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleApprove = async () => {
    setErrorMsg("");
    try {
      setLoading(true);
      await onReview(kyc.uid, "approved");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to approve KYC.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setErrorMsg("Please provide a rejection reason for the provider.");
      return;
    }
    setErrorMsg("");
    try {
      setLoading(true);
      await onReview(kyc.uid, "rejected", rejectionReason.trim());
      setRejecting(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to reject KYC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
            {kyc.profilePhoto ? (
              <img src={kyc.profilePhoto} alt={kyc.fullName} className="w-full h-full object-cover" />
            ) : (
              kyc.fullName?.charAt(0)?.toUpperCase() || "P"
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-purple-950">{kyc.fullName}</h3>
              <span
                className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                  kyc.status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : kyc.status === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {kyc.status}
              </span>
            </div>
            <p className="text-xs text-purple-900/60 font-semibold mt-0.5">
              Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {kyc.status === "pending" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRejecting(true)}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" /> Reject KYC
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-5 py-2 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve KYC
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
          <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Mobile Number</span>
          <span className="font-extrabold text-purple-950 text-sm mt-0.5 block">{kyc.mobileNumber}</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
          <span className="text-[10px] uppercase font-bold text-purple-900/50 block flex items-center justify-between">
            <span>Aadhaar Number</span>
            <Lock className="w-3 h-3 text-purple-500" />
          </span>
          <span className="font-mono font-extrabold text-purple-950 text-sm mt-0.5 block tracking-wider">
            {kyc.aadhaarNumber}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
          <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Address & City</span>
          <span className="font-bold text-purple-950 mt-0.5 block">
            {kyc.address}, {kyc.city}, {kyc.state} - {kyc.pincode}
          </span>
        </div>
      </div>

      {/* Aadhaar Documents Display */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" /> Uploaded Aadhaar Documents
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20">
            <span className="text-xs font-bold text-purple-950 mb-2 block">Aadhaar Front Side</span>
            <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-purple-100">
              {kyc.aadhaarFrontUrl ? (
                <a href={kyc.aadhaarFrontUrl} target="_blank" rel="noreferrer" className="w-full h-full block">
                  <img src={kyc.aadhaarFrontUrl} alt="Aadhaar Front" className="w-full h-full object-contain" />
                </a>
              ) : (
                <span className="text-xs text-purple-900/40">No Image</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20">
            <span className="text-xs font-bold text-purple-950 mb-2 block">Aadhaar Back Side</span>
            <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-purple-100">
              {kyc.aadhaarBackUrl ? (
                <a href={kyc.aadhaarBackUrl} target="_blank" rel="noreferrer" className="w-full h-full block">
                  <img src={kyc.aadhaarBackUrl} alt="Aadhaar Back" className="w-full h-full object-contain" />
                </a>
              ) : (
                <span className="text-xs text-purple-900/40">No Image</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal Form */}
      {rejecting && (
        <form onSubmit={handleConfirmReject} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 mt-4">
          <h5 className="text-xs font-extrabold text-rose-950">Specify Rejection Reason</h5>
          <textarea
            rows={3}
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Aadhaar card image is blurry / details do not match profile..."
            className="w-full p-3 rounded-xl bg-white border border-rose-200 text-purple-950 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="px-4 py-2 rounded-full bg-white border border-rose-200 text-xs font-bold text-rose-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-extrabold shadow-md hover:bg-rose-700"
            >
              {loading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
