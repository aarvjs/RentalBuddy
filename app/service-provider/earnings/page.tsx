"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getProviderEarningsSummary } from "@/lib/service-provider/provider-earnings";
import { getProviderBookings } from "@/lib/service-provider/provider-bookings";
import { EarningsSummary, ProviderBooking } from "@/types/service-provider";
import { EarningsCard } from "@/components/service-provider/EarningsCard";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { IndianRupee, ArrowUpRight, Calendar, Loader2 } from "lucide-react";

export default function ServiceProviderEarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    completedServicesCount: 0,
  });
  const [completedBookings, setCompletedBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const [sumData, bookData] = await Promise.all([
          getProviderEarningsSummary(user.uid),
          getProviderBookings(user.uid),
        ]);
        setSummary(sumData);
        setCompletedBookings(bookData.filter((b) => b.status === "completed"));
      } catch (err) {
        console.error("Error loading earnings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEarnings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            Earnings & Revenue
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
            Real-time track of completed booking income, available balance, and pending payouts.
          </p>
        </div>

        <Link
          href="/service-provider/withdrawals"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all shrink-0"
        >
          Withdraw Funds <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <EarningsCard summary={summary} />

      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-purple-950">Completed Service Income History</h3>

        {completedBookings.length > 0 ? (
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-purple-950">
                <thead className="bg-pink-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-pink-100">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100/60">
                  {completedBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="p-4 font-semibold">{b.date}</td>
                      <td className="p-4 font-bold">{b.customerName}</td>
                      <td className="p-4">{b.serviceName}</td>
                      <td className="p-4 text-purple-900/70">{b.duration}</td>
                      <td className="p-4 text-right font-extrabold text-emerald-600">
                        +₹{b.amount?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={IndianRupee}
            title="No Completed Transactions"
            description="When you complete service bookings for customers, your earnings break down line by line here."
          />
        )}
      </div>
    </div>
  );
}
