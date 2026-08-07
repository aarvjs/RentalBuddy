"use client";

import React, { useState } from "react";
import { FAQS } from "@/lib/data";
import { FadeIn } from "@/components/animations/Animations";
import { Sparkles, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FAQAccordion({ items = FAQS }: { items?: typeof FAQS }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-purple-50/20 via-pink-50/30 to-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight mb-4">
              Clear Answers for Your Peace of Mind
            </h2>
            <p className="text-purple-900/70 text-base sm:text-lg">
              Everything you need to know about our client discretion policies, verification standards, and concierge bookings.
            </p>
          </FadeIn>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <FadeIn key={idx} delay={idx * 0.05}>
                <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-pink-100 shadow-md shadow-purple-500/5 overflow-hidden transition-all duration-300 hover:border-pink-300">
                  <button
                    onClick={() => toggleIndex(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-purple-950 text-base sm:text-lg focus:outline-none"
                  >
                    <span>{item.question}</span>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-600"
                      }`}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-purple-900/70 text-sm leading-relaxed border-t border-pink-100/60 pt-4">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
