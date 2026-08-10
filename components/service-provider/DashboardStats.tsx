import React from "react";
import {
  ShieldCheck,
  Briefcase,
  CalendarCheck,
  IndianRupee,
  Clock,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { ProviderKycStatus } from "@/types/service-provider";

interface DashboardStatsProps {
  kycStatus: ProviderKycStatus;
  profileCompletion: number;
  totalServices: number;
  activeServices: number;
  upcomingBookings: number;
  totalEarnings: number;
  pendingRequests: number;
}

export function DashboardStats({
  kycStatus,
  profileCompletion,
  totalServices,
  activeServices,
  upcomingBookings,
  totalEarnings,
  pendingRequests,
}: DashboardStatsProps) {
  const getKycBadge = () => {
    switch (kycStatus) {
      case "approved":
        return <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Approved</span>;
      case "pending":
        return <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Under Review</span>;
      case "rejected":
        return <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">Action Required</span>;
      default:
        return <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">Not Submitted</span>;
    }
  };

  const stats = [
    {
      title: "KYC Verification",
      value: getKycBadge(),
      icon: ShieldCheck,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50/80",
    },
    {
      title: "Profile Completion",
      value: `${profileCompletion}%`,
      icon: UserCheck,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50/80",
    },
    {
      title: "Active / Total Services",
      value: `${activeServices} / ${totalServices}`,
      icon: Briefcase,
      color: "from-rose-400 to-pink-600",
      bgColor: "bg-rose-50/80",
    },
    {
      title: "Upcoming Bookings",
      value: upcomingBookings,
      icon: CalendarCheck,
      color: "from-purple-600 to-pink-500",
      bgColor: "bg-purple-50/80",
    },
    {
      title: "Total Earnings",
      value: `₹${totalEarnings.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50/80",
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50/80",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-pink-100/80 shadow-md shadow-pink-500/5 hover:border-pink-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-purple-950/70">{stat.title}</span>
              <div
                className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-purple-950 flex items-center gap-2">
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
