"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Headphones,
  HeartHandshake,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { COMPARISON_DATA } from "@/lib/data";
import { StatsSection } from "@/components/sections/StatsSection";
import { PageHero } from "@/components/hero/PageHero";
import { FadeIn } from "@/components/animations/Animations";
import { CTASection } from "@/components/sections/CTASection";

export default function WhyUsPage() {
  const visualPillars = [
    {
      id: "safety",
      title: "1. Triple-Layer Vetting & Safety",
      subtitle: "Compulsory Background Checks",
      description:
        "Every companion undergoes government-issued identity verification, full background checks, and in-person behavioral etiquette interviews before placement.",
      icon: ShieldCheck,
      imageUrl:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200",
      statsBadge: "Top 3% Acceptance",
      reverse: false,
    },
    {
      id: "verified-profiles",
      title: "2. 100% Verified Profiles & Chemistry Checks",
      subtitle: "Authentic & Genuine",
      description:
        "No outdated photos or misrepresentation. We conduct video introductions prior to every outing to ensure total transparency and mutual rapport.",
      icon: UserCheck,
      imageUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200",
      statsBadge: "Real Video Introductions",
      reverse: true,
    },
    {
      id: "privacy",
      title: "3. Absolute Privacy & Swiss Encryption",
      subtitle: "Swiss 256-Bit Standards",
      description:
        "Your personal identity and transaction history are safeguarded with Swiss 256-bit encryption. All bookings are protected by non-disclosure agreements (NDAs).",
      icon: Lock,
      imageUrl:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200",
      statsBadge: "Zero Data Sharing",
      reverse: false,
    },
    {
      id: "support",
      title: "4. Dedicated Senior VIP Concierge",
      subtitle: "Personalized Protocol Officers",
      description:
        "From dress code coordination and travel logistics to custom dining reservations, a dedicated concierge officer handles every fine detail with precision.",
      icon: Headphones,
      imageUrl:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200",
      statsBadge: "Tailored Curation",
      reverse: true,
    },
    {
      id: "trust",
      title: "5. Mutual Respect & Dignity First",
      subtitle: "Comfort & Zero-Pressure Culture",
      description:
        "We foster a warm, welcoming environment built on shared dignity and judgment-free companionship, whether for casual coffee or high-profile galas.",
      icon: HeartHandshake,
      imageUrl:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200",
      statsBadge: "Ethical Standards",
      reverse: false,
    },
    {
      id: "assistance",
      title: "6. 24/7 Global Live Assistance",
      subtitle: "Always Here When You Need Us",
      description:
        "Our concierge desk operates around the clock across all major time zones, providing instant re-booking, travel itinerary adjustments, and emergency care.",
      icon: Clock,
      imageUrl:
        "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&q=80&w=1200",
      statsBadge: "< 5 Min Response Time",
      reverse: true,
    },
  ];

  return (
    <>
      {/* Light Color Overlay Hero matching Home & Pricing */}
      <PageHero
        badge="Safety & Discretion Benchmark"
        title="Built on Uncompromising Trust & Ethical Integrity"
        subtitle="Discover how Amora Luxe sets the global benchmark for client anonymity, companion safety, triple-layer verification, and round-the-clock support."
        breadcrumb="Why Us"
        bgImageUrl="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000"
      >
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            href="#safety-pillars"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
          >
            <span>Explore Safety Pillars</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3.5 rounded-full bg-white/80 hover:bg-white border border-pink-200 text-purple-950 font-bold text-sm sm:text-base backdrop-blur-md transition-all duration-300 shadow-sm"
          >
            Inquire Confidentiality
          </Link>
        </div>
      </PageHero>

      {/* 6 Visual Sections */}
      <section id="safety-pillars" className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                The Amora Luxe Guarantee
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight mb-4">
                Six Core Pillars of Client Peace of Mind
              </h2>
              <p className="text-purple-900/70 text-base sm:text-lg">
                We believe social companionship must be safe, transparent, and completely protected by legally binding privacy standards.
              </p>
            </FadeIn>
          </div>

          {visualPillars.map((pillar) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={pillar.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
                  pillar.reverse ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image Column */}
                <div
                  className={`lg:col-span-6 relative ${
                    pillar.reverse ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <FadeIn delay={0.1}>
                    <div className="relative h-[420px] sm:h-[480px] w-full rounded-3xl overflow-hidden border border-pink-100 shadow-2xl shadow-purple-500/10 group">
                      <Image
                        src={pillar.imageUrl}
                        alt={pillar.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-transparent" />

                      {/* Icon Badge on Image */}
                      <div className="absolute top-6 left-6 w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/30">
                        <IconComp className="w-7 h-7" />
                      </div>

                      {/* Pill Badge */}
                      <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-purple-950 shadow-lg">
                        ✨ {pillar.statsBadge}
                      </div>
                    </div>
                  </FadeIn>
                </div>

                {/* Content Column */}
                <div
                  className={`lg:col-span-6 space-y-6 ${
                    pillar.reverse ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <FadeIn delay={0.2}>
                    <span className="text-xs font-bold uppercase tracking-widest text-pink-600 block mb-2">
                      {pillar.subtitle}
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-purple-950 tracking-tight leading-tight mb-4">
                      {pillar.title}
                    </h3>
                    <p className="text-purple-900/80 text-base sm:text-lg leading-relaxed mb-6">
                      {pillar.description}
                    </p>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50/60 via-purple-50/40 to-white border border-pink-200/80 shadow-md">
                      <div className="flex items-center gap-3 text-purple-950 font-bold text-sm">
                        <ShieldCheck className="w-5 h-5 text-pink-600 shrink-0" />
                        <span>Every companion adheres to strict ethical non-disclosure protocols.</span>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Matrix Section */}
      <section className="py-24 bg-gradient-to-b from-white via-pink-50/30 to-purple-50/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Comparison Standard
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight mb-4">
                Amora Luxe vs. Traditional Escort Agencies
              </h2>
              <p className="text-purple-900/70 text-base sm:text-lg">
                See why discerning clients choose our curated, verified membership model.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 border-b border-pink-200">
                      <th className="p-6 text-sm font-extrabold text-purple-950 uppercase tracking-wider">
                        Service Benchmark
                      </th>
                      <th className="p-6 text-sm font-extrabold text-pink-600 uppercase tracking-wider bg-pink-100/40">
                        ✨ Amora Luxe Standard
                      </th>
                      <th className="p-6 text-sm font-extrabold text-purple-900/50 uppercase tracking-wider">
                        Unverified Agencies
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-100">
                    {COMPARISON_DATA.map((row, idx) => (
                      <tr key={idx} className="hover:bg-pink-50/50 transition-colors">
                        <td className="p-6 text-sm font-bold text-purple-950">{row.feature}</td>
                        <td className="p-6 text-sm font-bold text-pink-700 bg-pink-50/30 flex items-center gap-2">
                          <Check className="w-5 h-5 text-pink-600 shrink-0" />
                          <span>{row.amora}</span>
                        </td>
                        <td className="p-6 text-sm text-purple-900/60">
                          <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>{row.others}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <StatsSection />
      <CTASection />
    </>
  );
}
