"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  ChevronRight,
  Filter,
  X,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  UserCheck,
  Briefcase,
  Check,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getServiceById,
  getMasterServices,
  getEligibleProvidersForService,
  MasterServiceItem,
  EligibleProviderInfo,
} from "@/lib/service-provider/provider-services";
import { LocationSearchSelector, ServiceLocationData } from "@/components/location/LocationSearchSelector";
import { updateUserProfile } from "@/lib/firebase";

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
  params: Promise<{ serviceId: string }>;
}

const DEFAULT_LOCATION: ServiceLocationData = {
  fullAddress: "Panki, Kanpur, Uttar Pradesh, India",
  country: "India",
  state: "Uttar Pradesh",
  city: "Kanpur",
  locality: "Panki",
  pincode: "208020",
  latitude: 26.4499,
  longitude: 80.3319,
  stateId: "up",
  stateName: "Uttar Pradesh",
  cityId: "kanpur",
  cityName: "Kanpur",
  localityId: "panki",
  localityName: "Panki",
};

export default function ServiceDiscoveryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const serviceId = resolvedParams.serviceId;
  const router = useRouter();

  const { user, profile, openAuthModal } = useAuth();

  // Core Data States
  const [service, setService] = useState<MasterServiceItem | null>(null);
  const [allServices, setAllServices] = useState<MasterServiceItem[]>([]);
  const [providers, setProviders] = useState<EligibleProviderInfo[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Customer Location State
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocationData>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("rentasbuddy_saved_location");
        if (cached) return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return DEFAULT_LOCATION;
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<ServiceLocationData | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

  // Filter States
  const [minPrice, setMinPrice] = useState<number>(500);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [availabilityDateOption, setAvailabilityDateOption] = useState<"all" | "today" | "tomorrow">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "morning" | "afternoon" | "evening" | "night">("all");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc" | "highest_rated">("recommended");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Booking Flow States
  const [bookingProvider, setBookingProvider] = useState<EligibleProviderInfo | null>(null);
  const [bookingStep, setBookingStep] = useState<"config" | "summary" | "success">("config");
  const todayStr = new Date().toISOString().split("T")[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [bookingTime, setBookingTime] = useState<string>("06:00 PM");
  const [bookingDuration, setBookingDuration] = useState<string>("2 Hours");
  const [purchasing, setPurchasing] = useState(false);
  const [bookingError, setBookingError] = useState<string>("");
  const [bookingSuccessData, setBookingSuccessData] = useState<BookingSuccessInfo | null>(null);

  // Provider Notice Modal
  const [providerRoleNotice, setProviderRoleNotice] = useState(false);

  // Sync profile location when profile loads
  useEffect(() => {
    const saved = profile?.customerLocation || profile?.location;
    if (saved?.city && saved?.locality) {
      setSelectedLocation((prev) => {
        if (prev.city === saved.city && prev.locality === saved.locality) return prev;
        return {
          fullAddress: saved.address || `${saved.locality}, ${saved.city}, ${saved.state || "UP"}, India`,
          country: saved.country || "India",
          state: saved.state || saved.stateName || "Uttar Pradesh",
          city: saved.city || saved.cityName || "Kanpur",
          locality: saved.locality || saved.localityName || "Panki",
          pincode: saved.pincode || "208020",
          latitude: saved.latitude || 26.4499,
          longitude: saved.longitude || 80.3319,
          stateId: saved.stateId || "up",
          stateName: saved.stateName || saved.state || "Uttar Pradesh",
          cityId: saved.cityId || "kanpur",
          cityName: saved.cityName || saved.city || "Kanpur",
          localityId: saved.localityId || "panki",
          localityName: saved.localityName || saved.locality || "Panki",
        };
      });
    }
  }, [profile]);

  // Fetch Master Service Details and All Services for Filtering
  useEffect(() => {
    async function loadService() {
      try {
        const s = await getServiceById(serviceId);
        setService(s);
      } catch (err) {
        console.error("Failed to load service details:", err);
      }
    }
    async function loadAllServices() {
      try {
        const list = await getMasterServices();
        setAllServices(list);
      } catch (err) {
        console.error("Failed to load all master services:", err);
      }
    }
    loadService();
    loadAllServices();
  }, [serviceId]);

  // Fetch Eligible Providers enrolled in this service for current location
  useEffect(() => {
    async function loadProviders() {
      if (!serviceId) return;
      setLoadingProviders(true);
      try {
        const list = await getEligibleProvidersForService(serviceId, selectedLocation);
        setProviders(list);
      } catch (err) {
        console.error("Failed to fetch eligible providers:", err);
        setProviders([]);
      } finally {
        setLoadingProviders(false);
      }
    }
    loadProviders();
  }, [serviceId, selectedLocation]);

  // Save Customer Location Handler
  const handleSaveLocation = async (locToSave: ServiceLocationData | null) => {
    if (!locToSave || !locToSave.city || !locToSave.locality) return;
    setSavingLocation(true);
    try {
      setSelectedLocation(locToSave);
      setIsLocationModalOpen(false);

      try {
        localStorage.setItem("rentasbuddy_saved_location", JSON.stringify(locToSave));
      } catch {
        // ignore
      }

      if (user) {
        await updateUserProfile(user.uid, {
          city: locToSave.city,
          state: locToSave.state,
          cityId: locToSave.cityId,
          cityName: locToSave.cityName,
          localityId: locToSave.localityId,
          localityName: locToSave.localityName,
          stateId: locToSave.stateId,
          stateName: locToSave.stateName,
          customerLocation: {
            country: locToSave.country,
            state: locToSave.state,
            city: locToSave.city,
            locality: locToSave.locality,
            address: locToSave.fullAddress,
            pincode: locToSave.pincode,
            latitude: locToSave.latitude,
            longitude: locToSave.longitude,
            stateId: locToSave.stateId,
            stateName: locToSave.stateName,
            cityId: locToSave.cityId,
            cityName: locToSave.cityName,
            localityId: locToSave.localityId,
            localityName: locToSave.localityName,
          },
        });
      }
    } catch (e) {
      console.error("Failed to save location:", e);
    } finally {
      setSavingLocation(false);
    }
  };

  // Filter and Sort Providers
  const filteredProviders = useMemo(() => {
    return providers
      .filter((p) => {
        // Price Filter
        if (p.hourlyRate < minPrice || p.hourlyRate > maxPrice) return false;

        // Verified Filter
        if (verifiedOnly && !p.isKycApproved) return false;

        // Rating Filter
        if (minRating !== null) {
          const providerRating = p.rating || 0;
          if (providerRating < minRating) return false;
        }

        // Gender Filter
        if (genderFilter !== "all") {
          const pGender = (p.gender || "").toLowerCase();
          if (pGender && pGender !== "all" && pGender !== genderFilter.toLowerCase()) return false;
        }

        // Time Filter (Morning 6am-12pm, Afternoon 12pm-5pm, Evening 5pm-9pm, Night 9pm-12am)
        if (timeFilter !== "all") {
          const startMins = parseTimeString(p.availableFrom || "06:00 PM");
          if (timeFilter === "morning" && (startMins < 360 || startMins >= 720)) return false;
          if (timeFilter === "afternoon" && (startMins < 720 || startMins >= 1020)) return false;
          if (timeFilter === "evening" && (startMins < 1020 || startMins >= 1260)) return false;
          if (timeFilter === "night" && (startMins < 1260 && startMins >= 360)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.hourlyRate - b.hourlyRate;
        if (sortBy === "price_desc") return b.hourlyRate - a.hourlyRate;
        if (sortBy === "highest_rated") return (b.rating || 0) - (a.rating || 0);
        return 0; // recommended default
      });
  }, [providers, minPrice, maxPrice, verifiedOnly, minRating, genderFilter, timeFilter, sortBy]);

  // Clear All Filters
  const handleClearFilters = () => {
    setMinPrice(500);
    setMaxPrice(10000);
    setAvailabilityDateOption("all");
    setTimeFilter("all");
    setMinRating(null);
    setVerifiedOnly(false);
    setGenderFilter("all");
    setSortBy("recommended");
  };

  // Start Booking Flow
  const handleStartBooking = (provider: EligibleProviderInfo) => {
    if (!user) {
      openAuthModal(
        "Create an account or sign in to continue with your booking.",
        `/services/${serviceId}`
      );
      return;
    }

    if (profile?.userType === "provider") {
      setProviderRoleNotice(true);
      return;
    }

    setBookingProvider(provider);
    setBookingTime(provider.availableFrom || "06:00 PM");
    setBookingStep("config");
    setBookingError("");
  };

  // Confirm Purchase & Atomic Booking API Call
  const handleConfirmPurchase = async () => {
    if (!user || !service || !bookingProvider) return;
    setPurchasing(true);
    setBookingError("");

    try {
      const idToken = await user.getIdToken();
      const hourlyRate = bookingProvider.hourlyRate || service.price || 2000;
      const durationHrs = parseInt(bookingDuration) || 1;
      const totalAmount = hourlyRate * durationHrs;

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
          serviceId: service.id,
          serviceName: service.serviceName,
          serviceImage: service.imageUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
          providerId: bookingProvider.providerId,
          providerName: bookingProvider.fullName,
          date: bookingDate,
          time: `${bookingTime} – ${endTimeFormatted}`,
          duration: `${durationHrs} Hour${durationHrs > 1 ? "s" : ""}`,
          amount: totalAmount,
          hourlyRate,
          stateId: selectedLocation?.stateId || "up",
          stateName: selectedLocation?.state || "Uttar Pradesh",
          cityId: selectedLocation?.cityId || "kanpur",
          cityName: selectedLocation?.city || "Kanpur",
          localityId: selectedLocation?.localityId || "panki",
          localityName: selectedLocation?.locality || "Panki",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking. Please try another time slot.");
      }

      setBookingSuccessData({
        bookingId: data.bookingId,
        serviceName: service.serviceName,
        providerName: bookingProvider.fullName,
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

  const serviceTitle = service?.serviceName || "Companion Service";
  const serviceCategory = service?.category || "Tailored Lifestyle";
  const serviceDesc =
    service?.description ||
    "Connect with vetted, cultured, and verified companion partners for your curated social and everyday moments.";

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
              You are currently logged in with a Service Provider account. Direct booking is available for Customer or Both accounts.
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

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-50 text-purple-950 flex items-center justify-center hover:bg-pink-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-purple-950">Select Your Location</h3>
                <p className="text-xs text-purple-900/60">
                  Discover verified companion partners matching your locality.
                </p>
              </div>
            </div>

            <LocationSearchSelector
              value={tempLocation || selectedLocation || undefined}
              onChange={(loc) => setTempLocation(loc)}
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-pink-200 text-purple-950 font-bold text-xs hover:bg-pink-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingLocation || !tempLocation}
                onClick={() => handleSaveLocation(tempLocation)}
                className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {savingLocation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Apply Location
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-md overflow-y-auto">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl space-y-6 relative my-auto">
            <button
              onClick={() => {
                setBookingProvider(null);
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
                  {serviceCategory} • {selectedLocation?.locality || "Panki"}, {selectedLocation?.city || "Kanpur"}
                </span>
                <h3 className="text-xl font-extrabold text-purple-950">{serviceTitle}</h3>
              </div>
            </div>

            {/* STEP 1: CONFIGURATION */}
            {bookingStep === "config" && (
              <div className="space-y-5 text-xs">
                {/* Selected Provider Info Banner */}
                <div className="p-3.5 rounded-2xl bg-pink-50/80 border border-pink-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500 text-white font-extrabold flex items-center justify-center overflow-hidden shrink-0">
                      {bookingProvider.photoURL ? (
                        <Image
                          src={bookingProvider.photoURL}
                          alt={bookingProvider.fullName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        bookingProvider.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider block">Selected Partner</span>
                      <h4 className="text-sm font-extrabold text-purple-950">{bookingProvider.fullName}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-pink-600">₹{bookingProvider.hourlyRate}</span>
                    <span className="text-[10px] text-purple-900/60 block">per hour</span>
                  </div>
                </div>

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
                      {generateTimeSlots(bookingProvider.availableFrom, bookingProvider.availableTo).map((slot) => (
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

                {/* Price Calculation Banner */}
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-900/70">
                    <span>
                      Rate (₹{bookingProvider.hourlyRate}/hr × {parseInt(bookingDuration) || 1} hr)
                    </span>
                    <span>₹{(bookingProvider.hourlyRate || 2000) * (parseInt(bookingDuration) || 1)}</span>
                  </div>
                  <div className="flex items-center justify-between font-extrabold text-purple-950 text-base pt-1 border-t border-purple-200/60">
                    <span>Total Amount</span>
                    <span className="text-pink-600 font-black text-lg">
                      ₹{(bookingProvider.hourlyRate || 2000) * (parseInt(bookingDuration) || 1)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingProvider(null)}
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
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Service</span>
                      <span className="font-extrabold">{serviceTitle}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Selected Partner</span>
                      <span className="font-extrabold text-pink-600">{bookingProvider.fullName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Location</span>
                      <span className="font-bold">
                        {selectedLocation?.locality || "Panki"}, {selectedLocation?.city || "Kanpur"}
                      </span>
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
                      <span className="font-black text-pink-600 text-base">
                        ₹{(bookingProvider.hourlyRate || 2000) * (parseInt(bookingDuration) || 1)}
                      </span>
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
                  Demo Payment Simulation: Upon confirmation, booking will be marked as <span className="font-bold text-purple-950">PAID</span>, and your 6-digit Connection Code & Partner Contact details will be unlocked.
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

                <p className="text-[11px] text-purple-900/60">
                  Share this 6-digit connection code in person when meeting your companion.
                </p>

                <div className="flex gap-3 pt-2">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md text-center"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setBookingProvider(null);
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-purple-900/60 mb-6">
          <Link href="/" className="hover:text-pink-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
          <Link href="/#services" className="hover:text-pink-600 transition-colors">
            Services
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-purple-950 font-bold">{serviceTitle}</span>
        </nav>

        {/* Hero Service Header Card */}
        <div className="rounded-3xl bg-white border border-pink-100 shadow-xl shadow-purple-500/5 p-6 sm:p-8 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {serviceCategory}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 tracking-tight">
                {serviceTitle}
              </h1>
              <p className="text-purple-900/70 text-sm sm:text-base leading-relaxed">
                {serviceDesc}
              </p>
            </div>

            {/* Selected Location Pill & Partner Counter */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/80 to-purple-50/60 border border-pink-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider block">
                    Selected Location
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-purple-950">
                    {selectedLocation?.locality || "Panki"}, {selectedLocation?.city || "Kanpur"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="ml-2 px-3 py-1.5 rounded-full bg-white border border-pink-200 text-[11px] font-extrabold text-pink-600 hover:bg-pink-50 transition-colors shadow-2xs"
                >
                  Change
                </button>
              </div>

              <div className="text-xs font-semibold text-purple-900/70 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Available Partners: <span className="font-extrabold text-purple-950">{filteredProviders.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-pink-200 text-xs font-extrabold text-purple-950 shadow-sm hover:bg-pink-50"
          >
            <Filter className="w-4 h-4 text-pink-500" />
            <span>Filter Partners ({filteredProviders.length})</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recommended" | "price_asc" | "price_desc" | "highest_rated")}
            className="px-3.5 py-2 rounded-full bg-white border border-pink-200 text-xs font-bold text-purple-950 focus:outline-none"
          >
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="highest_rated">Highest Rated</option>
          </select>
        </div>

        {/* Main Grid: Filters Sidebar (Left) + Provider Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE: DESKTOP FILTERS SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            <div className="rounded-3xl bg-white border border-pink-100 shadow-xl shadow-purple-500/5 p-6 space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between border-b border-pink-100 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-pink-600" />
                  <h3 className="text-sm font-extrabold text-purple-950 uppercase tracking-wider">
                    Filters
                  </h3>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear All
                </button>
              </div>

              {/* SERVICE FILTER DROPDOWN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                    Service
                  </label>
                  <span className="text-[10px] text-pink-600 font-bold">
                    {allServices.length} Services
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={serviceId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      if (newId && newId !== serviceId) {
                        router.push(`/services/${newId}`);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50/60 text-purple-950 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer appearance-none pr-9 shadow-xs"
                  >
                    {allServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.serviceName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-pink-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* A. LOCATION FILTER */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                  Location
                </label>
                <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-950 truncate">
                    <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span className="truncate">
                      {selectedLocation?.locality || "Panki"}, {selectedLocation?.city || "Kanpur"}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-[11px] font-extrabold text-pink-600 hover:underline shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* B. PRICE RANGE FILTER */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-extrabold text-purple-950 uppercase tracking-wider">
                    Price Range (₹/hr)
                  </label>
                  <span className="font-black text-pink-600">
                    ₹{minPrice} – ₹{maxPrice}
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-purple-900/60 block">Min</span>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-pink-200 text-xs font-bold text-purple-950"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-purple-900/60 block">Max</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-pink-200 text-xs font-bold text-purple-950"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* C. AVAILABILITY DATE FILTER */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                  Availability
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAvailabilityDateOption("all")}
                    className={`py-2 px-3 rounded-xl font-bold transition-all ${
                      availabilityDateOption === "all"
                        ? "bg-purple-950 text-white shadow-xs"
                        : "bg-pink-50 text-purple-950 hover:bg-pink-100"
                    }`}
                  >
                    All Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityDateOption("today")}
                    className={`py-2 px-3 rounded-xl font-bold transition-all ${
                      availabilityDateOption === "today"
                        ? "bg-purple-950 text-white shadow-xs"
                        : "bg-pink-50 text-purple-950 hover:bg-pink-100"
                    }`}
                  >
                    Available Today
                  </button>
                </div>
              </div>

              {/* D. TIME OF DAY FILTER */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                  Time Preference
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: "all", label: "Any Time" },
                    { key: "morning", label: "Morning" },
                    { key: "afternoon", label: "Afternoon" },
                    { key: "evening", label: "Evening" },
                    { key: "night", label: "Night" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTimeFilter(t.key as "all" | "morning" | "afternoon" | "evening" | "night")}
                      className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                        timeFilter === t.key
                          ? "bg-pink-500 text-white shadow-xs"
                          : "bg-pink-50 text-purple-950 hover:bg-pink-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* E. RATINGS FILTER */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[4.5, 4.0, 3.5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setMinRating(minRating === rate ? null : rate)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                        minRating === rate
                          ? "bg-purple-950 text-white shadow-xs"
                          : "bg-pink-50 text-purple-950 hover:bg-pink-100"
                      }`}
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{rate}+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* F. VERIFICATION TOGGLE */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/60 border border-pink-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-purple-950">Verified Providers</span>
                </div>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
              </div>

              {/* G. GENDER PREFERENCE FILTER */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                  Companion Gender
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {["all", "female", "male"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenderFilter(g)}
                      className={`py-1.5 px-2 rounded-xl font-bold capitalize transition-all ${
                        genderFilter === g
                          ? "bg-purple-950 text-white shadow-xs"
                          : "bg-pink-50 text-purple-950 hover:bg-pink-100"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* H. SORT BY */}
              <div className="space-y-2 pt-2 border-t border-pink-100">
                <label className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recommended" | "price_asc" | "price_desc" | "highest_rated")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/40 text-purple-950 font-bold text-xs focus:outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="highest_rated">Highest Rated</option>
                </select>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: PROVIDER PROFILE CARDS */}
          <main className="lg:col-span-8 space-y-6">
            {/* Top Bar for Desktop Result Count & Sort */}
            <div className="hidden lg:flex items-center justify-between p-4 rounded-2xl bg-white border border-pink-100 shadow-xs">
              <span className="text-xs font-bold text-purple-900/70">
                Showing <span className="font-extrabold text-purple-950">{filteredProviders.length}</span> eligible companions in {selectedLocation?.locality || "Panki"}, {selectedLocation?.city || "Kanpur"}
              </span>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-purple-900/60">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recommended" | "price_asc" | "price_desc" | "highest_rated")}
                  className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/40 text-purple-950 font-bold text-xs focus:outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="highest_rated">Highest Rated</option>
                </select>
              </div>
            </div>

            {loadingProviders ? (
              <div className="p-16 rounded-3xl bg-white border border-pink-100 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
                <p className="text-xs font-bold text-purple-950">
                  Matching verified partners for {serviceTitle}...
                </p>
              </div>
            ) : filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.providerId}
                    className="group rounded-3xl bg-white border border-pink-100 shadow-md hover:shadow-xl hover:border-pink-300 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Provider Profile Header with Image */}
                      <div className="relative h-48 w-full bg-purple-950/5 overflow-hidden">
                        {provider.photoURL ? (
                          <Image
                            src={provider.photoURL}
                            alt={provider.fullName}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-400 to-purple-600 text-white font-black text-4xl">
                            {provider.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent" />

                        {/* Verified Badge */}
                        {provider.isKycApproved && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-pink-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </div>
                        )}

                        {/* Location Badge */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-bold flex items-center gap-1 drop-shadow-sm">
                            <MapPin className="w-3.5 h-3.5 text-pink-300" />
                            {provider.localityName || "Panki"}, {provider.cityName || "Kanpur"}
                          </span>

                          {provider.rating && (
                            <span className="px-2 py-0.5 rounded-full bg-white/90 text-purple-950 font-extrabold text-[11px] flex items-center gap-1 shadow-xs">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {provider.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider block">
                            {serviceTitle}
                          </span>
                          <h4 className="text-base font-extrabold text-purple-950 truncate">
                            {provider.fullName}
                          </h4>
                          <p className="text-[11px] text-purple-900/60 font-medium">
                            {provider.experience || "2+ years experience"} • {provider.languages?.join(", ") || "English, Hindi"}
                          </p>
                        </div>

                        {provider.bio && (
                          <p className="text-purple-900/70 text-xs line-clamp-2 leading-relaxed">
                            {provider.bio}
                          </p>
                        )}

                        {/* Pricing & Time Slots */}
                        <div className="pt-2 border-t border-pink-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-purple-900/60 uppercase block font-semibold">Rate</span>
                            <span className="text-sm font-black text-purple-950">
                              ₹{provider.hourlyRate?.toLocaleString("en-IN")}{" "}
                              <span className="text-[10px] font-medium text-purple-900/60">/ hr</span>
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-purple-900/60 uppercase block font-semibold">Available</span>
                            <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-pink-500" />
                              {provider.availableFrom || "06:00 PM"} – {provider.availableTo || "10:00 PM"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: View Details & Book Now */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <Link
                        href={`/providers/${provider.providerId}?serviceId=${serviceId}`}
                        className="py-2.5 px-3 rounded-full border border-pink-200 text-purple-950 font-extrabold text-xs text-center hover:bg-pink-50 transition-colors"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleStartBooking(provider)}
                        className="py-2.5 px-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs text-center shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No matching providers empty state */
              <div className="p-12 sm:p-16 rounded-3xl bg-white border border-pink-100 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-sm">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-xl font-extrabold text-purple-950">
                    No Eligible Partners in this Area Yet
                  </h3>
                  <p className="text-xs text-purple-900/70 leading-relaxed">
                    We only connect you with enrolled, active, and identity-verified companions. Try adjusting your filters or search a nearby locality.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md"
                  >
                    Change Locality
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 rounded-full bg-pink-50 border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-100"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-purple-950/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs h-full bg-white p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-pink-100 pb-4">
              <h3 className="text-sm font-extrabold text-purple-950 uppercase">Filter Partners</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-purple-950" />
              </button>
            </div>

            {/* Mobile Service Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-purple-950 uppercase block">Service</label>
                <span className="text-[10px] text-pink-600 font-bold">{allServices.length} Services</span>
              </div>
              <div className="relative">
                <select
                  value={serviceId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    if (newId && newId !== serviceId) {
                      setMobileFilterOpen(false);
                      router.push(`/services/${newId}`);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50 text-purple-950 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer appearance-none pr-8"
                >
                  {allServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-pink-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Mobile Location */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-purple-950 uppercase block">Location</label>
              <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-xs font-bold text-purple-950 flex justify-between">
                <span>{selectedLocation?.locality || "Panki"}, {selectedLocation?.city || "Kanpur"}</span>
                <button
                  onClick={() => {
                    setMobileFilterOpen(false);
                    setIsLocationModalOpen(true);
                  }}
                  className="text-pink-600 font-extrabold text-[11px]"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Mobile Max Price */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-extrabold text-purple-950 uppercase">Max Price</label>
                <span className="font-black text-pink-600">₹{maxPrice}/hr</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>

            {/* Mobile Time */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-purple-950 uppercase block">Time</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["all", "morning", "afternoon", "evening", "night"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t as "all" | "morning" | "afternoon" | "evening" | "night")}
                    className={`py-1.5 px-2 rounded-xl font-bold capitalize ${
                      timeFilter === t ? "bg-pink-500 text-white" : "bg-pink-50 text-purple-950"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md"
            >
              Apply Filters ({filteredProviders.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
