"use client";

import React, { useState } from "react";
import { TESTIMONIALS } from "@/lib/data";
import { TestimonialCard } from "@/components/cards/Cards";
import { FadeIn } from "@/components/animations/Animations";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Member Endorsements
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight mb-4">
              Words from Discerning Clients
            </h2>
            <p className="text-purple-900/70 text-base sm:text-lg">
              Read how Amora Luxe has elevated private events, international journeys, and personal companionship.
            </p>
          </FadeIn>
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="min-h-[320px]"
            >
              <TestimonialCard
                name={TESTIMONIALS[currentIndex].name}
                role={TESTIMONIALS[currentIndex].role}
                city={TESTIMONIALS[currentIndex].city}
                avatarUrl={TESTIMONIALS[currentIndex].avatarUrl}
                rating={TESTIMONIALS[currentIndex].rating}
                quote={TESTIMONIALS[currentIndex].quote}
                occasion={TESTIMONIALS[currentIndex].occasion}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? "w-8 bg-pink-500" : "w-2.5 bg-pink-200"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-pink-50 border border-pink-200 text-purple-950 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-pink-50 border border-pink-200 text-purple-950 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
