"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Briefcase,
  Calendar,
  IndianRupee,
  Wallet,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { ProviderProfile } from "@/types/service-provider";

interface ServiceProviderSidebarProps {
  provider: ProviderProfile | null;
  onLogout: () => Promise<void>;
}

export function ServiceProviderSidebar({ provider, onLogout }: ServiceProviderSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: "Dashboard", href: "/service-provider/dashboard", icon: LayoutDashboard },
    { name: "My Services", href: "/service-provider/services", icon: Briefcase },
    { name: "Bookings", href: "/service-provider/bookings", icon: Calendar },
    { name: "Earnings", href: "/service-provider/earnings", icon: IndianRupee },
    { name: "Withdrawals", href: "/service-provider/withdrawals", icon: Wallet },
    { name: "Profile", href: "/service-provider/profile", icon: User },
    { name: "KYC Verification", href: "/service-provider/kyc", icon: ShieldCheck, badge: provider?.kycStatus },
    { name: "Settings", href: "/service-provider/settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white/80 backdrop-blur-2xl border-r border-pink-100 z-40 p-5 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-pink-100/80">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg text-purple-950 tracking-tight">
            RentasBuddy
          </span>
          <span className="text-[10px] uppercase font-bold text-pink-600 tracking-wider -mt-1">
            Provider Portal
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/service-provider/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                  : "text-purple-950/80 hover:text-pink-600 hover:bg-pink-50/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-pink-500"}`} />
                <span>{item.name}</span>
              </div>

              {item.badge && !isActive && (
                <span
                  className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                    item.badge === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : item.badge === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="pt-4 border-t border-pink-100/80 space-y-3">
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-purple-950 bg-pink-50 hover:bg-pink-100/80 border border-pink-200/70 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 text-pink-500" />
          <span>Customer Dashboard</span>
        </Link>

        {provider && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-pink-200">
              {provider.photoURL ? (
                <img src={provider.photoURL} alt={provider.fullName} className="w-full h-full object-cover" />
              ) : (
                provider.fullName?.charAt(0)?.toUpperCase() || "P"
              )}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-extrabold text-purple-950 truncate">{provider.fullName}</p>
              <p className="text-[10px] text-pink-600 font-semibold truncate">{provider.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-100 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
