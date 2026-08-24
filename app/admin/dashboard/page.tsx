"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  ShieldCheck,
  Calendar,
  Layers,
  IndianRupee,
  Clock,
  ArrowRight,
  Loader2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { getAllUsers } from "@/lib/admin/admin-users";
import { getAllProviders } from "@/lib/admin/admin-providers";
import { getAllKycSubmissions } from "@/lib/admin/admin-kyc";
import { getAllServicesAdmin } from "@/lib/admin/admin-services";
import { getAllBookingsAdmin } from "@/lib/admin/admin-bookings";
import { getAllInquiriesAdmin, AdminInquiry } from "@/lib/admin/admin-inquiries";
import { AdminUserListItem, AdminProviderListItem } from "@/types/admin";
import { MasterServiceItem } from "@/lib/service-provider/provider-services";
import { ProviderKyc, ProviderBooking } from "@/types/service-provider";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { EmptyState } from "@/components/service-provider/EmptyState";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [providers, setProviders] = useState<AdminProviderListItem[]>([]);
  const [kycList, setKycList] = useState<ProviderKyc[]>([]);
  const [services, setServices] = useState<MasterServiceItem[]>([]);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const [uList, pList, kList, sList, bList, iList] = await Promise.all([
          getAllUsers(),
          getAllProviders(),
          getAllKycSubmissions(),
          getAllServicesAdmin(),
          getAllBookingsAdmin(),
          getAllInquiriesAdmin(),
        ]);
        setUsers(uList);
        setProviders(pList);
        setKycList(kList);
        setServices(sList);
        setBookings(bList);
        setInquiries(iList);
      } catch (err) {
        console.error("Error loading admin dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const pendingKycCount = kycList.filter((k) => k.status === "pending").length;
  const activeServicesCount = services.filter((s) => s.status === "active").length;
  const upcomingBookingsCount = bookings.filter((b) => b.status === "upcoming").length;
  const completedBookingsCount = bookings.filter((b) => b.status === "completed").length;

  const totalRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const recentBookings = bookings.slice(0, 4);
  const pendingKycItems = kycList.filter((k) => k.status === "pending").slice(0, 3);
  const recentUsers = users.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-purple-50/60 to-pink-50/60 border border-purple-100 shadow-md">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700">
            System Administration
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950 mt-1">
            Global Management Console
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
            Live metrics across customers, service providers, KYC verifications, and revenues.
          </p>
        </div>

        {pendingKycCount > 0 && (
          <Link
            href="/admin/kyc"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-700 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:opacity-95 transition-all shrink-0 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" /> {pendingKycCount} Pending KYC Review{pendingKycCount > 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          color="from-purple-600 to-indigo-600"
          subtitle="Registered Customer Accounts"
        />
        <AdminStatCard
          title="Service Providers"
          value={providers.length}
          icon={Briefcase}
          color="from-pink-600 to-rose-600"
          subtitle="Registered Provider Partners"
        />
        <AdminStatCard
          title="Pending KYC Review"
          value={pendingKycCount}
          icon={ShieldCheck}
          color="from-amber-500 to-orange-500"
          subtitle="Verification Submissions"
        />
        <AdminStatCard
          title="Active Services"
          value={activeServicesCount}
          icon={Layers}
          color="from-rose-500 to-pink-500"
          subtitle="Published Service Offerings"
        />
        <AdminStatCard
          title="Total Bookings"
          value={bookings.length}
          icon={Calendar}
          color="from-indigo-600 to-purple-600"
          subtitle="All Time Bookings"
        />
        <AdminStatCard
          title="Upcoming Bookings"
          value={upcomingBookingsCount}
          icon={Clock}
          color="from-purple-600 to-pink-600"
          subtitle="Confirmed / In Progress"
        />
        <AdminStatCard
          title="Completed Jobs"
          value={completedBookingsCount}
          icon={ShieldCheck}
          color="from-emerald-500 to-teal-600"
          subtitle="Completed Service Runs"
        />
        <AdminStatCard
          title="Client Inquiries"
          value={inquiries.length}
          icon={MessageSquare}
          color="from-pink-500 to-purple-600"
          subtitle="Submitted Contact Forms"
        />
        <AdminStatCard
          title="Total Platform Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          color="from-emerald-600 to-teal-700"
          subtitle="Gross Completed Booking Value"
        />
      </div>

      {/* Pending KYC Action Banner */}
      {pendingKycItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-purple-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> Pending Provider KYC Submissions
            </h3>
            <Link href="/admin/kyc" className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1">
              Review All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingKycItems.map((item) => (
              <div key={item.uid} className="p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-amber-200/80 shadow-md space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {item.fullName?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-purple-950">{item.fullName}</h4>
                    <p className="text-[11px] text-purple-900/60">{item.city}, {item.state}</p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-purple-900/70">
                  Aadhaar: •••• {item.aadhaarNumber?.slice(-4)}
                </div>

                <Link
                  href="/admin/kyc"
                  className="block text-center w-full py-2 rounded-xl bg-amber-500 text-white text-xs font-extrabold shadow-sm hover:bg-amber-600 transition-colors"
                >
                  Review KYC Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings & Recent Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-purple-950">Recent Platform Bookings</h3>
            <Link href="/admin/bookings" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md overflow-hidden">
              <div className="divide-y divide-purple-100">
                {recentBookings.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-purple-950">{b.serviceName}</h4>
                      <p className="text-xs text-purple-900/60 mt-0.5">
                        Customer: {b.customerName} • Date: {b.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-purple-950 block">
                        ₹{b.amount?.toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                          b.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : b.status === "upcoming"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No Bookings Recorded"
              description="Platform bookings will be listed here in real-time."
            />
          )}
        </div>

        {/* Recent Registered Users */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-purple-950">Recent Users</h3>
            <Link href="/admin/users" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentUsers.length > 0 ? (
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md overflow-hidden">
              <div className="divide-y divide-purple-100">
                {recentUsers.map((u) => (
                  <div key={u.uid} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {u.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-purple-950">{u.fullName}</h4>
                        <p className="text-xs text-purple-900/60">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {u.userType?.toUpperCase() || "CUSTOMER"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No Users Registered"
              description="Newly registered accounts will appear here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
