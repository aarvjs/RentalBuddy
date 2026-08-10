"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, Shield, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { AdminProfile } from "@/types/admin";

interface AdminTopbarProps {
  admin: AdminProfile | null;
  onLogout: () => Promise<void>;
  onToggleMobileNav: () => void;
  title?: string;
  subtitle?: string;
}

export function AdminTopbar({
  admin,
  onLogout,
  onToggleMobileNav,
  title = "Dashboard",
  subtitle = "RentasBuddy Administration Portal",
}: AdminTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = admin?.fullName || admin?.email?.split("@")[0] || "Admin";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-purple-100/90 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden w-9 h-9 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-950 hover:bg-purple-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 text-purple-700" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-purple-950 tracking-tight">
              {title}
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Admin
            </span>
          </div>
          <p className="text-xs font-semibold text-purple-900/50 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Notifications & Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-full bg-white border border-purple-200 flex items-center justify-center text-purple-950 hover:border-purple-300 transition-all shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-purple-900" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-white animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white/95 backdrop-blur-2xl border border-purple-200 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-purple-100 mb-3">
                <span className="text-xs font-extrabold text-purple-950">Admin Alerts</span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="space-y-2 text-xs text-purple-900/80">
                <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                  <p className="font-bold text-purple-950">System Initialized</p>
                  <p className="text-[11px] text-purple-900/60 mt-0.5">Admin portal controls are ready for monitoring users and providers.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-white/80 border border-purple-200 shadow-sm hover:border-purple-300 transition-all focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm overflow-hidden">
              {avatarLetter}
            </div>
            <span className="text-xs font-extrabold text-purple-950 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-purple-600 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-white/95 backdrop-blur-2xl border border-purple-200 shadow-2xl p-2 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-purple-100 mb-1">
                <p className="text-xs font-extrabold text-purple-950 truncate">{displayName}</p>
                <p className="text-[11px] text-purple-600 font-semibold truncate">{admin?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  System Administrator
                </span>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-purple-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span>Account Settings</span>
                </Link>

                <button
                  onClick={async () => {
                    setDropdownOpen(false);
                    await onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
