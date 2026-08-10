"use client";

import React, { useState, useEffect } from "react";
import { getAllUsers } from "@/lib/admin/admin-users";
import { getAllProviders } from "@/lib/admin/admin-providers";
import { getAllBookingsAdmin } from "@/lib/admin/admin-bookings";
import { getAllServicesAdmin } from "@/lib/admin/admin-services";
import { BarChart3, TrendingUp, Users, Calendar, IndianRupee, Layers, Loader2 } from "lucide-react";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    providerCount: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalServices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    async function loadReportsData() {
      try {
        const [users, providers, bookings, services] = await Promise.all([
          getAllUsers(),
          getAllProviders(),
          getAllBookingsAdmin(),
          getAllServicesAdmin(),
        ]);

        const completed = bookings.filter((b) => b.status === "completed");
        const rev = completed.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

        setStats({
          userCount: users.length,
          providerCount: providers.length,
          totalBookings: bookings.length,
          completedBookings: completed.length,
          totalServices: services.length,
          totalRevenue: rev,
        });
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReportsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Business Reports & Analytics
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          High-level performance metrics, revenue aggregate reports, and growth indicators.
        </p>
      </div>

      {/* Summary Stat Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Growth Report */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <h3 className="font-extrabold text-base text-purple-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Account Breakdown
            </h3>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-0.5 rounded-full">
              Live Ratio
            </span>
          </div>

          <div className="space-y-4 text-xs font-semibold text-purple-950">
            <div>
              <div className="flex justify-between mb-1">
                <span>Customer Accounts</span>
                <span>{stats.userCount}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-purple-100 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${Math.min(100, (stats.userCount / (stats.userCount + stats.providerCount || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Service Provider Accounts</span>
                <span>{stats.providerCount}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-pink-100 overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.providerCount / (stats.userCount + stats.providerCount || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Fulfillment Report */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <h3 className="font-extrabold text-base text-purple-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-500" /> Booking Fulfillment Rate
            </h3>
            <span className="text-xs font-bold text-pink-700 bg-pink-100 px-3 py-0.5 rounded-full">
              Fulfillment
            </span>
          </div>

          <div className="space-y-4 text-xs font-semibold text-purple-950">
            <div>
              <div className="flex justify-between mb-1">
                <span>Completed Service Jobs</span>
                <span>{stats.completedBookings} / {stats.totalBookings}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.completedBookings / (stats.totalBookings || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-purple-900/60 font-medium leading-relaxed text-[11px]">
              Fulfillment rate measures successful service execution by verified companion providers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
