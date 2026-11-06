"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Send, ShieldCheck, Heart, Lock, Globe, Share2, MessageCircle } from "lucide-react";
import { SITE_CONFIG, NAV_LINKS, SERVICES } from "@/lib/constants";
import { Button } from "@/components/buttons/Buttons";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-gradient-to-b from-white via-pink-50/40 to-purple-50/50 border-t border-pink-100/80 pt-20 pb-12 relative overflow-hidden text-purple-950">
      {/* Subtle Background Glows */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Top Newsletter Card */}
        <div className="rounded-3xl p-8 sm:p-12 bg-white/80 backdrop-blur-xl border border-pink-200/60 shadow-xl shadow-pink-500/5 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Private Dispatch
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-950 mb-2">
              Subscribe to Private Lifestyle Notes
            </h3>
            <p className="text-purple-900/70 text-sm">
              Receive confidential updates on new companion roster additions, exclusive gala invitations, and seasonal retreat itineraries.
            </p>
          </div>

          <div className="w-full lg:w-auto min-w-[320px] sm:min-w-[400px]">
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-pink-100/80 border border-pink-300 text-pink-700 text-sm font-semibold flex items-center gap-2 justify-center">
                <ShieldCheck className="w-5 h-5 text-pink-600" />
                Thank you. You have been added to our private dispatch list.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your private email address"
                  required
                  className="w-full px-5 py-3.5 rounded-full bg-white border border-pink-200 text-purple-950 placeholder-purple-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <Button type="submit" variant="primary" size="md">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-pink-100">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 bg-clip-text text-transparent">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-purple-900/70 text-sm leading-relaxed mb-6 max-w-sm">
              {SITE_CONFIG.description}
            </p>

            <div className="flex items-center gap-3">
              <a
                href="#global"
                className="w-9 h-9 rounded-full bg-pink-100/70 border border-pink-200 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white transition-all"
                aria-label="Global Concierge"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#community"
                className="w-9 h-9 rounded-full bg-pink-100/70 border border-pink-200 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white transition-all"
                aria-label="Private Circle"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#share"
                className="w-9 h-9 rounded-full bg-pink-100/70 border border-pink-200 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white transition-all"
                aria-label="Share Experience"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#society"
                className="w-9 h-9 rounded-full bg-pink-100/70 border border-pink-200 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white transition-all"
                aria-label="Private Society"
              >
                <Heart className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-pink-600 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-purple-900/70 hover:text-pink-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Luxury Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-pink-600 mb-4">
              Experiences
            </h4>
            <ul className="space-y-2.5">
              {SERVICES.slice(0, 5).map((service) => (
                <li key={service.id}>
                  <Link
                    href="/pricing"
                    className="text-sm text-purple-900/70 hover:text-pink-600 transition-colors"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Confidentiality & Legal */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-pink-600 mb-4">
              Confidentiality & Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/why-us"
                  className="text-sm text-purple-900/70 hover:text-pink-600 transition-colors"
                >
                  Strict NDA Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/why-us"
                  className="text-sm text-purple-900/70 hover:text-pink-600 transition-colors"
                >
                  Verification Protocol
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-purple-900/70 hover:text-pink-600 transition-colors"
                >
                  Terms of Concierge
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-purple-900/70 hover:text-pink-600 transition-colors"
                >
                  Swiss Privacy Standard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-900/60">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-pink-500" />
            <span>© {new Date().getFullYear()} {SITE_CONFIG.name}. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-1 text-purple-950 font-medium">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for Elegance & Dignity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
