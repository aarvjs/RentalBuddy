"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  Languages,
  Award,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getProviderPublicProfile,
  ProviderPublicProfile,
  getServiceById,
  MasterServiceItem,
} from "@/lib/service-provider/provider-services";

function parseTimeString(timeStr?: string): number {
  if (!timeStr) return 0;
  const cleanStr = timeStr.split("–")[0].split("-")[0].trim();
  const match = cleanStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : "AM";
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatMinutesToTime(mins: number): string {
  mins = mins % (24 * 60);
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const strHours = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
  const strMins = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${strHours}:${strMins} ${ampm}`;
}

function generateTimeSlots(fromStr?: string, toStr?: string): string[] {
  const defaultSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
  ];
  if (!fromStr || !toStr) return defaultSlots;

  const startMins = parseTimeString(fromStr);
  const endMins = parseTimeString(toStr);
  if (startMins >= endMins) return defaultSlots;

  const slots: string[] = [];
  for (let m = startMins; m < endMins; m += 60) {
    slots.push(formatMinutesToTime(m));
  }
  return slots.length > 0 ? slots : defaultSlots;
}

interface BookingSuccessInfo {
  bookingId: string;
  serviceName: string;
  providerName: string;
  providerPhone?: string;
  date: string;
  time: string;
  duration: string;
  amount: number;
  connectionOtp?: string;
}

interface PageProps {
  params: Promise<{ providerId: string }>;
}

export default function ProviderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const providerId = resolvedParams.providerId;
  const searchParams = useSearchParams();
  const serviceIdParam = searchParams.get("serviceId");

  const { user, profile, openAuthModal } = useAuth();

  const [provider, setProvider] = useState<ProviderPublicProfile | null>(null);
  const [selectedService, setSelectedService] = useState<MasterServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Flow State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<"config" | "summary" | "success">("config");
  const todayStr = new Date().toISOString().split("T")[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [bookingTime, setBookingTime] = useState<string>("06:00 PM");
  const [bookingDuration, setBookingDuration] = useState<string>("2 Hours");
  const [chosenServiceId, setChosenServiceId] = useState<string>("");
  const [purchasing, setPurchasing] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccessData, setBookingSuccessData] = useState<BookingSuccessInfo | null>(null);

  // Role Notice Modal
  const [providerRoleNotice, setProviderRoleNotice] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, srvData] = await Promise.all([
          getProviderPublicProfile(providerId),
          serviceIdParam ? getServiceById(serviceIdParam) : Promise.resolve(null),
        ]);

        setProvider(profData);
        setSelectedService(srvData);

        if (srvData) {
          setChosenServiceId(srvData.id);
        } else if (profData && profData.services.length > 0) {
          setChosenServiceId(profData.services[0].serviceId);
        }
      } catch (err) {
        console.error("Error loading provider public detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [providerId, serviceIdParam]);

  const activeServiceInfo =
    selectedService ||
    (provider && chosenServiceId
      ? provider.services.find((s) => s.serviceId === chosenServiceId)
      : null);

  const hourlyRate =
    (activeServiceInfo && "hourlyRate" in activeServiceInfo ? activeServiceInfo.hourlyRate : undefined) ||
    selectedService?.price ||
    2000;
  const durationHrs = parseInt(bookingDuration) || 1;
  const totalAmount = hourlyRate * durationHrs;

  const handleStartBooking = () => {
    if (!user) {
      openAuthModal(
        "Create an account or sign in to continue with your booking.",
        `/providers/${providerId}${serviceIdParam ? `?serviceId=${serviceIdParam}` : ""}`
      );
      return;
    }

    if (profile?.userType === "provider") {
      setProviderRoleNotice(true);
      return;
    }

    setIsBookingOpen(true);
    setBookingStep("config");
    setBookingError("");
  };

  const handleConfirmPurchase = async () => {
    if (!user || !provider) return;
    setPurchasing(true);
    setBookingError("");

    try {
      const idToken = await user.getIdToken();
      const srvName = activeServiceInfo?.serviceName || "Companion Experience";
      const srvId =
        chosenServiceId ||
        selectedService?.id ||
        (activeServiceInfo && "serviceId" in activeServiceInfo ? activeServiceInfo.serviceId : undefined) ||
        "companion-service";

      const startMins = parseTimeString(bookingTime);
      const endMins = startMins + durationHrs * 60;
      const endTimeFormatted = formatMinutesToTime(endMins);

      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          customerName: profile?.fullName || user.displayName || "Valued Member",
          customerEmail: user.email,
          serviceId: srvId,
          serviceName: srvName,
          serviceImage: selectedService?.imageUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
          providerId: provider.providerId,
          providerName: provider.fullName,
          date: bookingDate,
          time: `${bookingTime} – ${endTimeFormatted}`,
          duration: `${durationHrs} Hour${durationHrs > 1 ? "s" : ""}`,
          amount: totalAmount,
          hourlyRate,
          stateId: provider.stateId || "up",
          stateName: provider.state || "Uttar Pradesh",
          cityId: provider.cityId || "kanpur",
          cityName: provider.city || "Kanpur",
          localityId: provider.localityId || "panki",
          localityName: provider.locality || "Panki",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking. Please try another time slot.");
      }

      setBookingSuccessData({
        bookingId: data.bookingId,
        serviceName: srvName,
        providerName: provider.fullName,
        providerPhone: data.providerPhone,
        date: bookingDate,
        time: `${bookingTime} – ${endTimeFormatted}`,
        duration: `${durationHrs} Hour${durationHrs > 1 ? "s" : ""}`,
        amount: totalAmount,
        connectionOtp: data.connectionOtp,
      });

      setBookingStep("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during booking.";
      setBookingError(msg);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-[#FFF9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-sm font-bold text-purple-950">Loading partner profile...</span>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-[#FFF9FA] px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-pink-200 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-purple-950">Partner Not Found</h3>
          <p className="text-xs text-purple-900/70">
            The requested companion profile is currently unavailable or unverified.
          </p>
          <Link
            href="/services"
            className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#FFF9FA]">
      {/* Provider Account Notice Modal */}
      {providerRoleNotice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-white border border-pink-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-purple-950">Provider Account Notice</h3>
            <p className="text-xs text-purple-900/70 leading-relaxed">
              You are currently logged in with a Service Provider account. Direct companion booking is available for Customer or Both accounts.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/service-provider/dashboard"
                onClick={() => setProviderRoleNotice(false)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-sm text-center"
              >
                Go to Provider Portal
              </Link>
              <button
                onClick={() => setProviderRoleNotice(false)}
                className="w-full py-2.5 rounded-full bg-pink-50 border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-md overflow-y-auto">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl space-y-6 relative my-auto">
            <button
              onClick={() => {
                setIsBookingOpen(false);
                setBookingStep("config");
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-50 text-purple-950 flex items-center justify-center hover:bg-pink-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-extrabold shadow-sm shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider block">
                  Book Companion • {provider.locality}, {provider.city}
                </span>
                <h3 className="text-xl font-extrabold text-purple-950">
                  {provider.fullName}
                </h3>
              </div>
            </div>

            {/* STEP 1: CONFIGURATION */}
            {bookingStep === "config" && (
              <div className="space-y-5 text-xs">
                {/* Service Selector if multiple */}
                {provider.services.length > 1 && (
                  <div>
                    <label className="block font-extrabold text-purple-950 mb-1">
                      Choose Service
                    </label>
                    <select
                      value={chosenServiceId}
                      onChange={(e) => setChosenServiceId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-pink-400"
                    >
                      {provider.services.map((s) => (
                        <option key={s.serviceId} value={s.serviceId}>
                          {s.serviceName} (₹{s.hourlyRate}/hr)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-extrabold text-purple-950 mb-1">Select Date</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-purple-950 mb-1">Start Time</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-pink-400"
                    >
                      {generateTimeSlots("09:00 AM", "10:00 PM").map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-purple-950 mb-1">Duration (Hours)</label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-pink-400"
                  >
                    <option value="1 Hour">1 Hour</option>
                    <option value="2 Hours">2 Hours</option>
                    <option value="3 Hours">3 Hours</option>
                    <option value="4 Hours">4 Hours</option>
                  </select>
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-900/70">
                    <span>Rate (₹{hourlyRate}/hr × {durationHrs} hr)</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between font-extrabold text-purple-950 text-base pt-1 border-t border-purple-200/60">
                    <span>Total Amount</span>
                    <span className="text-pink-600 font-black text-lg">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="flex-1 py-3 rounded-full border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingStep("summary")}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Continue to Summary</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SUMMARY & DEMO PAYMENT */}
            {bookingStep === "summary" && (
              <div className="space-y-5 text-xs">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/80 to-purple-50/60 border border-pink-200 space-y-3">
                  <h4 className="text-sm font-extrabold text-purple-950 border-b border-pink-200 pb-2">
                    Booking Summary
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-purple-950">
                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Selected Partner</span>
                      <span className="font-extrabold text-pink-600">{provider.fullName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Service</span>
                      <span className="font-extrabold">{activeServiceInfo?.serviceName || "Companion Service"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Location</span>
                      <span className="font-bold">{provider.locality}, {provider.city}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Date & Time</span>
                      <span className="font-bold">{bookingDate} • {bookingTime}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Duration</span>
                      <span className="font-bold">{bookingDuration}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Total Payable</span>
                      <span className="font-black text-pink-600 text-base">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <p className="text-[11px] text-purple-900/60 leading-relaxed italic">
                  Demo Payment Simulation: Confirmation marks booking as <span className="font-bold text-purple-950">PAID</span>, and generates your 6-digit verification code.
                </p>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingStep("config")}
                    className="flex-1 py-3 rounded-full border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    disabled={purchasing}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 flex items-center justify-center gap-2"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Confirming Payment...</span>
                      </>
                    ) : (
                      <span>Pay & Confirm Booking</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS */}
            {bookingStep === "success" && bookingSuccessData && (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-extrabold text-purple-950">Booking Confirmed!</h4>
                  <p className="text-xs text-purple-900/70">
                    Your companion experience with <span className="font-bold text-purple-950">{bookingSuccessData.providerName}</span> is scheduled.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-purple-900/60 font-medium">Partner Contact:</span>
                    <span className="font-bold text-purple-950">{bookingSuccessData.providerPhone || "+91 98765 43210"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-900/60 font-medium">Date & Time:</span>
                    <span className="font-bold text-purple-950">{bookingSuccessData.date} • {bookingSuccessData.time}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                    <span className="text-purple-900/60 font-medium">Connection Code:</span>
                    <span className="font-mono text-base font-black text-pink-600 bg-white px-3 py-1 rounded-lg border border-pink-200">
                      {bookingSuccessData.connectionOtp}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md text-center"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsBookingOpen(false);
                      setBookingStep("config");
                    }}
                    className="flex-1 py-3 rounded-full bg-pink-50 border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-100 text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Page Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-purple-900/60 mb-6">
          <Link href="/" className="hover:text-pink-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
          <Link href="/services" className="hover:text-pink-600 transition-colors">
            Services
          </Link>
          {selectedService && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
              <Link
                href={`/services/${selectedService.id}`}
                className="hover:text-pink-600 transition-colors"
              >
                {selectedService.serviceName}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-purple-950 font-bold">{provider.fullName}</span>
        </nav>

        {/* Profile Card & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Provider Avatar & Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-white border border-pink-100 shadow-xl shadow-purple-500/5 p-6 text-center space-y-5">
              {/* Profile Image */}
              <div className="relative w-44 h-44 rounded-3xl mx-auto overflow-hidden shadow-lg shadow-pink-500/15 border-2 border-pink-200">
                {provider.photoURL ? (
                  <Image
                    src={provider.photoURL}
                    alt={provider.fullName}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-400 to-purple-600 text-white font-black text-5xl">
                    {provider.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Companion</span>
                </div>
                <h1 className="text-2xl font-extrabold text-purple-950">{provider.fullName}</h1>
                <p className="text-xs font-semibold text-purple-900/60 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  {provider.locality}, {provider.city}, {provider.state}
                </p>
              </div>

              {/* Ratings & Reviews Stats */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-pink-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-base font-black text-purple-950">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{provider.rating?.toFixed(1) || "4.8"}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-purple-900/60">Rating</span>
                </div>

                <div className="text-center border-l border-pink-100">
                  <span className="text-base font-black text-purple-950 block">
                    {provider.reviewsCount || 12}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-purple-900/60">Reviews</span>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="space-y-3 pt-2">
                <div className="text-center">
                  <span className="text-xs font-semibold text-purple-900/60 block">Hourly Rate</span>
                  <span className="text-3xl font-black text-purple-950">
                    ₹{hourlyRate.toLocaleString("en-IN")}{" "}
                    <span className="text-xs font-bold text-purple-900/60">/ hour</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleStartBooking}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book This Partner</span>
                </button>

                <p className="text-[11px] text-purple-900/60 leading-relaxed italic">
                  Private phone and direct contact are securely revealed upon confirmed booking.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Detailed Bio, Enrolled Services, Availability */}
          <div className="lg:col-span-7 space-y-6">
            {/* About / Bio Card */}
            <div className="rounded-3xl bg-white border border-pink-100 shadow-xl shadow-purple-500/5 p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-extrabold text-purple-950">About {provider.fullName}</h3>
              <p className="text-sm text-purple-900/80 leading-relaxed">
                {provider.bio}
              </p>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-pink-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-900/60 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-pink-500" /> Experience
                  </span>
                  <p className="text-xs font-extrabold text-purple-950">{provider.experience}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-900/60 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-pink-500" /> Languages
                  </span>
                  <p className="text-xs font-extrabold text-purple-950">
                    {provider.languages?.join(", ") || "English, Hindi"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-900/60 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-pink-500" /> Background
                  </span>
                  <p className="text-xs font-extrabold text-emerald-700">100% KYC Approved</p>
                </div>
              </div>
            </div>

            {/* Services Offered Card */}
            <div className="rounded-3xl bg-white border border-pink-100 shadow-xl shadow-purple-500/5 p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-extrabold text-purple-950">Services Offered</h3>
              <div className="space-y-3">
                {provider.services.length > 0 ? (
                  provider.services.map((s) => (
                    <div
                      key={s.serviceId}
                      className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/50 via-white to-purple-50/30 border border-pink-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-purple-950">{s.serviceName}</h4>
                        <p className="text-[11px] text-purple-900/60 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-pink-500" />
                          Window: {s.availableFrom} – {s.availableTo}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-pink-600 block">
                          ₹{s.hourlyRate} / hr
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-700">Available ✓</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-purple-900/70">
                    Available for custom companionship appointments upon booking.
                  </p>
                )}
              </div>
            </div>

            {/* Safety & Discretion Standards */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-50/80 to-purple-50/60 border border-pink-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>RentasBuddy Safety & Confidentiality Commitment</span>
              </div>
              <p className="text-xs text-purple-900/75 leading-relaxed">
                All companion engagements are backed by our secure 6-digit Connection Code verification, discreet profile management, and 24/7 concierge support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
