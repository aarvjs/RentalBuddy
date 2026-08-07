"use client";

import React from "react";
import { TRUST_STATS } from "@/lib/constants";
import { AnimatedCounter, FadeIn } from "@/components/animations/Animations";

export function StatsSection() {
  return (
    <section id="statistics" className="py-20 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 border border-pink-200/70 backdrop-blur-xl shadow-xl shadow-pink-500/5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {TRUST_STATS.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-purple-950 tracking-tight mb-2 font-sans">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-pink-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
