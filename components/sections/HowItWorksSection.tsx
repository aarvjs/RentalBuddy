"use client";

import React from "react";
import { Sparkles, Calendar, UserCheck, MessageCircleHeart, Sparkle } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";

const processSteps = [
  {
    num: "01",
    title: "Select Experience",
    desc: "Browse our curated offerings from gala escorts to yacht retreats or specify a custom request.",
    icon: Calendar,
  },
  {
    num: "02",
    title: "Vetted Matching",
    desc: "Concierge handselects candidates aligned with your intellectual and aesthetic preferences.",
    icon: UserCheck,
  },
  {
    num: "03",
    title: "Private Consultation",
    desc: "Review encrypted portfolios and conduct optional pre-event video introductions.",
    icon: MessageCircleHeart,
  },
  {
    num: "04",
    title: "Impeccable Realization",
    desc: "Relax as our 24/7 background concierge handles reservations, transfers, and security.",
    icon: Sparkle,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Seamless Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-950 tracking-tight mb-3">
              How RentasBuddy Works
            </h2>
            <p className="text-purple-900/70 text-sm sm:text-base">
              Four simple, confidential steps to arrange your companion experience.
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Background Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-pink-300 via-purple-300 to-rose-300 -translate-y-6 z-0 opacity-40" />

          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.num} className="relative z-10">
                <div className="p-8 rounded-3xl bg-gradient-to-b from-white to-pink-50/40 border border-pink-100 shadow-xl shadow-purple-500/5 hover:border-pink-300 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center group h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-1">
                    Step {step.num}
                  </span>
                  <h3 className="text-xl font-bold text-purple-950 mb-3">{step.title}</h3>
                  <p className="text-purple-900/70 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
