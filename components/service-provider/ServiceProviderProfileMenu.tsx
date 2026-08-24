"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown, ShieldCheck, LayoutDashboard } from "lucide-react";
import { ProviderProfile } from "@/types/service-provider";
import { useAuth } from "@/lib/auth-context";

interface ServiceProviderProfileMenuProps {
  provider: ProviderProfile | null;
  onLogout: () => Promise<void>;
}

export function ServiceProviderProfileMenu({
  provider,
  onLogout,
}: ServiceProviderProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { profile: userProfile } = useAuth();

  const effectiveUserType = userProfile?.userType || provider?.userType || "provider";
  const isBoth = effectiveUserType === "both";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = provider?.fullName || provider?.email?.split("@")[0] || "Provider";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-white/80 border border-pink-200 shadow-sm hover:border-pink-300 transition-all focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm overflow-hidden">
          {provider?.photoURL ? (
            <img src={provider.photoURL} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            avatarLetter
          )}
        </div>
        <span className="text-xs font-extrabold text-purple-950 max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-pink-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-white/95 backdrop-blur-2xl border border-pink-200 shadow-2xl p-2 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-pink-100 mb-1">
            <p className="text-xs font-extrabold text-purple-950 truncate">{displayName}</p>
            <p className="text-[11px] text-pink-600 font-semibold truncate">{provider?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
              Provider Account
            </span>
          </div>

          <div className="space-y-0.5">
            {isBoth && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-pink-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-pink-500" />
                  <span>Customer Dashboard</span>
                </Link>
                <div className="my-1 border-t border-pink-100/80" />
              </>
            )}

            <Link
              href="/service-provider/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-pink-50 transition-colors"
            >
              <User className="w-4 h-4 text-pink-500" />
              <span>Provider Profile</span>
            </Link>

            <Link
              href="/service-provider/kyc"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-pink-50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-pink-500" />
              <span>KYC Verification</span>
            </Link>

            <Link
              href="/service-provider/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-pink-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-pink-500" />
              <span>Settings</span>
            </Link>

            <button
              onClick={async () => {
                setOpen(false);
                await onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
