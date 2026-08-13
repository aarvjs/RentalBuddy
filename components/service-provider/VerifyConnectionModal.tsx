"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { ProviderBooking } from "@/types/service-provider";
import { X, KeyRound, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

interface VerifyConnectionModalProps {
  booking: ProviderBooking | null;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export function VerifyConnectionModal({
  booking,
  onClose,
  onSuccess,
}: VerifyConnectionModalProps) {
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!booking) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit connection code.");
      return;
    }

    const providerUser = auth.currentUser;
    if (!providerUser) {
      setErrorMessage("Authentication session expired. Please sign in again.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setVerifying(true);

    try {
      const idToken = await providerUser.getIdToken();

      const response = await fetch("/api/bookings/verify-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          otp: cleanOtp,
          providerId: providerUser.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify connection code.");
      }

      setSuccessMessage("Connection Verified ✓ Customer connection has been successfully verified.");
      setTimeout(() => {
        onSuccess(booking.id);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Invalid connection code. Please ask the customer for the 6-digit OTP displayed on their dashboard."
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-50 text-purple-950 flex items-center justify-center hover:bg-pink-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-extrabold shadow-sm shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider block">Service Verification</span>
            <h3 className="text-xl font-extrabold text-purple-950">Verify Customer Connection</h3>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <p className="text-purple-900/70">
            Enter the 6-digit connection code provided by the customer (<span className="font-extrabold text-purple-950">{booking.customerName}</span>).
          </p>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit Connection Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="583214"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center py-3.5 px-4 rounded-2xl border-2 border-pink-300 font-mono text-2xl font-black text-purple-950 tracking-[0.4em] bg-pink-50/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-400/20"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifying || otpCode.length !== 6}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Connect</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
