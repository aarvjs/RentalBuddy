"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getProviderProfile } from "@/lib/service-provider/provider-auth";
import { getProviderServices } from "@/lib/service-provider/provider-services";
import { getProviderBookings } from "@/lib/service-provider/provider-bookings";
import { getProviderEarningsSummary } from "@/lib/service-provider/provider-earnings";
import { ProviderProfile, ProviderService, ProviderBooking, EarningsSummary } from "@/types/service-provider";
import { DashboardStats } from "@/components/service-provider/DashboardStats";
import { KycStatusCard } from "@/components/service-provider/KycStatusCard";
import { BookingCard } from "@/components/service-provider/BookingCard";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { Plus, ArrowRight, Calendar, Briefcase, Loader2 } from "lucide-react";

export default function ServiceProviderDashboardPage() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    completedServicesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const [profData, srvData, bookData, earnData] = await Promise.all([
          getProviderProfile(user.uid),
          getProviderServices(user.uid),
          getProviderBookings(user.uid),
          getProviderEarningsSummary(user.uid),
        ]);

        setProfile(profData);
        setServices(srvData);
        setBookings(bookData);
        setEarnings(earnData);
      } catch (err) {
        console.error("Error loading provider dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  const providerName = profile?.fullName || auth.currentUser?.displayName || "Provider";

  // Calculate profile completion percentage
  let profileScore = 40; // Base score for account creation
  if (profile?.mobileNumber) profileScore += 15;
  if (profile?.address && profile?.city) profileScore += 15;
  if (profile?.photoURL) profileScore += 15;
  if (profile?.kycStatus === "approved" || profile?.kycStatus === "pending") profileScore += 15;

  const activeServicesCount = services.filter((s) => s.status === "active").length;
  const upcomingBookingsCount = bookings.filter((b) => b.status === "upcoming").length;
  const pendingRequestsCount = bookings.filter((b) => b.status === "pending").length;

  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-pink-50/60 to-purple-50/60 border border-pink-100 shadow-md">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-pink-600">
            Console Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950 mt-1">
            Welcome back, {providerName}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
            Here is your live service status, earnings, and booking activities.
          </p>
        </div>

        {profile?.kycStatus === "approved" ? (
          <Link
            href="/service-provider/services"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all shrink-0"
          >
            <Briefcase className="w-4 h-4" /> Manage My Services
          </Link>
        ) : (
          <Link
            href="/service-provider/kyc"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all shrink-0"
          >
            Complete KYC to Enable Services
          </Link>
        )}
      </div>

      {/* KYC Status Card Banner */}
      <KycStatusCard status={profile?.kycStatus || "not_submitted"} />

      {/* Metric Stats Cards */}
      <DashboardStats
        kycStatus={profile?.kycStatus || "not_submitted"}
        profileCompletion={profileScore}
        totalServices={services.length}
        activeServices={activeServicesCount}
        upcomingBookings={upcomingBookingsCount}
        totalEarnings={earnings.totalEarnings}
        pendingRequests={pendingRequestsCount}
      />

      {/* Recent Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-purple-950">Recent Bookings</h3>
          {bookings.length > 0 && (
            <Link
              href="/service-provider/bookings"
              className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recentBookings.length > 0 ? (
          <div className="space-y-4">
            {recentBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Bookings Yet"
            description="When customers book your published services, their booking requests will appear right here."
          />
        )}
      </div>
    </div>
  );
}
