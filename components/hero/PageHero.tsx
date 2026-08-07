"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { FadeIn, GradientBlob } from "@/components/animations/Animations";

interface PageHeroProps {
  badge: string;
  title: string;
  subtitle: string;
  breadcrumb: string;
  bgImageUrl: string;
  children?: React.ReactNode;
}

export function PageHero({ badge, title, subtitle, breadcrumb, bgImageUrl, children }: PageHeroProps) {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden min-h-[480px] flex items-center justify-center">
      {/* Full-width Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImageUrl}
          alt={title}
          fill
          priority
          className="object-cover object-center scale-105 transition-transform duration-1000"
        />

        {/* Soft Light Pink & Purple Color Overlay (Matching Home Hero) */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/90 via-purple-50/80 to-pink-50/90 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-pink-100/40" />
      </div>

      {/* Decorative Blobs */}
      <GradientBlob className="w-96 h-96 bg-pink-300 top-0 left-1/4 z-0" />
      <GradientBlob className="w-80 h-80 bg-purple-300 bottom-0 right-1/4 z-0" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 text-center w-full">
        {/* Breadcrumb */}
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 text-xs font-semibold text-purple-900/70 mb-6 shadow-sm">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-pink-600 font-bold">{breadcrumb}</span>
          </div>
        </FadeIn>

        {/* Badge */}
        <FadeIn delay={0.2}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 border border-pink-200/60 backdrop-blur-md mb-4">
            <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-pink-600 to-purple-700 bg-clip-text text-transparent uppercase">
              {badge}
            </span>
          </div>
        </FadeIn>

        {/* Title */}
        <FadeIn delay={0.3}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-purple-950 tracking-tight max-w-4xl mx-auto mb-4 leading-tight">
            {title}
          </h1>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn delay={0.4}>
          <p className="text-lg sm:text-xl text-purple-900/80 max-w-2xl mx-auto leading-relaxed mb-6 font-normal">
            {subtitle}
          </p>
        </FadeIn>

        {/* Optional Action Children (Buttons/Cards) */}
        {children && <FadeIn delay={0.5}>{children}</FadeIn>}
      </div>

      {/* Curved Section Divider at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          className="relative block w-full h-10 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </section>
  );
}
