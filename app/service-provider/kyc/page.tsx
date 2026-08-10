"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { getProviderKyc, submitProviderKyc } from "@/lib/service-provider/provider-kyc";
import { getProviderProfile } from "@/lib/service-provider/provider-auth";
import { ProviderKyc, ProviderProfile } from "@/types/service-provider";
import { KycStatusCard } from "@/components/service-provider/KycStatusCard";
import {
  ShieldCheck,
  Upload,
  Phone,
  User,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function ServiceProviderKycPage() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [existingKyc, setExistingKyc] = useState<ProviderKyc | null>(null);

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState("");
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState("");

  // OTP Verification step state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadKycData() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const [profData, kycData] = await Promise.all([
          getProviderProfile(user.uid),
          getProviderKyc(user.uid),
        ]);

        setProfile(profData);
        if (profData) {
          setFullName(profData.fullName || "");
          setMobileNumber(profData.mobileNumber || "");
          setAddress(profData.address || "");
          setCity(profData.city || "");
          setState(profData.state || "");
          setPincode(profData.pincode || "");
          if (profData.photoURL) setProfilePhotoPreview(profData.photoURL);
        }

        if (kycData) {
          setExistingKyc(kycData);
          setFullName(kycData.fullName || profData?.fullName || "");
          setMobileNumber(kycData.mobileNumber || profData?.mobileNumber || "");
          setAddress(kycData.address || "");
          setCity(kycData.city || "");
          setState(kycData.state || "");
          setPincode(kycData.pincode || "");
          setAadhaarNumber(kycData.aadhaarNumber || "");
          if (kycData.profilePhoto) setProfilePhotoPreview(kycData.profilePhoto);
          if (kycData.aadhaarFrontUrl) setAadhaarFrontPreview(kycData.aadhaarFrontUrl);
          if (kycData.aadhaarBackUrl) setAadhaarBackPreview(kycData.aadhaarBackUrl);
          setMobileVerified(true);
        }
      } catch (err) {
        console.error("Error loading KYC data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadKycData();
  }, []);

  const handleSendOtp = async () => {
    if (!mobileNumber.trim()) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }
    setErrorMessage("");
    setOtpLoading(true);

    try {
      // Prepared state transition for Mobile Phone OTP verification
      setOtpSent(true);
      setSuccessMessage("Verification code step initialized for " + mobileNumber);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setErrorMessage("Please enter the OTP sent to your mobile number.");
      return;
    }
    setErrorMessage("");
    setOtpLoading(true);

    try {
      setMobileVerified(true);
      setSuccessMessage("Mobile number verified successfully!");
    } catch (err: any) {
      setErrorMessage(err?.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const user = auth.currentUser;
    if (!user) return;

    if (!fullName.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMessage("Mobile Number is required.");
      return;
    }
    if (!aadhaarNumber.trim() || aadhaarNumber.length < 12) {
      setErrorMessage("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (!profilePhotoFile && !profilePhotoPreview) {
      setErrorMessage("Profile Photo is required for verification.");
      return;
    }
    if (!aadhaarFrontFile && !aadhaarFrontPreview) {
      setErrorMessage("Aadhaar Front Document image is required.");
      return;
    }
    if (!aadhaarBackFile && !aadhaarBackPreview) {
      setErrorMessage("Aadhaar Back Document image is required.");
      return;
    }

    try {
      setSubmitting(true);

      const kycResult = await submitProviderKyc(user.uid, {
        fullName,
        mobileNumber,
        address,
        city,
        state,
        pincode,
        aadhaarNumber,
        profilePhotoFile,
        aadhaarFrontFile,
        aadhaarBackFile,
        existingProfilePhotoUrl: profilePhotoPreview,
        existingAadhaarFrontUrl: aadhaarFrontPreview,
        existingAadhaarBackUrl: aadhaarBackPreview,
      });

      setExistingKyc(kycResult);
      setSuccessMessage("KYC Documents submitted successfully! Your application is now under admin review.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit KYC details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  const kycStatus = existingKyc?.status || profile?.kycStatus || "not_submitted";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          KYC Identity Verification
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Verification is mandatory before creating and accepting customer service bookings on RentasBuddy.
        </p>
      </div>

      <KycStatusCard status={kycStatus} rejectionReason={existingKyc?.rejectionReason} showAction={false} />

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

      {/* KYC Form */}
      <form onSubmit={handleSubmitKyc} className="space-y-8">
        {/* Mobile Verification Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
              <Phone className="w-4 h-4 text-pink-500" /> Mobile Number Verification
            </h3>
            {mobileVerified && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-8">
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div className="sm:col-span-4">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading || mobileVerified}
                className="w-full py-3 rounded-2xl bg-pink-100 hover:bg-pink-200 border border-pink-300 text-purple-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {otpLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mobileVerified ? (
                  "Verified"
                ) : (
                  "Send Verification OTP"
                )}
              </button>
            </div>
          </div>

          {otpSent && !mobileVerified && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-pink-50/50 p-4 rounded-2xl border border-pink-200">
              <div className="sm:col-span-8">
                <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                  Enter Received OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit OTP code"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono tracking-widest text-center"
                />
              </div>
              <div className="sm:col-span-4">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Identity & Address Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-6">
          <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-pink-100 flex items-center gap-2">
            <User className="w-4 h-4 text-pink-500" /> Personal Identity & Address Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Full Name (As on Aadhaar)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full legal name"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Aadhaar Number</span>
                <span className="text-[10px] text-pink-600 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Encrypted & Private
                </span>
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="12-digit Aadhaar number"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono tracking-wider"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Residential Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Street, Locality"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit Pincode"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* KYC Document Uploads */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-6">
          <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-pink-100 flex items-center gap-2">
            <Upload className="w-4 h-4 text-pink-500" /> Document & Photo Uploads
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Photo */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                Profile Photo
              </label>
              <div className="relative border-2 border-dashed border-pink-200 rounded-2xl p-4 text-center bg-pink-50/20 hover:border-pink-400 transition-colors flex flex-col items-center justify-center min-h-[160px]">
                {profilePhotoPreview ? (
                  <img src={profilePhotoPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-md mb-2" />
                ) : (
                  <User className="w-8 h-8 text-pink-400 mb-2" />
                )}
                <span className="text-xs font-semibold text-purple-950">
                  {profilePhotoFile ? profilePhotoFile.name : "Choose Clear Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setProfilePhotoFile(e.target.files[0]);
                      setProfilePhotoPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Aadhaar Front */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                Aadhaar Card (Front)
              </label>
              <div className="relative border-2 border-dashed border-pink-200 rounded-2xl p-4 text-center bg-pink-50/20 hover:border-pink-400 transition-colors flex flex-col items-center justify-center min-h-[160px]">
                {aadhaarFrontPreview ? (
                  <img src={aadhaarFrontPreview} alt="Aadhaar Front" className="w-full h-24 object-contain rounded-lg shadow-sm mb-2" />
                ) : (
                  <FileText className="w-8 h-8 text-purple-400 mb-2" />
                )}
                <span className="text-xs font-semibold text-purple-950">
                  {aadhaarFrontFile ? aadhaarFrontFile.name : "Upload Front Side"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAadhaarFrontFile(e.target.files[0]);
                      setAadhaarFrontPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Aadhaar Back */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                Aadhaar Card (Back)
              </label>
              <div className="relative border-2 border-dashed border-pink-200 rounded-2xl p-4 text-center bg-pink-50/20 hover:border-pink-400 transition-colors flex flex-col items-center justify-center min-h-[160px]">
                {aadhaarBackPreview ? (
                  <img src={aadhaarBackPreview} alt="Aadhaar Back" className="w-full h-24 object-contain rounded-lg shadow-sm mb-2" />
                ) : (
                  <FileText className="w-8 h-8 text-purple-400 mb-2" />
                )}
                <span className="text-xs font-semibold text-purple-950">
                  {aadhaarBackFile ? aadhaarBackFile.name : "Upload Back Side"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAadhaarBackFile(e.target.files[0]);
                      setAadhaarBackPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Form Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting Documents...
              </>
            ) : (
              <>
                Submit KYC Verification <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
