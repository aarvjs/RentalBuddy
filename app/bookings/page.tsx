"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Lock,
  Loader2,
  CheckCircle2,
  Clock3,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/buttons/Buttons";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";
import { getUserBookings, BookingData } from "@/lib/firebase";

export default function BookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/bookings");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadData() {
      if (user) {
        setLoadingBookings(true);
        const data = await getUserBookings(user.uid);
        setBookings(data);
        setLoadingBookings(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-sm font-bold text-purple-950">Loading your bookings...</span>
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
            Please sign in or create an account to view your active bookings.
          </p>
          <div className="flex flex-col gap-3">
            <Button href="/login?redirect=/bookings" variant="primary" className="w-full">
              Sign In
            </Button>
            <Button href="/register?redirect=/bookings" variant="secondary" className="w-full">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-pink-100/50 via-purple-50/30 to-[#FFF9FA]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-8">
        {/* Breadcrumb */}
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 text-xs font-semibold text-purple-950 shadow-sm">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
            <Link href="/dashboard" className="hover:text-pink-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-pink-600 font-bold">My Bookings</span>
          </div>
        </FadeIn>

        {/* Page Heading */}
        <FadeIn delay={0.2}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-xs font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Confirmed Itineraries
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight">
                My Bookings
              </h1>
              <p className="text-purple-900/70 text-sm sm:text-base mt-1">
                Manage your scheduled social companionships, concierge escorts, and completed outings.
              </p>
            </div>

            <Button href="/pricing" variant="primary" size="sm" icon>
              Book New Experience
            </Button>
          </div>
        </FadeIn>

        {/* Booking Tabs */}
        <FadeIn delay={0.3}>
          <div className="flex gap-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 max-w-md shadow-sm">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-extrabold transition-all ${
                activeTab === "upcoming"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                  : "text-purple-900/70 hover:text-pink-600"
              }`}
            >
              Upcoming ({bookings.filter((b) => b.status === "upcoming").length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-extrabold transition-all ${
                activeTab === "completed"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                  : "text-purple-900/70 hover:text-pink-600"
              }`}
            >
              Completed ({bookings.filter((b) => b.status === "completed").length})
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-extrabold transition-all ${
                activeTab === "cancelled"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                  : "text-purple-900/70 hover:text-pink-600"
              }`}
            >
              Cancelled ({bookings.filter((b) => b.status === "cancelled").length})
            </button>
          </div>
        </FadeIn>

        {/* Bookings List / Empty State */}
        {loadingBookings ? (
          <div className="p-16 rounded-[2.5rem] bg-white/80 border border-pink-200 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-3" />
            <span className="text-sm font-bold text-purple-950">Retrieving Firestore booking records...</span>
          </div>
        ) : filteredBookings.length > 0 ? (
          <StaggerContainer className="space-y-6">
            {filteredBookings.map((booking) => (
              <StaggerItem key={booking.id}>
                <div className="group rounded-[2.5rem] p-6 sm:p-8 bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 hover:border-pink-300 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Service Image */}
                  <div className="lg:col-span-4 relative h-48 w-full rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={booking.serviceImage || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"}
                      alt={booking.serviceName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-purple-950 shadow-md">
                      {booking.id}
                    </div>
                  </div>

                    {/* Booking Details */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Paid ✓
                        </span>
                        
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            booking.connectionStatus === "connected"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : booking.connectionStatus === "expired"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {booking.connectionStatus === "connected"
                            ? "Connected ✓"
                            : booking.connectionStatus === "expired"
                            ? "Code Expired"
                            : "Waiting for Verification"}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-purple-950">{booking.serviceName}</h3>
                    </div>

                    {/* Companion Avatar & Revealed Contact */}
                    <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-pink-300 shrink-0 bg-pink-200 flex items-center justify-center font-bold text-purple-950">
                          {booking.providerAvatar ? (
                            <img src={booking.providerAvatar} alt={booking.providerName} className="w-full h-full object-cover" />
                          ) : (
                            booking.providerName.charAt(0)
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">Matched Companion</span>
                          <span className="text-sm font-extrabold text-purple-950">{booking.providerName}</span>
                        </div>
                      </div>

                      {/* Revealed Contact Number Post-Purchase */}
                      <div className="pt-2 border-t border-pink-200/60 flex items-center justify-between text-xs">
                        <span className="font-semibold text-purple-900/70 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-pink-600" /> Provider Contact:
                        </span>
                        <span className="font-black text-pink-600 bg-white px-2.5 py-0.5 rounded-full border border-pink-200">
                          {booking.providerPhone || "+91 98765 43210"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-purple-900/80 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-pink-500" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-pink-500" />
                        {booking.time} ({booking.duration})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-950/5 border border-purple-900/10 text-[11px] text-purple-950 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-pink-600 shrink-0" />
                      <span>Connection code sent to your registered email ({user?.email}).</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="lg:col-span-3 lg:border-l lg:border-pink-100 lg:pl-6 flex flex-col justify-between items-start lg:items-end gap-4">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-purple-900/60 font-semibold block">Total Investment</span>
                      <span className="text-3xl font-black text-purple-950">${booking.amount}</span>
                    </div>

                    <Button variant="outline" size="sm" className="w-full lg:w-auto">
                      View Details
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          /* Empty State */
          <FadeIn delay={0.4}>
            <div className="p-12 sm:p-16 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-md">
                <Calendar className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-950">No services booked yet</h3>
              <p className="text-purple-900/70 text-sm max-w-md mx-auto">
                Explore our services and find the right KoPartner for your next experience.
              </p>
              <Button href="/pricing" variant="primary" size="lg" className="mt-2" icon>
                Explore Services
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
