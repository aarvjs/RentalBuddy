"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  Eye,
  Award,
  ArrowRight,
  CheckCircle2,
  Users,
  ChevronRight,
} from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/data";
import { TeamCard } from "@/components/cards/Cards";
import { PageHero } from "@/components/hero/PageHero";
import { FadeIn, StaggerContainer, StaggerItem, FloatingCard } from "@/components/animations/Animations";
import { CTASection } from "@/components/sections/CTASection";

export default function AboutPage() {
  const experiences = [
    {
      title: "Cafe & Casual Outings",
      desc: "Artisan coffee, park strolls, and genuine conversation in a relaxed atmosphere.",
      img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
      tag: "Social Connection",
    },
    {
      title: "Gala & Event Escort",
      desc: "Articulate companions for premieres, opera benefits, and high-society receptions.",
      img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
      tag: "High Society",
    },
    {
      title: "Travel & Resort Companionship",
      desc: "Explore coastal villas, vineyard tours, and alpine escapes together.",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
      tag: "Global Travel",
    },
    {
      title: "Gentle Elder Care Support",
      desc: "Respectful, attentive company, walk support, and active listening for cherished seniors.",
      img: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
      tag: "Compassionate Care",
    },
  ];

  return (
    <>
      {/* Light Color Overlay Hero matching Home & Pricing */}
      <PageHero
        badge="Heritage & Leadership • Est. 2020"
        title="Pioneering Modern Social Companionship with Grace & Dignity"
        subtitle="Curating elevated social, event, and lifestyle experiences for distinguished individuals across global financial and cultural capitals."
        breadcrumb="About Us"
        bgImageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000"
      >
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            href="#our-story"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
          >
            <span>Discover Our Story</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/why-us"
            className="px-8 py-3.5 rounded-full bg-white/80 hover:bg-white border border-pink-200 text-purple-950 font-bold text-sm sm:text-base backdrop-blur-md transition-all duration-300 shadow-sm"
          >
            Why RentasBuddy
          </Link>
        </div>
      </PageHero>

      {/* SECTION 1: Story & Heritage (Alternate Image/Content Layout) */}
      <section id="our-story" className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Image Column with Floating Stat Badge */}
            <div className="lg:col-span-6 relative">
              <FadeIn delay={0.1}>
                <div className="relative h-[480px] sm:h-[540px] w-full rounded-3xl overflow-hidden border border-pink-100 shadow-2xl shadow-purple-500/10">
                  <Image
                    src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1200"
                    alt="Authentic Companionship & Interaction"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-transparent" />
                </div>
              </FadeIn>

              {/* Floating Stat Card */}
              <FloatingCard delay={0.3} className="absolute -bottom-6 -right-4 sm:bottom-6 sm:-right-6 z-10">
                <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-xl border border-pink-200 shadow-2xl max-w-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/30">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-purple-950">1,250+</div>
                      <div className="text-xs font-semibold text-purple-900/70">
                        Vetted Global Companions
                      </div>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </div>

            {/* Right Text Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <FadeIn delay={0.2}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Our Story & Heritage
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-purple-950 tracking-tight leading-tight">
                  Redefining Social Companionship for the Modern Era
                </h2>
                <p className="text-purple-900/80 text-base sm:text-lg leading-relaxed pt-2">
                  Founded with the vision to eliminate social isolation and awkward solo attendance, RentasBuddy curates articulate, culturally fluent, and elegant companions for every milestone occasion.
                </p>
                <p className="text-purple-900/70 text-sm sm:text-base leading-relaxed">
                  Whether attending an international film festival, hosting an executive dinner, exploring boutique art galleries, or seeking respectful companionship for a senior family member, our concierge ensures absolute discretion and warmth.
                </p>
              </FadeIn>

              {/* Key Highlights List */}
              <FadeIn delay={0.3}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-pink-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-purple-950">
                      Swiss 256-Bit Anonymity Standard
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-purple-950">
                      Triple-Layer Companion Vetting
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-purple-950">
                      24/7 VIP Concierge Support
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-purple-950">
                      Global City & Resort Coverage
                    </span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Mission, Vision, Core Values (3 Premium Cards) */}
      <section className="py-24 bg-gradient-to-b from-white via-pink-50/40 to-purple-50/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Guiding Principles
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight mb-4">
                Our Mission, Vision & Core Values
              </h2>
              <p className="text-purple-900/70 text-base sm:text-lg">
                Every connection curated by RentasBuddy is anchored in strict ethical integrity, emotional intelligence, and mutual dignity.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={0.1}>
              <div className="p-8 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:border-pink-300 transition-all duration-300 h-full flex flex-col justify-between group">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform">
                    <Compass className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-950 mb-3">Our Mission</h3>
                  <p className="text-purple-900/75 text-sm sm:text-base leading-relaxed">
                    To eliminate isolation and awkward solo attendance by matching clients with articulate, vetted, and culturally fluent companions suited to any social occasion.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-pink-100 text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-2">
                  <span>Authentic Connection</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="p-8 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:border-pink-300 transition-all duration-300 h-full flex flex-col justify-between group">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white mb-8 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                    <Eye className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-950 mb-3">Our Vision</h3>
                  <p className="text-purple-900/75 text-sm sm:text-base leading-relaxed">
                    To set the global benchmark for professional social escorting, establishing unmatched standards for privacy, emotional warmth, and bespoke event curation.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-pink-100 text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-2">
                  <span>Global Benchmark</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="p-8 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:border-pink-300 transition-all duration-300 h-full flex flex-col justify-between group">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-950 mb-3">Core Values</h3>
                  <p className="text-purple-900/75 text-sm sm:text-base leading-relaxed">
                    Absolute discretion above all, rigorous safety checks, genuine empathy, mutual dignity, and tailored logistics for every individual request.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-pink-100 text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-2">
                  <span>Uncompromising Integrity</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 3: Curated Companion Experience Gallery */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Curated Experiences
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight mb-4">
                Tailored Companionship for Every Moment
              </h2>
              <p className="text-purple-900/70 text-base sm:text-lg">
                Explore how our companions bring warmth, grace, and engaging conversation to diverse lifestyle settings.
              </p>
            </FadeIn>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {experiences.map((item) => (
              <StaggerItem key={item.title}>
                <div className="group rounded-3xl bg-white border border-pink-100 shadow-xl shadow-purple-500/5 overflow-hidden hover:shadow-2xl hover:border-pink-300 transition-all duration-500 flex flex-col h-full">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                      {item.tag}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-xl font-bold text-purple-950 mb-2 group-hover:text-pink-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-purple-900/70 text-xs sm:text-sm leading-relaxed mb-4">
                        {item.desc}
                      </p>
                    </div>
                    <Link
                      href="/contact"
                      className="text-xs font-bold text-pink-600 hover:text-purple-950 transition-colors flex items-center gap-1"
                    >
                      Inquire Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* SECTION 4: Leadership & Executive Concierge Team */}
      <section className="py-28 bg-gradient-to-b from-white via-pink-50/30 to-purple-50/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Executive Leadership
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight mb-4">
                Meet the Concierge Leadership Team
              </h2>
              <p className="text-purple-900/70 text-base sm:text-lg">
                Our seasoned directors combine decades of experience in private aviation, luxury hospitality, diplomatic protocol, and high-security client care.
              </p>
            </FadeIn>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member) => (
              <StaggerItem key={member.name}>
                <TeamCard
                  name={member.name}
                  role={member.role}
                  bio={member.bio}
                  imageUrl={member.imageUrl}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <CTASection />
    </>
  );
}
