import React from "react";
import { IndianRupee, Wallet, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";
import { EarningsSummary } from "@/types/service-provider";

interface EarningsCardProps {
  summary: EarningsSummary;
  onWithdrawClick?: () => void;
}

export function EarningsCard({ summary, onWithdrawClick }: EarningsCardProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-pink-50/50 to-purple-50/60 border border-pink-200/80 shadow-xl shadow-pink-500/5 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="p-5 rounded-2xl bg-white/80 border border-pink-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900/60 mb-2">
            <IndianRupee className="w-4 h-4 text-emerald-500" /> Total Earnings
          </div>
          <p className="text-2xl font-extrabold text-purple-950">
            ₹{summary.totalEarnings.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-100 mb-2">
            <Wallet className="w-4 h-4 text-pink-200" /> Available Balance
          </div>
          <p className="text-2xl font-extrabold">
            ₹{summary.availableBalance.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 border border-pink-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900/60 mb-2">
            <Clock className="w-4 h-4 text-amber-500" /> Pending Payouts
          </div>
          <p className="text-2xl font-extrabold text-purple-950">
            ₹{summary.pendingEarnings.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 border border-pink-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900/60 mb-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Completed Jobs
          </div>
          <p className="text-2xl font-extrabold text-purple-950">
            {summary.completedServicesCount}
          </p>
        </div>
      </div>

      {onWithdrawClick && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onWithdrawClick}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            Request Withdrawal <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
