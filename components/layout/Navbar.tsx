"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Wallet,
  Settings,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { Button } from "@/components/buttons/Buttons";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { user, profile, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile?.fullName || user?.displayName || user?.email?.split("@")[0] || "Member";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 pt-4 pb-2 pointer-events-none transition-all duration-500">
      <div
        className={cn(
          "max-w-7xl mx-auto transition-all duration-500 pointer-events-auto rounded-full",
          scrolled
            ? "bg-white/85 backdrop-blur-xl border border-pink-200/60 shadow-lg shadow-pink-500/10 py-2.5 px-6"
            : "bg-white/30 backdrop-blur-md border border-white/40 shadow-sm py-4 px-8"
        )}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 bg-clip-text text-transparent">
                {SITE_CONFIG.name}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-pink-600 font-bold -mt-1">
                Luxury Companion
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/40 p-1.5 rounded-full border border-pink-200/40 backdrop-blur-md">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 relative",
                    isActive
                      ? "text-purple-950 font-bold"
                      : "text-purple-950/80 hover:text-pink-600 hover:bg-white/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-white/90 rounded-full shadow-sm shadow-pink-500/10 border border-pink-200/60"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              /* Logged In User Profile Avatar & Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-white/80 border border-pink-200 shadow-sm hover:border-pink-300 transition-all focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-pink-500/20 overflow-hidden">
                    {profile?.photoURL || user?.photoURL ? (
                      <img src={profile?.photoURL || user?.photoURL || ""} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      avatarLetter
                    )}
                  </div>
                  <span className="text-sm font-bold text-purple-950 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-pink-500 transition-transform", dropdownOpen ? "rotate-180" : "")} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 rounded-3xl bg-white/95 backdrop-blur-2xl border border-pink-200 shadow-2xl p-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-pink-100 mb-1">
                        <p className="text-xs font-extrabold text-purple-950 truncate">{displayName}</p>
                        <p className="text-[11px] text-pink-600 font-semibold truncate">{user.email}</p>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-pink-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-pink-500" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-pink-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-pink-500" />
                          <span>Account Settings</span>
                        </Link>

                        <Link
                          href="/bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-pink-50 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-pink-500" />
                          <span>My Bookings</span>
                        </Link>

                        <Link
                          href="/wallet"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-purple-950 hover:bg-pink-50 transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-pink-500" />
                          <span>Wallet</span>
                        </Link>

                        <button
                          onClick={async () => {
                            setDropdownOpen(false);
                            await logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Before Login CTAs */
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-purple-950/90 hover:text-pink-600 px-4 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Button href="/register" size="sm" variant="primary" icon>
                  Join / Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-pink-200 flex items-center justify-center text-purple-950 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-3 mx-2 p-6 rounded-3xl bg-white/95 backdrop-blur-2xl border border-pink-200 shadow-2xl shadow-purple-500/20 pointer-events-auto"
          >
            <div className="flex flex-col gap-3 mb-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-colors",
                      isActive
                        ? "bg-pink-100/70 text-pink-600 font-bold"
                        : "text-purple-950 hover:bg-pink-50"
                    )}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 text-pink-400" />
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-pink-100">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50 border border-pink-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold flex items-center justify-center overflow-hidden">
                      {profile?.photoURL || user?.photoURL ? (
                        <img src={profile?.photoURL || user?.photoURL || ""} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        avatarLetter
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-purple-950">{displayName}</p>
                      <p className="text-xs text-pink-600 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="py-2.5 px-4 rounded-full bg-pink-50 text-xs font-bold text-purple-950 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-pink-500" /> Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="py-2.5 px-4 rounded-full bg-pink-50 text-xs font-bold text-purple-950 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-pink-500" /> Account Settings
                  </Link>
                  <Link
                    href="/bookings"
                    className="py-2.5 px-4 rounded-full bg-pink-50 text-xs font-bold text-purple-950 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-pink-500" /> My Bookings
                  </Link>
                  <Link
                    href="/wallet"
                    className="py-2.5 px-4 rounded-full bg-pink-50 text-xs font-bold text-purple-950 flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4 text-pink-500" /> Wallet
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileOpen(false);
                      await logout();
                    }}
                    className="py-2.5 px-4 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Button href="/login" variant="secondary" className="w-full">
                    Sign In
                  </Button>
                  <Button href="/register" variant="primary" className="w-full" icon>
                    Join / Register
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
