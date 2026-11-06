"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Sparkles, X, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AnimatePresence, motion } from "framer-motion";

export function AuthModal() {
  const { authModalOpen, authModalMessage, returnUrl, closeAuthModal } = useAuth();
  const currentPath = usePathname();

  if (!authModalOpen) return null;

  const targetRedirect = returnUrl || currentPath;
  const loginHref = `/login?redirect=${encodeURIComponent(targetRedirect)}`;
  const registerHref = `/register?type=customer&redirect=${encodeURIComponent(targetRedirect)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-purple-950/60 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-2xl border border-pink-200/90 shadow-2xl p-8 z-10 text-center overflow-hidden"
        >
          {/* Accent glow top */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-purple-950 hover:bg-pink-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-500/25">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Book Service Access
          </div>

          <h3 className="text-2xl font-extrabold text-purple-950 mb-2">
            Sign in to book this service
          </h3>

          <p className="text-purple-900/75 text-sm leading-relaxed mb-8">
            {authModalMessage || "Create an account or sign in to continue with your booking."}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href={loginHref}
              onClick={closeAuthModal}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>

            <Link
              href={registerHref}
              onClick={closeAuthModal}
              className="w-full py-3.5 px-6 rounded-full bg-pink-50 border border-pink-200 text-purple-950 font-extrabold text-sm hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-pink-500" />
              <span>Create Customer Account</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
