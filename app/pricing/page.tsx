"use client";

import React, { useState } from "react";
import { PageHero } from "@/components/hero/PageHero";
import { PRICING_TIERS } from "@/lib/constants";
import { PricingCard } from "@/components/cards/Cards";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";
import { CTASection } from "@/components/sections/CTASection";
import { ShieldCheck } from "lucide-react";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <PageHero
        badge="Privé Memberships"
        title="Invest in Flawless Social Experiences"
        subtitle="Choose from our signature membership tiers or request bespoke companion lifestyle packages."
        breadcrumb="Pricing"
        bgImageUrl="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1800"
      />

      {/* Pricing Cards & Toggle */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Toggle Switch */}
          <FadeIn className="flex justify-center mb-16">
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-pink-100/70 border border-pink-200 backdrop-blur-md">
              <button
                onClick={() => setAnnual(false)}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  !annual
                    ? "bg-white text-purple-950 shadow-sm shadow-pink-500/10"
                    : "text-purple-900/60 hover:text-pink-600"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  annual
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25"
                    : "text-purple-900/60 hover:text-pink-600"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] uppercase tracking-wider font-extrabold">
                  Save 20%
                </span>
              </button>
            </div>
          </FadeIn>

          {/* Pricing Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
            {PRICING_TIERS.map((tier) => {
              const price = annual ? tier.priceAnnual : tier.priceMonthly;
              const period = annual ? "month (billed annually)" : "month";

              return (
                <StaggerItem key={tier.id} className="flex">
                  <PricingCard
                    name={tier.name}
                    tagline={tier.tagline}
                    price={price}
                    period={period}
                    features={tier.features}
                    recommended={tier.recommended}
                    badge={tier.badge}
                    ctaText={tier.cta}
                  />
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Membership Guarantees */}
          <FadeIn>
            <div className="rounded-3xl p-8 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200/80 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-purple-950 text-base">
                    100% Confidentiality & Satisfaction Guarantee
                  </h4>
                  <p className="text-xs text-purple-900/70">
                    Cancel or adjust your tier at any time. Unused booking credits carry over indefinitely.
                  </p>
                </div>
              </div>
              <a
                href="/contact"
                className="px-6 py-3 rounded-full bg-white border border-pink-200 text-xs font-bold text-pink-600 hover:bg-pink-100 transition-colors shrink-0"
              >
                Inquire Special Packages
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <FAQAccordion />
      <CTASection />
    </>
  );
}
