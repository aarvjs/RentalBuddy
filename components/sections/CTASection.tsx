"use client";

import React from "react";
import { Sparkles, ShieldCheck, PhoneCall } from "lucide-react";
import { Button } from "@/components/buttons/Buttons";
import { FadeIn, GradientBlob } from "@/components/animations/Animations";

export function CTASection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <div className="relative rounded-[2.5rem] p-10 sm:p-16 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-2xl shadow-pink-500/20 overflow-hidden text-center">
            {/* Ambient Background Blobs inside CTA */}
            <GradientBlob className="w-80 h-80 bg-white/20 -top-20 -left-20" />
            <GradientBlob className="w-80 h-80 bg-purple-300/30 -bottom-20 -right-20" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider mb-6 text-white">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Invitation to Privilege
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                Ready to Experience Unmatched Elegance & Confidentiality?
              </h2>

              <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                Connect with our senior concierge today. Request private membership, view encrypted companion rosters, or plan an upcoming luxury occasion.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button href="/register" size="lg" variant="secondary" icon>
                  Apply for Privé Membership
                </Button>
                <Button
                  href="/contact"
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20 hover:text-white"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Speak to VIP Concierge
                </Button>
              </div>

              <div className="mt-10 flex items-center justify-center gap-6 text-xs text-white/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-pink-200" />
                  256-Bit Encrypted Communications
                </span>
                <span>•</span>
                <span>Immediate 24/7 Response</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
