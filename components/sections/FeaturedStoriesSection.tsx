"use client";

import React from "react";
import { FEATURED_STORIES } from "@/lib/data";
import { StoryCard } from "@/components/cards/Cards";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";
import { Sparkles } from "lucide-react";

export function FeaturedStoriesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-pink-50/20 to-purple-50/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Journal & Stories
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-950 tracking-tight mb-3">
              Lifestyle Journal
            </h2>
            <p className="text-purple-900/70 text-sm sm:text-base">
              Perspectives on modern companionship, travel itineraries, and social grace.
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_STORIES.map((story) => (
            <StaggerItem key={story.id}>
              <StoryCard
                title={story.title}
                excerpt={story.excerpt}
                readTime={story.readTime}
                category={story.category}
                imageUrl={story.imageUrl}
                date={story.date}
                authorName={story.author.name}
                authorAvatar={story.author.avatar}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
