"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, ShieldCheck, Lock, Headphones, HeartHandshake, CheckCircle2 } from "lucide-react";
import { SAFETY_PILLARS, TIMELINE_STEPS } from "@/lib/constants";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";

const pillarIcons = [ShieldCheck, Lock, Headphones, HeartHandshake];

export function WhyChooseUsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-purple-50/20 via-pink-50/40 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Uncompromising Quality
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight mb-4">
              Why Discerning Clients Choose Amora
            </h2>
            <p className="text-purple-900/70 text-base sm:text-lg">
              Built on absolute discretion, rigorous background verification, and bespoke concierge management.
            </p>
          </FadeIn>
        </div>

        {/* Pillar 01 Row: Triple-Layer Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6">
            <FadeIn>
              <div className="relative rounded-[2.5rem] p-3 bg-gradient-to-tr from-pink-300 via-white to-purple-300 shadow-2xl overflow-hidden">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000"
                    alt="Vetted Social Companion"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md">
                    <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block mb-1">
                      Verification Standard
                    </span>
                    <p className="text-xs text-purple-950 font-medium">
                      Every companion undergoes identity verification, background screening, and etiquette interviews.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <FadeIn delay={0.2}>
              <span className="text-xs font-bold uppercase tracking-widest text-pink-600">
                Pillar 01
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-purple-950">
                Triple-Layer Companion Verification
              </h3>
              <p className="text-purple-900/70 text-base leading-relaxed">
                We accept only 3% of applicants. Each companion is vetted for intellectual conversation, emotional maturity, social etiquette, and genuine warmth.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-pink-100 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                  <span className="text-sm font-semibold text-purple-950">Government ID & Criminal Screening</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-pink-100 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                  <span className="text-sm font-semibold text-purple-950">In-Person Etiquette & Behavioral Assessment</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Pillar 02 Row: Riviera Coastal Getaway & Total Confidentiality */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6 lg:order-2">
            <FadeIn>
              <div className="relative rounded-[2.5rem] p-3 bg-gradient-to-tr from-purple-300 via-white to-pink-300 shadow-2xl overflow-hidden">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200"
                    alt="Riviera Coastal Getaway & Discretion"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md">
                    <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block mb-1">
                      Swiss Privacy Protocol
                    </span>
                    <p className="text-xs text-purple-950 font-medium">
                      Legally binding Non-Disclosure Agreements (NDAs) and neutral billing descriptors standard across all engagements.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-6 lg:order-1 space-y-6">
            <FadeIn delay={0.2}>
              <span className="text-xs font-bold uppercase tracking-widest text-pink-600">
                Pillar 02
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-purple-950">
                Total Confidentiality & Discretion
              </h3>
              <p className="text-purple-900/70 text-base leading-relaxed">
                Your privacy is paramount. All member records are protected under Swiss 256-bit encryption standards with zero third-party disclosure.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-pink-100 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                  <span className="text-sm font-semibold text-purple-950">Legally Binding NDAs Standard</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-pink-100 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
                  <span className="text-sm font-semibold text-purple-950">Discreet Neutral Holding Billing</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Pillars Cards Grid with Photo Headers */}
        <div className="mb-24">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAFETY_PILLARS.map((pillar, idx) => {
              const IconComponent = pillarIcons[idx] || ShieldCheck;
              return (
                <StaggerItem key={pillar.title}>
                  <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-lg shadow-purple-500/5 hover:border-pink-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                    <div className="relative h-36 w-full overflow-hidden shrink-0">
                      <Image
                        src={pillar.imageUrl}
                        alt={pillar.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-transparent" />
                      <div className="absolute -bottom-4 left-5 w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 z-10">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-6 pt-7 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-purple-950 mb-2">{pillar.title}</h4>
                        <p className="text-purple-900/70 text-xs leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Timeline Section with Photos on Cards */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
              The Four Steps to Your Moment
            </h3>
            <p className="text-purple-900/70 text-sm mt-2">
              Simple, confidential, and managed entirely by your personal concierge.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {TIMELINE_STEPS.map((step) => (
              <StaggerItem key={step.step}>
                <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-lg shadow-purple-500/5 h-full flex flex-col justify-between group hover:border-pink-300 transition-all overflow-hidden">
                  <div className="relative h-28 w-full overflow-hidden shrink-0">
                    <Image
                      src={step.imageUrl}
                      alt={step.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-4 text-3xl font-extrabold text-white font-sans drop-shadow-md">
                      {step.step}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-purple-950 mb-2">{step.title}</h4>
                      <p className="text-purple-900/70 text-xs leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-pink-100 flex items-center gap-1.5 text-[11px] font-bold text-pink-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Guaranteed Care</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
