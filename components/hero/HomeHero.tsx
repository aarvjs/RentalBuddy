"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Star, ChevronDown, Award, Heart } from "lucide-react";
import { Button } from "@/components/buttons/Buttons";
import { HERO_BADGES } from "@/lib/constants";
import { FadeIn, FloatingCard, GradientBlob } from "@/components/animations/Animations";

export function HomeHero() {
  return (
    <section className="relative min-h-[90vh] w-full flex flex-col justify-between overflow-hidden pt-36 sm:pt-40 lg:pt-44 pb-16">
      {/* Fullscreen High-Res Lifestyle Hero Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Lifestyle & Companionship"
          fill
          priority
          className="object-cover object-center scale-105 transition-transform duration-1000"
        />

        {/* Soft Pink/Purple Overlay (No dark backgrounds) */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/90 via-purple-50/75 to-pink-50/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-pink-100/30" />
      </div>

      {/* Ambient Blobs */}
      <GradientBlob className="w-[500px] h-[500px] bg-pink-300 top-10 left-[-100px] z-0" />
      <GradientBlob className="w-[450px] h-[450px] bg-purple-300 bottom-10 right-[-80px] z-0" />

      {/* Hero Content Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full my-auto text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badges Row */}
          <FadeIn delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {HERO_BADGES.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-pink-200/80 text-purple-950 text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  {badge}
                </span>
              ))}
            </div>
          </FadeIn>

          {/* Minimal Headline */}
          <FadeIn delay={0.2}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-purple-950 tracking-tight leading-tight mb-4">
              Redefining <span className="gradient-text font-serif italic font-normal">Luxury</span> & Lifestyle Companionship.
            </h1>
          </FadeIn>

          {/* Short 1-2 Line Subtitle */}
          <FadeIn delay={0.3}>
            <p className="text-base sm:text-lg text-purple-900/80 max-w-xl mx-auto leading-relaxed mb-6 font-normal">
              Connect with verified social companions for dining, travel, shopping, cinema outings, and genuine care.
            </p>
          </FadeIn>

          {/* Two Primary Action CTAs */}
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Button href="/register" size="md" variant="primary" icon>
                Explore Companions
              </Button>
              <Button href="/why-us" size="md" variant="secondary">
                Why Choose Us
              </Button>
            </div>

            {/* Social Proof Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-pink-200/60 shadow-sm">
              <div className="flex -space-x-2">
                <div className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                    alt="Member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                    alt="Member"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-pink-500 text-pink-500" />
                ))}
              </div>
              <span className="text-xs text-purple-950 font-bold">
                4.98/5 Rating • 18,500+ Outings
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Floating Badges */}
        <FloatingCard delay={0} className="hidden lg:block absolute top-12 left-6 z-20">
          <div className="p-3.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-lg shadow-pink-500/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-950">100% Vetted Roster</h4>
              <p className="text-[10px] text-purple-900/60">ID & Etiquette Certified</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard delay={2} className="hidden lg:block absolute bottom-12 right-6 z-20">
          <div className="p-3.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-lg shadow-purple-500/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shrink-0">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-950">24/7 Live Concierge</h4>
              <p className="text-[10px] text-purple-900/60">Discreet Assistance</p>
            </div>
          </div>
        </FloatingCard>
      </div>

      {/* Smooth Scroll Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-6">
        <a
          href="#statistics"
          className="flex flex-col items-center gap-1.5 text-xs font-semibold text-purple-900/70 hover:text-pink-600 transition-colors group"
        >
          <span>Discover</span>
          <div className="w-7 h-7 rounded-full bg-white/90 border border-pink-200 flex items-center justify-center shadow-sm group-hover:translate-y-1 transition-transform">
            <ChevronDown className="w-3.5 h-3.5 text-pink-500" />
          </div>
        </a>
      </div>
    </section>
  );
}
