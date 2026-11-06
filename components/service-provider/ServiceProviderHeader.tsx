"use client";

import React, { useState } from "react";
import { Menu, ShieldCheck, Clock, Sparkles, Bell } from "lucide-react";
import Link from "next/link";
import { ServiceProviderProfileMenu } from "./ServiceProviderProfileMenu";
import { ProviderProfile } from "@/types/service-provider";

interface ServiceProviderHeaderProps {
  provider: ProviderProfile | null;
  onLogout: () => Promise<void>;
  onToggleMobileNav: () => void;
  title?: string;
}

export function ServiceProviderHeader({
  provider,
  onLogout,
  onToggleMobileNav,
  title = "Dashboard",
}: ServiceProviderHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-pink-100/90 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand / Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden w-9 h-9 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-purple-950 hover:bg-pink-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-pink-600" />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-purple-950 tracking-tight">
                RentasBuddy
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase tracking-wider">
                Provider Portal
              </span>
            </div>
            <p className="text-xs font-semibold text-purple-900/60 hidden sm:block">
              {title}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Notifications Bell, KYC Badge & Profile Menu */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-full bg-white/90 border border-pink-200 flex items-center justify-center text-purple-950 hover:border-pink-300 transition-all relative shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-purple-900" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-white animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white/95 backdrop-blur-2xl border border-pink-200 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-pink-100 mb-3">
                <span className="text-xs font-extrabold text-purple-950">Notifications</span>
                <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">New</span>
              </div>
              <div className="space-y-2 text-xs text-purple-900/80">
                <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
                  <p className="font-bold text-purple-950">Welcome to Provider Portal</p>
                  <p className="text-[11px] text-purple-900/60 mt-0.5">Complete your KYC verification to publish services.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KYC Status Badge */}
        {provider && (
          <Link
            href="/service-provider/kyc"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border transition-all"
            style={{
              borderColor:
                provider.kycStatus === "approved"
                  ? "#a7f3d0"
                  : provider.kycStatus === "pending"
                  ? "#fde68a"
                  : "#fbcfe8",
              backgroundColor:
                provider.kycStatus === "approved"
                  ? "#ecfdf5"
                  : provider.kycStatus === "pending"
                  ? "#fffbeb"
                  : "#fdf2f8",
              color:
                provider.kycStatus === "approved"
                  ? "#047857"
                  : provider.kycStatus === "pending"
                  ? "#b45309"
                  : "#be185d",
            }}
          >
            {provider.kycStatus === "approved" ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>KYC: {provider.kycStatus?.toUpperCase()}</span>
          </Link>
        )}

        {/* Profile Avatar & Dropdown Menu */}
        <ServiceProviderProfileMenu provider={provider} onLogout={onLogout} />
      </div>
    </header>
  );
}
