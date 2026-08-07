import React from "react";
import { HomeHero } from "@/components/hero/HomeHero";
import { StatsSection } from "@/components/sections/StatsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { GallerySection } from "@/components/gallery/GallerySection";
import { VideoSection } from "@/components/sections/VideoSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { FeaturedStoriesSection } from "@/components/sections/FeaturedStoriesSection";
import { TestimonialCarousel } from "@/components/slider/TestimonialCarousel";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatsSection />
      <ServicesSection />
      <GallerySection />
      <VideoSection />
      <WhyChooseUsSection />
      <HowItWorksSection />
      <FeaturedStoriesSection />
      <TestimonialCarousel />
      <FAQAccordion />
      <CTASection />
    </>
  );
}
