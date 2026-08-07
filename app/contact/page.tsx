"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Globe,
  MessageSquare,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { Button } from "@/components/buttons/Buttons";
import { PageHero } from "@/components/hero/PageHero";
import { FadeIn } from "@/components/animations/Animations";
import { CTASection } from "@/components/sections/CTASection";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    occasion: "Movie Partner",
    destination: "New York / East Coast",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const offices = [
    { city: "New York", address: "740 Fifth Avenue, Penthouse 42", code: "+1 (800) 884-9020", status: "Open Now" },
    { city: "London", address: "14 Mayfair Square, Westminster", code: "+44 20 7946 0912", status: "Open Now" },
    { city: "Paris", address: "28 Place Vendôme, 75001 Paris", code: "+33 1 42 68 55 00", status: "Open Now" },
    { city: "Zurich", address: "Bahnhofstrasse 45, 8001 Zürich", code: "+41 44 215 30 00", status: "Open Now" },
  ];

  return (
    <>
      {/* Light Color Overlay Hero matching Home & Pricing */}
      <PageHero
        badge="Encrypted VIP Concierge Inquiry"
        title="Discreet & Immediate Concierge Assistance"
        subtitle="Connect with our senior concierge officers 24/7. Every inquiry is handled under Swiss 256-bit encryption standards."
        breadcrumb="Contact"
        bgImageUrl="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000"
      >
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            href="#inquiry-form"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start Private Inquiry</span>
          </Link>
          <a
            href={`tel:${SITE_CONFIG.contactPhone}`}
            className="px-8 py-3.5 rounded-full bg-white/80 hover:bg-white border border-pink-200 text-purple-950 font-bold text-sm sm:text-base backdrop-blur-md transition-all duration-300 inline-flex items-center gap-2 shadow-sm"
          >
            <Phone className="w-4 h-4 text-pink-500" />
            <span>{SITE_CONFIG.contactPhone}</span>
          </a>
        </div>
      </PageHero>

      {/* Main Below-Hero Contact & Form Section */}
      <section id="inquiry-form" className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-8">
              {/* Concierge Contact Cards */}
              <FadeIn delay={0.1}>
                <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-pink-50/50 to-purple-50/30 border border-pink-200/80 shadow-xl shadow-purple-500/5 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                    <h3 className="text-2xl font-bold text-purple-950">Concierge Desk</h3>
                    <div className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold uppercase tracking-wider">
                      24/7 Direct
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/20">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">
                          Encrypted VIP Email
                        </span>
                        <a
                          href={`mailto:${SITE_CONFIG.contactEmail}`}
                          className="text-purple-950 font-extrabold text-base hover:text-pink-600 transition-colors"
                        >
                          {SITE_CONFIG.contactEmail}
                        </a>
                        <p className="text-xs text-purple-900/60 mt-0.5">Swiss PGP Encryption Available</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">
                          VIP Direct Telephone
                        </span>
                        <a
                          href={`tel:${SITE_CONFIG.contactPhone}`}
                          className="text-purple-950 font-extrabold text-base hover:text-pink-600 transition-colors"
                        >
                          {SITE_CONFIG.contactPhone}
                        </a>
                        <p className="text-xs text-purple-900/60 mt-0.5">Discreet Caller ID Masking</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">
                          Global Headquarters
                        </span>
                        <p className="text-purple-900/80 text-sm font-semibold">
                          {SITE_CONFIG.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-pink-100 flex items-center gap-2 text-xs font-semibold text-purple-950">
                    <ShieldCheck className="w-5 h-5 text-pink-500 shrink-0" />
                    <span>Protected by non-disclosure legal terms.</span>
                  </div>
                </div>
              </FadeIn>

              {/* Side Lifestyle Illustration Photo Card */}
              <FadeIn delay={0.2}>
                <div className="relative h-64 w-full rounded-3xl overflow-hidden border border-pink-200/80 shadow-xl shadow-purple-500/5 group">
                  <Image
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200"
                    alt="VIP Concierge Suite"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-purple-950/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/30 backdrop-blur-md border border-pink-300/40 text-[11px] font-bold text-pink-200 mb-2">
                      <ShieldCheck className="w-3 h-3" /> Concierge Lounges
                    </div>
                    <h4 className="text-lg font-extrabold text-white">Private Appointments Available</h4>
                    <p className="text-xs text-pink-100/80">Schedule in-person consultations at our global salons.</p>
                  </div>
                </div>
              </FadeIn>

              {/* Global Offices */}
              <FadeIn delay={0.3}>
                <div className="p-8 rounded-3xl bg-white border border-pink-100 shadow-xl shadow-purple-500/5 space-y-4">
                  <h4 className="text-lg font-bold text-purple-950 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-pink-500" />
                    Private Concierge Salons
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {offices.map((office) => (
                      <div key={office.city} className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100/80 hover:border-pink-300 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-purple-950 text-sm">{office.city}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-[11px] text-purple-900/60 block">{office.address}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Premium Form Column */}
            <div className="lg:col-span-7">
              <FadeIn delay={0.2}>
                <div className="p-8 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
                      Submit Confidential Inquiry
                    </h3>
                    <Lock className="w-5 h-5 text-pink-500" />
                  </div>
                  <p className="text-purple-900/70 text-sm mb-8">
                    Specify your preferences below. A senior concierge officer will contact you within 60 minutes.
                  </p>

                  {submitted ? (
                    <div className="p-10 rounded-3xl bg-gradient-to-b from-pink-50 to-purple-50 border border-pink-300 text-center space-y-5">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-pink-500/30">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-3xl font-extrabold text-purple-950">Inquiry Confirmed</h4>
                      <p className="text-sm text-purple-900/80 max-w-md mx-auto leading-relaxed">
                        Your encrypted message has been dispatched to our senior concierge officer. Expect a discreet response shortly.
                      </p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="px-8 py-3 rounded-full bg-white border border-pink-300 text-xs font-extrabold text-pink-600 hover:bg-pink-100 transition-colors shadow-md"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                            Full Name or Alias
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Lord / Lady / Mr. / Ms."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all shadow-inner"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                            Private Email Address
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="client@private.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                            Direct Telephone / Signal
                          </label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all shadow-inner"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                            Service Category
                          </label>
                          <select
                            value={formData.occasion}
                            onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all shadow-inner"
                          >
                            <option>Movie Partner</option>
                            <option>Shopping Buddy</option>
                            <option>Hanging Out & Coffee</option>
                            <option>Elder Care Companion</option>
                            <option>Medical Escort & Support</option>
                            <option>Travel Partner</option>
                            <option>Clubbing & Nightlife Escort</option>
                            <option>Domestic Help & Host</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950 mb-2">
                          Specific Requirements & Notes
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Provide details regarding dates, locations, or companion characteristics..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-5 py-4 rounded-2xl bg-pink-50/40 border border-pink-200 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all shadow-inner"
                        />
                      </div>

                      <Button type="submit" variant="primary" size="lg" className="w-full py-4 text-base" icon>
                        Send Encrypted Request
                      </Button>
                    </form>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
