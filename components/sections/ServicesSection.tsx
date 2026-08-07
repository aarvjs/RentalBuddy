"use client";

import React, { useState } from "react";
import { SERVICES } from "@/lib/constants";
import { ServiceCard } from "@/components/cards/Cards";
import { FadeIn } from "@/components/animations/Animations";
import { Sparkles, ChevronLeft, ChevronRight, LayoutGrid, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ServicesSection() {
  const [viewMode, setViewMode] = useState<"grid" | "slider">("slider");
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SERVICES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Tailored Companion Services
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight">
                Designed for Everyday & Special Moments
              </h2>
            </FadeIn>
          </div>

          {/* View Mode Toggle Controls */}
          <FadeIn delay={0.2} className="flex items-center gap-3 shrink-0">
            <div className="flex items-center p-1 rounded-full bg-pink-100/70 border border-pink-200">
              <button
                onClick={() => setViewMode("slider")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewMode === "slider"
                    ? "bg-white text-purple-950 shadow-sm"
                    : "text-purple-900/60 hover:text-pink-600"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Slider</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-purple-950 shadow-sm"
                    : "text-purple-900/60 hover:text-pink-600"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            {viewMode === "slider" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-purple-950 hover:bg-pink-500 hover:text-white transition-colors"
                  aria-label="Previous Service"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-purple-950 hover:bg-pink-500 hover:text-white transition-colors"
                  aria-label="Next Service"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </FadeIn>
        </div>

        {/* Content Display: Slider vs Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                subtitle={service.subtitle}
                description={service.description}
                iconName={service.icon}
                imageUrl={service.imageUrl}
                gradient={service.gradient}
              />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {Array.from({ length: 4 }).map((_, offset) => {
                  const itemIndex = (activeSlide + offset) % SERVICES.length;
                  const service = SERVICES[itemIndex];
                  return (
                    <ServiceCard
                      key={service.id}
                      title={service.title}
                      subtitle={service.subtitle}
                      description={service.description}
                      iconName={service.icon}
                      imageUrl={service.imageUrl}
                      gradient={service.gradient}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-2 mt-10">
              {SERVICES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeSlide === idx ? "w-8 bg-pink-500" : "w-2 bg-pink-200"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
