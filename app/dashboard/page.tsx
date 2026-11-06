"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Wallet as WalletIcon,
  Heart,
  Sparkles,
  ChevronRight,
  Lock,
  Loader2,
  Activity,
  User as UserIcon,
  Briefcase,
  AlertCircle,
  X,
  Users,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Check,
  Receipt,
  CreditCard,
} from "lucide-react";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/buttons/Buttons";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";
import {
  db,
  getUserBookings,
  getUserPayments,
  BookingData,
  CustomerPaymentRecordData,
  updateUserProfile,
} from "@/lib/firebase";
import {
  getMasterServices,
  getAvailableProviderCountForService,
  DEFAULT_MASTER_SERVICES,
  MasterServiceItem,
} from "@/lib/service-provider/provider-services";
import { LocationSearchSelector, ServiceLocationData } from "@/components/location/LocationSearchSelector";
import { isValidLocation } from "@/lib/locations";

export interface EnrolledProviderInfo {
  providerId: string;
  providerName: string;
  contactNumber: string;
  availableFrom?: string;
  availableTo?: string;
  photoURL?: string;
  hourlyRate?: number;
}

function parseTimeString(t: string): number {
  if (!t) return 0;
  const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMins: number): string {
  let hours = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const strHours = hours < 10 ? `0${hours}` : `${hours}`;
  const strMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${strHours}:${strMins} ${ampm}`;
}

function generateTimeSlots(fromStr?: string, toStr?: string): string[] {
  const defaultSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"];
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

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled" | "payments">("upcoming");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPaymentRecordData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Customer Location State & Onboarding
  const [customerLocation, setCustomerLocation] = useState<ServiceLocationData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<ServiceLocationData | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

  // Master Services state & availability count
  const [masterServices, setMasterServices] = useState<MasterServiceItem[]>([]);
  const [availabilityCounts, setAvailabilityCounts] = useState<Record<string, number>>({});
  const [loadingServices, setLoadingServices] = useState(true);

  // Notice Modal for unavailable services
  const [unavailableModalService, setUnavailableModalService] = useState<string | null>(null);

  // Multi-step Booking Modal State
  const [selectedBookingService, setSelectedBookingService] = useState<MasterServiceItem | null>(null);
  const [bookingStep, setBookingStep] = useState<"provider_select" | "config" | "summary">("provider_select");
  const [enrolledProviders, setEnrolledProviders] = useState<EnrolledProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EnrolledProviderInfo | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [bookingTime, setBookingTime] = useState<string>("06:00 PM");
  const [bookingDuration, setBookingDuration] = useState<string>("2 Hours");
  const [validationError, setValidationError] = useState<string>("");
  const [purchasing, setPurchasing] = useState(false);

  const [purchaseSuccessData, setPurchaseSuccessData] = useState<{
    serviceName: string;
    providerName: string;
    providerPhone: string;
    date: string;
    time: string;
    connectionOtp: string;
  } | null>(null);

  // Check saved customer location or trigger onboarding modal
  useEffect(() => {
    if (loading) return;

    if (profile) {
      const savedLoc = profile.customerLocation || profile.location;
      if (isValidLocation(savedLoc)) {
        setCustomerLocation({
          fullAddress: savedLoc?.address || `${savedLoc?.locality}, ${savedLoc?.city}`,
          country: savedLoc?.country || "India",
          state: savedLoc?.state || savedLoc?.stateName || "",
          city: savedLoc?.city || savedLoc?.cityName || "",
          locality: savedLoc?.locality || savedLoc?.localityName || "",
          pincode: savedLoc?.pincode || "",
          latitude: Number(savedLoc?.latitude) || 26.4499,
          longitude: Number(savedLoc?.longitude) || 80.3319,
          placeId: savedLoc?.placeId,
          stateId: savedLoc?.stateId || "up",
          stateName: savedLoc?.stateName || savedLoc?.state || "Uttar Pradesh",
          cityId: savedLoc?.cityId || "kanpur",
          cityName: savedLoc?.cityName || savedLoc?.city || "Kanpur",
          localityId: savedLoc?.localityId || "panki",
          localityName: savedLoc?.localityName || savedLoc?.locality || "Panki",
        });
        setIsLocationModalOpen(false);
      } else if (isValidLocation(profile)) {
        setCustomerLocation({
          fullAddress: `${profile.localityName || profile.city}, ${profile.cityName || profile.city}`,
          country: "India",
          state: profile.stateName || profile.state || "",
          city: profile.cityName || profile.city || "",
          locality: profile.localityName || profile.city || "",
          pincode: profile.pincode || "",
          latitude: 26.4499,
          longitude: 80.3319,
          stateId: profile.stateId || "up",
          stateName: profile.stateName || profile.state || "Uttar Pradesh",
          cityId: profile.cityId || "kanpur",
          cityName: profile.cityName || profile.city || "Kanpur",
          localityId: profile.localityId || "panki",
          localityName: profile.localityName || "Panki",
        });
        setIsLocationModalOpen(false);
      } else {
        setIsLocationModalOpen(true);
      }
    }
  }, [user, profile, loading]);

  const handleSaveCustomerLocation = async (locToSave?: ServiceLocationData | null) => {
    const target = locToSave || tempLocation;
    if (!user || !target) return;

    setSavingLocation(true);
    try {
      const locPayload = {
        country: target.country,
        state: target.state,
        city: target.city,
        locality: target.locality,
        address: target.fullAddress,
        pincode: target.pincode,
        latitude: target.latitude,
        longitude: target.longitude,
        placeId: target.placeId,
        stateId: target.stateId,
        stateName: target.stateName,
        cityId: target.cityId,
        cityName: target.cityName,
        localityId: target.localityId,
        localityName: target.localityName,
      };

      await updateUserProfile(user.uid, {
        city: target.city,
        state: target.state,
        pincode: target.pincode,
        stateId: target.stateId,
        stateName: target.stateName,
        cityId: target.cityId,
        cityName: target.cityName,
        localityId: target.localityId,
        localityName: target.localityName,
        customerLocation: locPayload,
        location: locPayload,
      });

      if (profile?.userType === "both" || profile?.userType === "provider") {
        try {
          await setDoc(
            doc(db, "providers", user.uid),
            {
              city: target.city,
              state: target.state,
              pincode: target.pincode,
              stateId: target.stateId,
              stateName: target.stateName,
              cityId: target.cityId,
              cityName: target.cityName,
              localityId: target.localityId,
              localityName: target.localityName,
              providerLocation: locPayload,
              location: locPayload,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn("Could not sync location to providers document:", e);
        }
      }

      await refreshProfile();
      setCustomerLocation(target);
      setIsLocationModalOpen(false);
    } catch (e) {
      console.error("Failed to save location:", e);
    } finally {
      setSavingLocation(false);
    }
  };

  // Redirect admin or provider to their respective dashboards
  useEffect(() => {
    if (!loading && profile) {
      if (profile.userType === "provider") {
        router.push("/service-provider/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    async function loadData() {
      if (user) {
        setLoadingBookings(true);
        const [bData, pData] = await Promise.all([
          getUserBookings(user.uid),
          getUserPayments(user.uid),
        ]);
        setBookings(bData);
        setCustomerPayments(pData);
        setLoadingBookings(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  // Load Real Master Services dynamically from Firestore
  useEffect(() => {
    async function loadServicesData() {
      setLoadingServices(true);
      try {
        let servicesList: MasterServiceItem[] = [];
        try {
          if (typeof getMasterServices === "function") {
            servicesList = await getMasterServices();
          }
        } catch (e) {
          console.warn("Could not fetch master services from Firestore:", e);
        }

        if (!servicesList || servicesList.length === 0) {
          servicesList = DEFAULT_MASTER_SERVICES;
        }

        setMasterServices(servicesList);

        // Fetch provider availability counts for each service
        const counts: Record<string, number> = {};
        await Promise.all(
          servicesList.map(async (s) => {
            try {
              if (typeof getAvailableProviderCountForService === "function") {
                const count = await getAvailableProviderCountForService(s.id);
                counts[s.id] = count;
              } else {
                counts[s.id] = 0;
              }
            } catch (err) {
              counts[s.id] = 0;
            }
          })
        );
        setAvailabilityCounts(counts);
      } catch (err) {
        console.error("Failed to load real services on dashboard:", err);
        setMasterServices(DEFAULT_MASTER_SERVICES);
      } finally {
        setLoadingServices(false);
      }
    }

    loadServicesData();
  }, []);

  const cleanLoc = (str?: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const filteredMasterServices = masterServices.filter((s) => {
    if (!customerLocation) return true;

    const custCity = cleanLoc(customerLocation.cityId || customerLocation.city || customerLocation.cityName);
    const custLoc = cleanLoc(customerLocation.localityId || customerLocation.locality || customerLocation.localityName);

    const servCity = cleanLoc(s.cityId || s.city || s.cityName || s.location?.city);
    const servLoc = cleanLoc(s.localityId || s.locality || s.localityName || s.location?.locality);

    if (servCity && custCity && servCity !== custCity) return false;
    if (servLoc && custLoc && servLoc !== custLoc) return false;
    if (servCity && custCity && servCity === custCity) return true;
    return false;
  });

  const handleBookClick = async (service: MasterServiceItem) => {
    const custCity = cleanLoc(customerLocation?.cityId || customerLocation?.city || profile?.cityId);
    const custLocality = cleanLoc(customerLocation?.localityId || customerLocation?.locality || profile?.localityId);

    try {
      const q = query(
        collection(db, "providerServices"),
        where("serviceId", "==", service.id),
        where("isAvailable", "==", true)
      );
      const snapshot = await getDocs(q);
      const providersList: EnrolledProviderInfo[] = [];

      await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const provCity = cleanLoc(data.cityId || data.city || data.cityName);
          const provLoc = cleanLoc(data.localityId || data.locality || data.localityName);

          const matchCity = !provCity || provCity === custCity;
          const matchLocality = !provLoc || provLoc === custLocality;
          if (matchCity && matchLocality) {
            let pName = data.providerName || "Yash";
            let pPhoto = "";
            let pMobile = data.contactNumber || "";

            try {
              const pSnap = await getDoc(doc(db, "providers", data.providerId));
              if (pSnap.exists()) {
                const pData = pSnap.data();
                if (pData.fullName) pName = pData.fullName;
                if (pData.photoURL) pPhoto = pData.photoURL;
                if (!pMobile && (pData.mobileNumber || pData.phoneNumber)) {
                  pMobile = pData.mobileNumber || pData.phoneNumber;
                }
              }
            } catch (err) {
              console.warn("Could not fetch provider profile for list:", err);
            }

            providersList.push({
              providerId: data.providerId || "prov_yash_partner",
              providerName: pName,
              contactNumber: pMobile,
              availableFrom: data.availableFrom || "06:00 PM",
              availableTo: data.availableTo || "10:00 PM",
              photoURL: pPhoto,
              hourlyRate: service.price || 2000,
            });
          }
        })
      );

      if (providersList.length === 0) {
        setUnavailableModalService(service.serviceName);
        return;
      }

      setEnrolledProviders(providersList);
      setSelectedProvider(null);
      setBookingStep("provider_select");
      setSelectedBookingService(service);
      setBookingTime(providersList[0]?.availableFrom || "06:00 PM");
    } catch (e) {
      console.warn("Could not fetch enrolled providers:", e);
      setUnavailableModalService(service.serviceName);
    }
  };

  // Real-time booking validation
  useEffect(() => {
    if (!selectedProvider || !selectedBookingService) {
      setValidationError("");
      return;
    }

    const startMins = parseTimeString(bookingTime || "06:00 PM");
    const durationHrs = parseInt(bookingDuration) || 1;
    const endMins = startMins + durationHrs * 60;

    // 1. Check if duration exceeds provider available window
    const providerToMins = parseTimeString(selectedProvider.availableTo || "10:00 PM");
    if (providerToMins > 0 && endMins > providerToMins) {
      setValidationError("Selected duration exceeds the provider's available time.");
      return;
    }

    // 2. Check for time overlap with existing bookings for selectedProvider on bookingDate
    const providerBookings = bookings.filter(
      (b) => b.providerId === selectedProvider.providerId && b.date === bookingDate && b.status !== "cancelled"
    );

    const hasOverlap = providerBookings.some((b) => {
      const bStart = parseTimeString(b.time);
      let bEnd = bStart + (parseInt(b.duration) || 1) * 60;
      return startMins < bEnd && endMins > bStart;
    });

    if (hasOverlap) {
      setValidationError("This Partner is already booked during the selected time.");
      return;
    }

    setValidationError("");
  }, [selectedProvider, selectedBookingService, bookingDate, bookingTime, bookingDuration, bookings]);

  const hourlyRate = selectedBookingService?.price || 2000;
  const durationHours = parseInt(bookingDuration) || 1;
  const totalAmount = hourlyRate * durationHours;

  const handleConfirmPurchase = async () => {
    if (!user || !selectedBookingService || !selectedProvider) return;
    setPurchasing(true);

    try {
      const idToken = await user.getIdToken();
      const provName = selectedProvider.providerName || "Yash";

      const startMins = parseTimeString(bookingTime || "06:00 PM");
      const durationHrs = parseInt(bookingDuration) || 1;
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
          serviceId: selectedBookingService.id,
          serviceName: selectedBookingService.serviceName,
          serviceImage: selectedBookingService.imageUrl,
          providerId: selectedProvider.providerId,
          providerName: provName,
          date: bookingDate,
          time: `${bookingTime} – ${endTimeFormatted}`,
          duration: `${durationHrs} Hour${durationHrs > 1 ? "s" : ""}`,
          amount: totalAmount,
          hourlyRate,
          stateId: customerLocation?.stateId || profile?.stateId || "up",
          stateName: customerLocation?.state || profile?.stateName || "Uttar Pradesh",
          cityId: customerLocation?.cityId || profile?.cityId || "kanpur",
          cityName: customerLocation?.city || profile?.cityName || "Kanpur",
          localityId: customerLocation?.localityId || profile?.localityId || "panki",
          localityName: customerLocation?.locality || profile?.localityName || "Panki",
        }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server response error (${response.status}): ${
            responseText.startsWith("<")
              ? "Server returned an error page. Please try again or contact support."
              : responseText.slice(0, 100)
          }`
        );
      }
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete purchase.");
      }

      setPurchaseSuccessData({
        serviceName: selectedBookingService.serviceName,
        providerName: provName,
        providerPhone: data.providerPhone || selectedProvider.contactNumber || "+91 98765 43210",
        date: bookingDate,
        time: `${bookingTime} – ${endTimeFormatted}`,
        connectionOtp: data.connectionOtp || "482917",
      });

      setSelectedBookingService(null);
      setSelectedProvider(null);
      setBookingStep("provider_select");

      // Refresh user bookings & payments
      const [updatedBookings, updatedPayments] = await Promise.all([
        getUserBookings(user.uid),
        getUserPayments(user.uid),
      ]);
      setBookings(updatedBookings);
      setCustomerPayments(updatedPayments);
    } catch (err: any) {
      alert(err?.message || "Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-sm font-bold text-purple-950">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF9FA] px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/90 border border-pink-200 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-purple-950 mb-2">Authentication Required</h3>
          <p className="text-purple-900/70 text-sm mb-6">
            Please sign in or create an account to view your member dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <Button href="/login?redirect=/dashboard" variant="primary" className="w-full">
              Sign In
            </Button>
            <Button href="/register?redirect=/dashboard" variant="secondary" className="w-full">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const firstName = profile?.fullName
    ? profile.fullName.split(" ")[0]
    : user.displayName
    ? user.displayName.split(" ")[0]
    : "Member";

  const avatarLetter = firstName.charAt(0).toUpperCase();

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-pink-100/50 via-purple-50/30 to-[#FFF9FA]">
      {/* Customer Multi-step Booking Modal */}
      {selectedBookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-md overflow-y-auto">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl space-y-6 relative my-auto">
            <button
              onClick={() => {
                setSelectedBookingService(null);
                setSelectedProvider(null);
                setBookingStep("provider_select");
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
                  {selectedBookingService.category} • {customerLocation?.locality || "Panki"}, {customerLocation?.city || "Kanpur"}
                </span>
                <h3 className="text-xl font-extrabold text-purple-950">{selectedBookingService.serviceName}</h3>
              </div>
            </div>

            {/* STEP 1: PROVIDER SELECTION */}
            {bookingStep === "provider_select" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-purple-950">
                    Available Partners ({enrolledProviders.length})
                  </h4>
                  <span className="text-xs font-semibold text-purple-900/60">
                    Select a Partner to configure booking
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {enrolledProviders.map((provider) => (
                    <div
                      key={provider.providerId}
                      className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/50 via-white to-purple-50/30 border border-pink-100 hover:border-pink-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold flex items-center justify-center overflow-hidden border-2 border-white shadow-xs shrink-0">
                          {provider.photoURL ? (
                            <img src={provider.photoURL} alt={provider.providerName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{provider.providerName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-extrabold text-purple-950">{provider.providerName}</h5>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                              Available ✓
                            </span>
                          </div>
                          <p className="text-xs font-bold text-pink-600 mt-0.5">
                            ₹{provider.hourlyRate || selectedBookingService.price || 2000} / hour
                          </p>
                          <p className="text-[11px] text-purple-900/60 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-pink-500" />
                            Window: {provider.availableFrom || "06:00 PM"} – {provider.availableTo || "10:00 PM"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setBookingStep("config");
                          setBookingTime(provider.availableFrom || "06:00 PM");
                        }}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-sm hover:opacity-95 shrink-0"
                      >
                        Select Partner
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: BOOKING CONFIGURATION */}
            {bookingStep === "config" && selectedProvider && (
              <div className="space-y-5 text-xs">
                {/* Selected Provider Badge */}
                <div className="p-3.5 rounded-2xl bg-pink-50/80 border border-pink-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-pink-500 text-white font-extrabold flex items-center justify-center shrink-0">
                      {selectedProvider.providerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider block">Selected Partner</span>
                      <h5 className="text-xs font-extrabold text-purple-950">{selectedProvider.providerName}</h5>
                    </div>
                  </div>
                  <button
                    onClick={() => setBookingStep("provider_select")}
                    className="text-[11px] font-bold text-purple-700 hover:text-pink-600 underline"
                  >
                    Change Partner
                  </button>
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
                      {generateTimeSlots(selectedProvider.availableFrom, selectedProvider.availableTo).map((slot) => (
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

                {/* Validation Error Banner if time invalid or overlapping */}
                {validationError ? (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-900/70">
                      <span>Rate (₹{selectedBookingService.price || 2000}/hr × {durationHours} hr)</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div className="flex items-center justify-between font-extrabold text-purple-950 text-base pt-1 border-t border-purple-200/60">
                      <span>Total Amount</span>
                      <span className="text-pink-600 font-black text-lg">₹{totalAmount}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingStep("provider_select")}
                    className="flex-1 py-3 rounded-full border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-50 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(validationError)}
                    onClick={() => setBookingStep("summary")}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <span>Continue to Summary</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: BOOKING SUMMARY & PAYMENT CONFIRMATION */}
            {bookingStep === "summary" && selectedProvider && (
              <div className="space-y-5 text-xs">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/80 to-purple-50/60 border border-pink-200 space-y-3">
                  <h4 className="text-sm font-extrabold text-purple-950 border-b border-pink-200 pb-2">
                    Booking Summary
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-purple-950">
                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Service</span>
                      <span className="font-extrabold">{selectedBookingService.serviceName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Selected Partner</span>
                      <span className="font-extrabold text-pink-600">{selectedProvider.providerName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-900/60 uppercase block">Location</span>
                      <span className="font-bold">{customerLocation?.locality || "Panki"}, {customerLocation?.city || "Kanpur"}</span>
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
                      <span className="font-black text-pink-600 text-sm">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-purple-900/60 leading-relaxed italic">
                  Demo Payment Simulation: Upon confirmation, booking status will be set to <span className="font-bold text-purple-950">PAID</span>, and your 6-digit Connection Code & Partner Contact details will be made available.
                </p>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingStep("config")}
                    className="flex-1 py-3 rounded-full border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-50"
                  >
                    Back to Config
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
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <span>Pay & Confirm Booking</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Confirmed Success Modal */}
      {purchaseSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-md">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl space-y-5 text-center relative">
            <button
              onClick={() => setPurchaseSuccessData(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-50 text-purple-950 flex items-center justify-center hover:bg-pink-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                Booking Confirmed ✓
              </span>
              <h3 className="text-2xl font-black text-purple-950">Payment Successful</h3>
              <p className="text-xs text-purple-900/70">
                Your service experience has been booked and confirmed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-pink-100 pb-1.5">
                <span className="font-semibold text-purple-900/70">Service:</span>
                <span className="font-extrabold text-purple-950">{purchaseSuccessData.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-pink-100 pb-1.5">
                <span className="font-semibold text-purple-900/70">Partner:</span>
                <span className="font-extrabold text-purple-950">{purchaseSuccessData.providerName}</span>
              </div>
              <div className="flex justify-between border-b border-pink-100 pb-1.5">
                <span className="font-semibold text-purple-900/70">Date & Time:</span>
                <span className="font-extrabold text-purple-950">{purchaseSuccessData.date} • {purchaseSuccessData.time}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold text-purple-900/70">Partner Contact:</span>
                <span className="font-black text-pink-600 text-sm">{purchaseSuccessData.providerPhone}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950 text-white text-center space-y-2 shadow-xl border border-purple-800">
              <span className="text-pink-300 font-extrabold block text-[11px] uppercase tracking-wider">
                Connection OTP Code
              </span>
              <div className="font-mono text-3xl font-black text-amber-300 tracking-[0.3em] bg-black/40 py-2.5 rounded-2xl border border-pink-500/40 shadow-inner">
                {purchaseSuccessData.connectionOtp}
              </div>
              <p className="text-[11px] text-pink-100/90 leading-tight">
                Share this 6-digit OTP with <span className="font-bold text-white">{purchaseSuccessData.providerName}</span> when meeting. They will verify it on their provider dashboard.
              </p>
            </div>

            <button
              onClick={() => setPurchaseSuccessData(null)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20"
            >
              Done & View Bookings
            </button>
          </div>
        </div>
      )}

      {/* Modal for unavailable service booking attempt */}
      {unavailableModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setUnavailableModalService(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-50 text-purple-950 flex items-center justify-center hover:bg-pink-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-purple-950">
                Partner Unavailable
              </h3>
              <p className="text-sm text-purple-900/70">
                No Partner is currently available for{" "}
                <span className="font-extrabold text-pink-600">{unavailableModalService}</span> in your selected location.
              </p>
              <p className="text-xs text-purple-900/60">
                Please check back soon or explore other available services on RentasBuddy.
              </p>
            </div>

            <button
              onClick={() => setUnavailableModalService(null)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20"
            >
              Understand & Explore Other Services
            </button>
          </div>
        </div>
      )}

      {/* Customer Location Onboarding & Search Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-white border border-pink-200 shadow-2xl space-y-5 relative my-auto">
            {customerLocation && (
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-50 text-purple-950 flex items-center justify-center hover:bg-pink-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md mb-2">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-purple-950">Where are you looking for a Partner?</h3>
              <p className="text-xs text-purple-900/70">
                Set your location to discover services near you.
              </p>
            </div>

            <LocationSearchSelector
              value={tempLocation || customerLocation || undefined}
              onChange={(val) => setTempLocation(val)}
            />

            <div className="pt-2 flex gap-3">
              {customerLocation && (
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="flex-1 py-3 rounded-full border border-pink-200 text-purple-950 font-extrabold text-xs hover:bg-pink-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSaveCustomerLocation(tempLocation)}
                disabled={!tempLocation || savingLocation}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Location...
                  </>
                ) : (
                  "Use This Location"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        {/* Dashboard Header */}
        <FadeIn delay={0.1}>
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-xs font-extrabold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Welcome Back
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-purple-950 tracking-tight">
                {timeGreeting}, {firstName}
              </h1>
              <p className="text-purple-900/70 text-sm sm:text-base font-medium">
                Browse real platform services and manage your partner bookings.
              </p>
            </div>

            {/* Profile Avatar */}
            <Link
              href="/settings"
              className="flex items-center gap-3 p-2 pr-5 rounded-full bg-pink-50/60 border border-pink-200/80 hover:border-pink-300 transition-all shrink-0 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-pink-500/20 overflow-hidden border-2 border-white">
                {profile?.photoURL || user.photoURL ? (
                  <img src={profile?.photoURL || user.photoURL || ""} alt={firstName} className="w-full h-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <div>
                <span className="text-xs font-extrabold text-purple-950 block group-hover:text-pink-600 transition-colors">
                  {profile?.fullName || firstName}
                </span>
                <span className="text-[10px] text-purple-900/60 font-semibold block capitalize">
                  {profile?.userType || "Member"}
                </span>
              </div>
            </Link>
          </div>
        </FadeIn>

        {/* Customer Location Selector Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                <span>Selected Service Location:</span>
                <span className="text-pink-600">
                  {customerLocation ? `${customerLocation.locality}, ${customerLocation.city}` : "Not Selected"}
                </span>
              </div>
              <p className="text-[11px] text-purple-900/60 font-medium">
                {customerLocation ? `${customerLocation.state}, ${customerLocation.country}` : "Click change location to discover partners near you"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="px-4 py-2 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-purple-950 text-xs font-extrabold transition-colors shadow-xs shrink-0"
          >
            Change Location
          </button>
        </div>

        {/* Quick Overview Summary Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggerItem>
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900/60 uppercase tracking-wider block mb-1">
                  Upcoming Bookings
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-950">
                  {upcomingCount}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900/60 uppercase tracking-wider block mb-1">
                  Completed Services
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-950">
                  {completedCount}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900/60 uppercase tracking-wider block mb-1">
                  Payment History
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-950">
                  {customerPayments.length}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900/60 uppercase tracking-wider block mb-1">
                  Account Status
                </span>
                <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* SECTION: AVAILABLE MASTER SERVICES (FILTERED STRICTLY BY CUSTOMER LOCATION) */}
        <div className="space-y-6">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-pink-600">
                  Location Services
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950 mt-0.5">
                  Services Available in {customerLocation?.locality || customerLocation?.city || "Your Area"}
                </h2>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs font-extrabold shrink-0">
                {filteredMasterServices.length} Services in {customerLocation?.city || "Area"}
              </span>
            </div>
          </FadeIn>

          {loadingServices ? (
            <div className="p-12 rounded-3xl bg-white/80 border border-pink-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
              <span className="text-xs font-bold text-purple-950">Loading services for your area...</span>
            </div>
          ) : filteredMasterServices.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMasterServices.map((service) => {
                const count = availabilityCounts[service.id] || 0;
                const isAvailable = count > 0;

                return (
                  <StaggerItem key={service.id}>
                    <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md hover:shadow-xl hover:border-pink-300 transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {service.imageUrl && (
                          <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-purple-50">
                            <Image
                              src={service.imageUrl}
                              alt={service.serviceName}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover"
                            />
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-purple-950 border border-pink-200 shadow-sm">
                              {service.category}
                            </span>
                          </div>
                        )}

                        <div>
                          <h3 className="font-extrabold text-purple-950 text-lg">
                            {service.serviceName}
                          </h3>
                          <p className="text-xs text-purple-900/70 line-clamp-2 mt-1 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-pink-100 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          {service.price ? (
                            <span className="font-extrabold text-purple-950">
                              ₹{service.price} <span className="text-[10px] font-semibold text-purple-900/60">/ {service.priceType || "hr"}</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-purple-900/60">Custom Rate</span>
                          )}

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isAvailable
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            <Users className="w-3 h-3" />
                            {isAvailable ? `${count} Available` : "No Partner Available"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBookClick(service)}
                          className={`w-full py-2.5 rounded-2xl font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                            isAvailable
                              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-500/20 hover:opacity-95"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                          }`}
                        >
                          {isAvailable ? "Book Now" : "Check Availability"}
                        </button>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <div className="p-10 rounded-3xl bg-white/90 border border-pink-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-purple-950">No services available in this area yet.</h3>
              <p className="text-xs text-purple-900/60 max-w-sm mx-auto">
                We&apos;re expanding our Partner network. Try another nearby location.
              </p>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md hover:opacity-95"
              >
                Change Location
              </button>
            </div>
          )}
        </div>

        {/* SECTION: MY BOOKINGS & PAYMENT HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
                    Your Bookings & Payments
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-900/70">
                    Track your scheduled, completed, and payment transactions.
                  </p>
                </div>

                {/* Booking Status & Payment Tabs */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 border border-pink-200/80 shadow-xs overflow-x-auto max-w-full">
                  <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                      activeTab === "upcoming"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                        : "text-purple-900/70 hover:bg-pink-50 hover:text-purple-950"
                    }`}
                  >
                    <span>Upcoming</span>
                    {upcomingCount > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "upcoming" ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"}`}>
                        {upcomingCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                      activeTab === "completed"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                        : "text-purple-900/70 hover:bg-pink-50 hover:text-purple-950"
                    }`}
                  >
                    <span>Completed</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "completed" ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"}`}>
                      {completedCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("cancelled")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                      activeTab === "cancelled"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                        : "text-purple-900/70 hover:bg-pink-50 hover:text-purple-950"
                    }`}
                  >
                    Cancelled
                  </button>

                  <button
                    onClick={() => setActiveTab("payments")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                      activeTab === "payments"
                        ? "bg-purple-950 text-white shadow-sm"
                        : "text-purple-900/70 hover:bg-pink-50 hover:text-purple-950"
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5 text-pink-400" />
                    <span>Payment History</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "payments" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"}`}>
                      {customerPayments.length}
                    </span>
                  </button>
                </div>
              </div>
            </FadeIn>

            {loadingBookings ? (
              <div className="p-12 rounded-3xl bg-white/80 border border-pink-200 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-purple-950">Fetching details...</span>
              </div>
            ) : activeTab === "payments" ? (
              /* PAYMENT HISTORY TAB VIEW */
              customerPayments.length > 0 ? (
                <StaggerContainer className="space-y-4">
                  {customerPayments.map((p) => (
                    <StaggerItem key={p.id}>
                      <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md hover:border-pink-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold shrink-0 shadow-xs">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                {p.id.slice(0, 16)}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                {p.paymentStatus?.toUpperCase() || "PAID"} ✓
                              </span>
                            </div>
                            <h4 className="font-extrabold text-purple-950 text-base">{p.serviceName}</h4>
                            <p className="text-xs text-purple-900/70 font-semibold mt-0.5">
                              Partner: <span className="text-pink-600 font-extrabold">{p.providerName}</span>
                              {p.localityName || p.cityName ? ` • ${p.localityName || ""}, ${p.cityName || ""}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-pink-100 shrink-0">
                          <span className="text-lg font-black text-purple-950 block">
                            ₹{p.amount?.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-purple-900/60 font-semibold uppercase block">
                            {p.paymentMethod || "Demo Payment"} • {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <FadeIn delay={0.3}>
                  <div className="p-10 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
                      <Receipt className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-extrabold text-purple-950">No Payment History Yet</h3>
                    <p className="text-xs sm:text-sm text-purple-900/70 max-w-sm mx-auto">
                      Your completed service purchase transactions will appear here.
                    </p>
                  </div>
                </FadeIn>
              )
            ) : filteredBookings.length > 0 ? (
              /* BOOKINGS TAB VIEW (UPCOMING / COMPLETED / CANCELLED) */
              <StaggerContainer className="space-y-4">
                {filteredBookings.map((b) => (
                  <StaggerItem key={b.id}>
                    <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md hover:border-pink-300 transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-3 relative h-32 w-full rounded-2xl overflow-hidden shrink-0">
                        <Image src={b.serviceImage} alt={b.serviceName} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                      </div>

                      <div className="sm:col-span-5 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${
                              b.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-pink-100 text-pink-600"
                            }`}
                          >
                            {b.status === "completed" ? "✓ Completed" : b.status}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${
                              b.connectionStatus === "connected"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {b.connectionStatus === "connected" ? "✓ Connected" : "Waiting for Verification"}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-purple-950 text-base">{b.serviceName}</h4>
                        <p className="text-xs font-semibold text-purple-900/70">
                          Partner: <span className="text-purple-950 font-bold">{b.providerName}</span> ({b.providerPhone || "+91 98765 43210"})
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-purple-900/60 pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-pink-500" /> {b.localityName || "Panki"}, {b.cityName || "Kanpur"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-pink-500" /> {b.date} • {b.time}
                          </span>
                        </div>
                      </div>

                      <div className="sm:col-span-4 bg-purple-50/60 border border-purple-100 p-3.5 rounded-2xl space-y-2 text-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block">
                          Connection OTP
                        </span>
                        <div className="font-mono text-xl font-black text-purple-950 tracking-[0.2em] bg-white py-1 px-3 rounded-xl border border-purple-200 shadow-sm inline-block">
                          {b.connectionOtp || "482917"}
                        </div>
                        <div className="text-[10px] font-bold text-purple-900/60">
                          ₹{b.amount?.toLocaleString("en-IN")} Paid ✓
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <FadeIn delay={0.3}>
                <div className="p-10 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-purple-950">No {activeTab} bookings yet</h3>
                    <p className="text-xs sm:text-sm text-purple-900/70 max-w-sm mx-auto">
                      Explore our services and find the right Partner for you.
                    </p>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Right Column: Recent Activity & Safety Tips */}
          <div className="lg:col-span-4 space-y-6">
            <FadeIn delay={0.3}>
              <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md space-y-6">
                <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-purple-950">Safe Service Meetups</h3>
                    <p className="text-xs text-purple-900/60">RentasBuddy Trust & Safety</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-purple-900/80">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <span>Always verify the 6-digit Connection OTP with your partner when meeting in person.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <span>Your partner contact number is securely provided after successful booking payment.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <span>All partners undergo KYC identity verification before offering services.</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
