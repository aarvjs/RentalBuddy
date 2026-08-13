import React from "react";
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, ShieldCheck, KeyRound } from "lucide-react";
import { ProviderBooking, BookingStatus } from "@/types/service-provider";

interface BookingCardProps {
  booking: ProviderBooking;
  onStatusChange?: (bookingId: string, status: BookingStatus) => void;
  onVerifyClick?: (booking: ProviderBooking) => void;
}

export function BookingCard({ booking, onStatusChange, onVerifyClick }: BookingCardProps) {
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" /> Pending Request
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            <Calendar className="w-3 h-3" /> Confirmed / Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  const isConnected = booking.connectionStatus === "connected";
  const isWaiting = !isConnected && (booking.connectionStatus === "waiting" || booking.paymentStatus === "paid");

  return (
    <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100/90 shadow-lg shadow-pink-500/5 hover:border-pink-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
          {booking.customerAvatar ? (
            <img
              src={booking.customerAvatar}
              alt={booking.customerName}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            booking.customerName?.charAt(0)?.toUpperCase() || "C"
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h4 className="font-extrabold text-base text-purple-950">{booking.serviceName}</h4>
            {getStatusBadge(booking.status)}
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Connected ✓
              </span>
            ) : isWaiting ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> Waiting Verification
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900/70 mb-3">
            <User className="w-3.5 h-3.5 text-pink-500" />
            <span>Customer: {booking.customerName}</span>
            {booking.customerPhone && <span className="text-purple-900/40">• {booking.customerPhone}</span>}
          </div>

          <div className="flex items-center gap-4 text-xs text-purple-900/70 flex-wrap">
            <div className="flex items-center gap-1.5 bg-pink-50/80 px-2.5 py-1 rounded-lg border border-pink-100">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <span>{booking.date}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50/80 px-2.5 py-1 rounded-lg border border-purple-100">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span>{booking.time} ({booking.duration})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-pink-100 gap-3 shrink-0">
        <div className="text-left md:text-right">
          <span className="text-[10px] uppercase tracking-wider text-purple-900/50 font-bold block">
            Amount (Paid ✓)
          </span>
          <span className="text-lg font-extrabold text-purple-950 flex items-center md:justify-end">
            ₹{booking.amount}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Verify Connection Button */}
          {!isConnected && onVerifyClick && (
            <button
              onClick={() => onVerifyClick(booking)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" /> Verify Connection
            </button>
          )}

          {booking.status === "pending" && onStatusChange && (
            <>
              <button
                onClick={() => onStatusChange(booking.id, "cancelled")}
                className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => onStatusChange(booking.id, "upcoming")}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
              >
                Accept
              </button>
            </>
          )}

          {booking.status === "upcoming" && isConnected && onStatusChange && (
            <button
              onClick={() => onStatusChange(booking.id, "completed")}
              className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
