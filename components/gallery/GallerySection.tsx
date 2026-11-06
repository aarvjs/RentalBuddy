"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Maximize2, X } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";
import { AnimatePresence, motion } from "framer-motion";

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  aspectRatio: string;
  caption: string;
  tag: string;
}

export const RICH_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g-1",
    title: "Artisan Coffee & Conversation",
    imageUrl:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[3/4]",
    caption: "Morning espresso and friendly dialogue at a Parisian café",
    tag: "Coffee Meetup",
  },
  {
    id: "g-2",
    title: "Boutique Shopping Together",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[4/3]",
    caption: "Personal styling and boutique browsing",
    tag: "Shopping Buddy",
  },
  {
    id: "g-3",
    title: "Riviera Coastal Getaway",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[3/4]",
    caption: "Private boat charter and coastal getaway along Amalfi",
    tag: "Travel Escort",
  },
  {
    id: "g-4",
    title: "Cinema Premiere Outing",
    imageUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[16/10]",
    caption: "Exclusive film screening and evening theater",
    tag: "Movie Partner",
  },
  {
    id: "g-5",
    title: "Gala Evening Splendor",
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[4/5]",
    caption: "Red carpet elegance at the annual charity benefit gala",
    tag: "High Society",
  },
  {
    id: "g-6",
    title: "Elder Care Walk & Comfort",
    imageUrl:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-square",
    caption: "Gentle afternoon walks and attentive listening support",
    tag: "Elder Care",
  },
  {
    id: "g-7",
    title: "City Strolls & Laughter",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[3/4]",
    caption: "Friendly strolls through downtown parks",
    tag: "Hanging Out",
  },
  {
    id: "g-8",
    title: "Healthcare Appointment Escort",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[4/3]",
    caption: "Compassionate medical appointment accompaniment",
    tag: "Medical Support",
  },
  {
    id: "g-9",
    title: "VIP Lounge & Nightlife",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[3/4]",
    caption: "Vibrant music event and private lounge escort",
    tag: "Clubbing",
  },
  {
    id: "g-10",
    title: "Michelin Fine Dining",
    imageUrl:
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[4/5]",
    caption: "Exquisite culinary journeys in Tokyo",
    tag: "Fine Dining",
  },
  {
    id: "g-11",
    title: "Home Dinner Gathering",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[16/10]",
    caption: "Gracious hospitality and home event hosting support",
    tag: "Domestic Host",
  },
  {
    id: "g-12",
    title: "Fireside Retreat & Warmth",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
    aspectRatio: "aspect-[3/4]",
    caption: "Meaningful dialogues by the fireside",
    tag: "Friendship",
  },
];

export function GallerySection() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-pink-50/30 to-purple-50/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Lively Gallery
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-950 tracking-tight mb-3">
              Companion Moments & Lifestyle
            </h2>
            <p className="text-purple-900/70 text-xs sm:text-sm">
              Explore authentic glimpses of coffee meetups, shopping trips, cinema premiere nights, elder care, and travel escapes.
            </p>
          </FadeIn>
        </div>

        {/* Rich Pinterest / Masonry Layout (4-5 columns desktop, 3 tablet, 2 mobile side-by-side) */}
        <StaggerContainer className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {RICH_GALLERY_ITEMS.map((item) => (
            <StaggerItem key={item.id} className="break-inside-avoid mb-3 sm:mb-4">
              <div
                onClick={() => setSelectedItem(item)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-pink-100/80 shadow-md shadow-purple-500/5 cursor-pointer hover:shadow-xl hover:shadow-pink-500/15 transition-all duration-500"
              >
                <div className={`relative w-full ${item.aspectRatio} overflow-hidden`}>
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-pink-200 text-[10px] sm:text-xs font-bold text-pink-600 shadow-sm">
                    {item.tag}
                  </div>

                  {/* Glass Caption */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 sm:p-3 rounded-xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-md translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-purple-950 text-xs line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-purple-900/70 line-clamp-1">{item.caption}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 ml-1">
                      <Maximize2 className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-purple-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-3xl overflow-hidden bg-white shadow-2xl border border-pink-200"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 border border-pink-200 text-purple-950 flex items-center justify-center hover:bg-pink-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
              </div>

              <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block mb-1">
                    {selectedItem.tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-purple-950">{selectedItem.title}</h3>
                  <p className="text-xs sm:text-sm text-purple-900/70">{selectedItem.caption}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
