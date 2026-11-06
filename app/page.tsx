import React from "react";
import { HomeHero } from "@/components/hero/HomeHero";
import { StatsSection } from "@/components/sections/StatsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { GallerySection } from "@/components/gallery/GallerySection";
import { LiveCompanionsSection } from "@/components/sections/LiveCompanionsSection";
import { VideoSection } from "@/components/sections/VideoSection";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatsSection />
      <ServicesSection />
      <GallerySection />
      <LiveCompanionsSection />
      <VideoSection />
      <FAQAccordion />
      <CTASection />
    </>
  );
}
