"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  Calendar,
  Layers,
  CreditCard,
  ArrowUpRight,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  X,
  MessageSquare,
} from "lucide-react";
import { AdminProfile } from "@/types/admin";

interface AdminSidebarProps {
  admin: AdminProfile | null;
  onLogout: () => Promise<void>;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ admin, onLogout, isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Service Providers", href: "/admin/providers", icon: Briefcase },
    { name: "KYC Verification", href: "/admin/kyc", icon: ShieldCheck },
    { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Services", href: "/admin/services", icon: Layers },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowUpRight },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-2xl border-r border-purple-100 flex flex-col justify-between p-5 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-purple-950 tracking-tight">
                RentasBuddy
              </span>
              <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider -mt-1">
                Admin Console
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-950"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20"
                    : "text-purple-950/80 hover:text-purple-950 hover:bg-purple-50/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-purple-600"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Mini Card & Logout */}
      <div className="pt-4 border-t border-purple-100 space-y-3">
        {admin && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {admin.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-extrabold text-purple-950 truncate">{admin.fullName}</p>
              <p className="text-[10px] text-purple-600 font-semibold truncate">{admin.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-100 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Logout Admin</span>
        </button>
      </div>
    </aside>
  );
}
