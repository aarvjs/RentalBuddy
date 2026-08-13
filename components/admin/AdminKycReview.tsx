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
  RefreshCw,
  X,
  Maximize2,
  Calendar,
} from "lucide-react";
import { ProviderKyc } from "@/types/service-provider";

interface AdminKycReviewProps {
  kyc: ProviderKyc;
  onReview: (
    uid: string,
    decision: "approved" | "rejected" | "resubmission_required",
    reason?: string
  ) => Promise<void>;
}

export function AdminKycReview({ kyc, onReview }: AdminKycReviewProps) {
  const [rejecting, setRejecting] = useState(false);
  const [requestingResubmission, setRequestingResubmission] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Lightbox Modal Image Preview State
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

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
    if (!reasonInput.trim()) {
      setErrorMsg("Please specify the reason for rejection.");
      return;
    }
    setErrorMsg("");
    try {
      setLoading(true);
      await onReview(kyc.uid, "rejected", reasonInput.trim());
      setRejecting(false);
      setReasonInput("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to reject KYC.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonInput.trim()) {
      setErrorMsg("Please specify what needs correction for resubmission.");
      return;
    }
    setErrorMsg("");
    try {
      setLoading(true);
      await onReview(kyc.uid, "resubmission_required", reasonInput.trim());
      setRequestingResubmission(false);
      setReasonInput("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to request KYC resubmission.");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = kyc.phoneVerified ?? true;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100 shadow-xl space-y-6">
      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl p-4 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-slate-700">
              <h4 className="text-sm font-extrabold text-white">{previewImage.title}</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full flex-1 min-h-[300px] flex items-center justify-center p-2 overflow-auto">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-4">
          <div
            onClick={() =>
              kyc.profilePhoto || kyc.profilePhotoUrl
                ? setPreviewImage({ url: kyc.profilePhotoUrl || kyc.profilePhoto, title: `${kyc.fullName} - Profile Photo` })
                : null
            }
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {kyc.profilePhoto || kyc.profilePhotoUrl ? (
              <img
                src={kyc.profilePhotoUrl || kyc.profilePhoto}
                alt={kyc.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              kyc.fullName?.charAt(0)?.toUpperCase() || "P"
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-extrabold text-purple-950">{kyc.fullName}</h3>
              <span
                className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                  kyc.status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : kyc.status === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : kyc.status === "resubmission_required"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {kyc.status}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  isVerified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {isVerified ? "Phone Verified" : "Phone Unverified"}
              </span>
            </div>
            <p className="text-xs text-purple-900/60 font-semibold mt-1">
              Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setRequestingResubmission(true);
              setRejecting(false);
              setReasonInput(kyc.resubmissionReason || "");
            }}
            disabled={loading}
            className="px-3.5 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs hover:bg-amber-100 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Request Resubmission
          </button>

          <button
            onClick={() => {
              setRejecting(true);
              setRequestingResubmission(false);
              setReasonInput(kyc.rejectionReason || "");
            }}
            disabled={loading}
            className="px-3.5 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>

          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve KYC
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
          <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Mobile Number</span>
          <span className="font-extrabold text-purple-950 text-sm mt-0.5 block flex items-center gap-1.5">
            {kyc.mobileNumber || kyc.phoneNumber}
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </span>
        </div>

        {kyc.dob && (
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
            <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Date of Birth</span>
            <span className="font-extrabold text-purple-950 text-sm mt-0.5 block">{kyc.dob}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
          <span className="text-[10px] uppercase font-bold text-purple-900/50 block flex items-center justify-between">
            <span>Aadhaar Number</span>
            <Lock className="w-3 h-3 text-purple-500" />
          </span>
          <span className="font-mono font-extrabold text-purple-950 text-sm mt-0.5 block tracking-wider">
            {kyc.aadhaarNumber}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 sm:col-span-2">
          <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Address & Location</span>
          <span className="font-bold text-purple-950 mt-0.5 block">
            {kyc.address}, {kyc.city}, {kyc.state} - {kyc.pincode}
          </span>
        </div>
      </div>

      {/* Uploaded Documents Lightbox Cards */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" /> Verification Documents (Click to Inspect / Zoom)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Profile Photo */}
          <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20 flex flex-col justify-between">
            <span className="text-xs font-bold text-purple-950 mb-2 block">Profile Photo</span>
            <div
              onClick={() =>
                (kyc.profilePhotoUrl || kyc.profilePhoto) &&
                setPreviewImage({
                  url: kyc.profilePhotoUrl || kyc.profilePhoto,
                  title: `${kyc.fullName} - Profile Photo`,
                })
              }
              className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-purple-100 cursor-pointer relative group"
            >
              {kyc.profilePhoto || kyc.profilePhotoUrl ? (
                <>
                  <img
                    src={kyc.profilePhotoUrl || kyc.profilePhoto}
                    alt="Profile Photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                    <Maximize2 className="w-4 h-4" /> Inspect Image
                  </div>
                </>
              ) : (
                <span className="text-xs text-purple-900/40">No Image</span>
              )}
            </div>
          </div>

          {/* Aadhaar Front */}
          <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20 flex flex-col justify-between">
            <span className="text-xs font-bold text-purple-950 mb-2 block">Aadhaar Front Side</span>
            <div
              onClick={() =>
                kyc.aadhaarFrontUrl &&
                setPreviewImage({ url: kyc.aadhaarFrontUrl, title: `${kyc.fullName} - Aadhaar Front` })
              }
              className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-purple-100 cursor-pointer relative group"
            >
              {kyc.aadhaarFrontUrl ? (
                <>
                  <img
                    src={kyc.aadhaarFrontUrl}
                    alt="Aadhaar Front"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                    <Maximize2 className="w-4 h-4" /> Inspect Image
                  </div>
                </>
              ) : (
                <span className="text-xs text-purple-900/40">No Image</span>
              )}
            </div>
          </div>

          {/* Aadhaar Back */}
          <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20 flex flex-col justify-between">
            <span className="text-xs font-bold text-purple-950 mb-2 block">Aadhaar Back Side</span>
            <div
              onClick={() =>
                kyc.aadhaarBackUrl &&
                setPreviewImage({ url: kyc.aadhaarBackUrl, title: `${kyc.fullName} - Aadhaar Back` })
              }
              className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-purple-100 cursor-pointer relative group"
            >
              {kyc.aadhaarBackUrl ? (
                <>
                  <img
                    src={kyc.aadhaarBackUrl}
                    alt="Aadhaar Back"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                    <Maximize2 className="w-4 h-4" /> Inspect Image
                  </div>
                </>
              ) : (
                <span className="text-xs text-purple-900/40">No Image</span>
              )}
            </div>
          </div>

          {/* Address Proof */}
          <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20 flex flex-col justify-between">
            <span className="text-xs font-bold text-purple-950 mb-2 block">Address Proof</span>
            <div
              onClick={() =>
                kyc.addressProofUrl &&
                setPreviewImage({ url: kyc.addressProofUrl, title: `${kyc.fullName} - Address Proof` })
              }
              className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-purple-100 cursor-pointer relative group"
            >
              {kyc.addressProofUrl ? (
                <>
                  <img
                    src={kyc.addressProofUrl}
                    alt="Address Proof"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                    <Maximize2 className="w-4 h-4" /> Inspect Image
                  </div>
                </>
              ) : (
                <span className="text-xs text-purple-900/40">Not Uploaded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal Form */}
      {rejecting && (
        <form onSubmit={handleConfirmReject} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 mt-4">
          <h5 className="text-xs font-extrabold text-rose-950">Specify KYC Rejection Reason</h5>
          <textarea
            rows={3}
            required
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="e.g. Aadhaar card image is unreadable or identity mismatch..."
            className="w-full p-3 rounded-xl bg-white border border-rose-200 text-purple-950 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="px-4 py-2 rounded-full bg-white border border-rose-200 text-xs font-bold text-rose-900 hover:bg-rose-100"
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

      {/* Request Resubmission Modal Form */}
      {requestingResubmission && (
        <form onSubmit={handleConfirmResubmission} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 mt-4">
          <h5 className="text-xs font-extrabold text-amber-950">Specify What Needs Correction (Resubmission)</h5>
          <textarea
            rows={3}
            required
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="e.g. Aadhaar back side image is unclear. Please upload a clearer photo."
            className="w-full p-3 rounded-xl bg-white border border-amber-200 text-purple-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRequestingResubmission(false)}
              className="px-4 py-2 rounded-full bg-white border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-amber-600 text-white text-xs font-extrabold shadow-md hover:bg-amber-700"
            >
              {loading ? "Requesting..." : "Send Resubmission Request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
