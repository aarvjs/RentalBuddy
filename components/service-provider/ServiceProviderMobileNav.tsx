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
  X,
  Sparkles,
} from "lucide-react";
import { ProviderProfile } from "@/types/service-provider";

interface ServiceProviderMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderProfile | null;
  onLogout: () => Promise<void>;
}

export function ServiceProviderMobileNav({
  isOpen,
  onClose,
  provider,
  onLogout,
}: ServiceProviderMobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

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
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-purple-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Menu */}
      <div className="relative w-4/5 max-w-xs bg-white/95 backdrop-blur-2xl h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-r border-pink-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-pink-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-purple-950 tracking-tight">
                Provider Portal
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-purple-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/service-provider/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                      : "text-purple-950 hover:bg-pink-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-pink-500"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-pink-100 space-y-3">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-purple-950 bg-pink-50 border border-pink-200"
          >
            <LayoutDashboard className="w-4 h-4 text-pink-500" /> Customer Dashboard
          </Link>
          {provider && (
            <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-pink-200">
                {provider.photoURL ? (
                  <img src={provider.photoURL} alt={provider.fullName} className="w-full h-full object-cover" />
                ) : (
                  provider.fullName?.charAt(0)?.toUpperCase() || "P"
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-purple-950 truncate">{provider.fullName}</p>
                <p className="text-[10px] text-pink-600 truncate">{provider.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={async () => {
              onClose();
              await onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
