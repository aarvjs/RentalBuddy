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
  Clock3,
  Activity,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/buttons/Buttons";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";
import { getUserBookings, BookingData } from "@/lib/firebase";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard");
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

  // Time of day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-pink-100/50 via-purple-50/30 to-[#FFF9FA]">
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
                Manage your bookings and your KoPartner experience.
              </p>
            </div>

            {/* Profile Avatar on Right */}
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

        {/* Quick Overview (4 Compact Elegant Summary Cards) */}
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
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Link href="/wallet" className="group block">
              <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md flex items-center justify-between group-hover:border-pink-300 transition-colors">
                <div>
                  <span className="text-xs font-bold text-purple-900/60 uppercase tracking-wider block mb-1">
                    Wallet Balance
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-purple-950">
                    $1,330.00
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <WalletIcon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900/60 uppercase tracking-wider block mb-1">
                  Saved Partners
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-950">
                  0
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6" />
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Main Content Grid: Services / Bookings on Left, Recent Activity on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: My Services / Bookings */}
          <div className="lg:col-span-8 space-y-6">
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
                    Your Services
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-900/70">
                    Track your current, completed, and pending KoPartner itineraries.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 p-1 rounded-full bg-white/80 border border-pink-200 shadow-sm">
                  <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`py-2 px-3.5 rounded-full text-xs font-extrabold transition-all ${
                      activeTab === "upcoming"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                        : "text-purple-900/70 hover:text-pink-600"
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`py-2 px-3.5 rounded-full text-xs font-extrabold transition-all ${
                      activeTab === "completed"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                        : "text-purple-900/70 hover:text-pink-600"
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setActiveTab("cancelled")}
                    className={`py-2 px-3.5 rounded-full text-xs font-extrabold transition-all ${
                      activeTab === "cancelled"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                        : "text-purple-900/70 hover:text-pink-600"
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </FadeIn>

            {loadingBookings ? (
              <div className="p-12 rounded-3xl bg-white/80 border border-pink-200 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-purple-950">Fetching your service bookings...</span>
              </div>
            ) : filteredBookings.length > 0 ? (
              <StaggerContainer className="space-y-4">
                {filteredBookings.map((b) => (
                  <StaggerItem key={b.id}>
                    <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md hover:border-pink-300 transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-3 relative h-28 w-full rounded-2xl overflow-hidden shrink-0">
                        <Image src={b.serviceImage} alt={b.serviceName} fill className="object-cover" />
                      </div>
                      <div className="sm:col-span-6 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full inline-block">
                          {b.status}
                        </span>
                        <h4 className="font-extrabold text-purple-950 text-base">{b.serviceName}</h4>
                        <p className="text-xs font-semibold text-purple-900/70">
                          with <span className="text-purple-950 font-bold">{b.providerName}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-purple-900/60 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-pink-500" /> {b.date} • {b.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-pink-500" /> {b.duration}
                          </span>
                        </div>
                      </div>
                      <div className="sm:col-span-3 text-left sm:text-right space-y-2">
                        <div className="text-xl font-black text-purple-950">${b.amount}</div>
                        <Button href={`/bookings`} variant="outline" size="sm" className="w-full sm:w-auto">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              /* Beautiful Empty State */
              <FadeIn delay={0.3}>
                <div className="p-10 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-purple-950">No services booked yet</h3>
                    <p className="text-xs sm:text-sm text-purple-900/70 max-w-sm mx-auto">
                      Explore our services and find the right KoPartner for your next experience.
                    </p>
                  </div>
                  <Button href="/pricing" variant="primary" size="sm" icon>
                    Explore Services
                  </Button>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Right Column: Recent Activity */}
          <div className="lg:col-span-4 space-y-6">
            <FadeIn delay={0.3}>
              <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                  <h3 className="text-lg font-extrabold text-purple-950 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-pink-500" />
                    Recent Activity
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-purple-950">Account Profile Verified</p>
                      <p className="text-purple-900/60 text-[11px]">Swiss encryption protection active</p>
                      <span className="text-[10px] text-pink-500 font-semibold block mt-0.5">Just now</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-purple-950">Member Registration Complete</p>
                      <p className="text-purple-900/60 text-[11px]">Welcome to Amora Luxe Privé</p>
                      <span className="text-[10px] text-pink-500 font-semibold block mt-0.5">Today</span>
                    </div>
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
