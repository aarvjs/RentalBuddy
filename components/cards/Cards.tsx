"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Compass,
  Film,
  ShoppingBag,
  Coffee,
  HeartHandshake,
  Stethoscope,
  Music,
  Home,
  ShieldCheck,
  Lock,
  Headphones,
  Star,
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Compass,
  Film,
  ShoppingBag,
  Coffee,
  HeartHandshake,
  Stethoscope,
  Music,
  Home,
  ShieldCheck,
  Lock,
  Headphones,
  Heart,
};

export interface ServiceCardProps {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  imageUrl?: string;
  gradient?: string;
  borderGlow?: string;
}

export function ServiceCard({
  id,
  title,
  subtitle,
  description,
  iconName,
  imageUrl,
}: ServiceCardProps) {
  const IconComponent = iconMap[iconName] || Sparkles;
  const router = useRouter();

  const serviceSlug =
    id ||
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const serviceHref = `/services/${serviceSlug}`;

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(serviceHref);
  };

  return (
    <Link
      href={serviceHref}
      className="group relative rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100/80 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:shadow-pink-500/15 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between h-full cursor-pointer"
    >
      {/* Top Lifestyle Image Header */}
      {imageUrl && (
        <div className="relative h-44 w-full overflow-hidden shrink-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-transparent" />
          
          {/* Floating Lucide SVG Icon Badge */}
          <div className="absolute -bottom-5 left-6 w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 z-10 group-hover:scale-110 transition-transform duration-300">
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
      )}

      <div className={cn("p-6 sm:p-7 flex flex-col justify-between flex-1", imageUrl ? "pt-8" : "")}>
        <div>
          {!imageUrl && (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
              <IconComponent className="w-6 h-6" />
            </div>
          )}

          <span className="text-[11px] font-bold uppercase tracking-widest text-pink-500 mb-1 block">
            {subtitle}
          </span>
          <h3 className="text-xl font-extrabold text-purple-950 mb-2 group-hover:text-pink-600 transition-colors">
            {title}
          </h3>
          <p className="text-purple-900/70 text-xs sm:text-sm leading-relaxed mb-6">
            {description}
          </p>
        </div>

        <button
          onClick={handleAction}
          className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-full bg-pink-50/70 border border-pink-200/80 text-xs font-bold text-pink-600 group/btn hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300"
        >
          <span>Book Service</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </Link>
  );
}

export interface PricingCardProps {
  name: string;
  tagline: string;
  price: number;
  period: string;
  features: string[];
  recommended?: boolean;
  badge?: string;
  ctaText?: string;
}

export function PricingCard({
  name,
  tagline,
  price,
  period,
  features,
  recommended = false,
  badge,
  ctaText = "Select Membership",
}: PricingCardProps) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const handlePricingAction = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal(
        `Please sign in or create an account to select ${name} membership.`,
        "/contact"
      );
    } else {
      router.push("/contact");
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-3xl p-8 transition-all duration-500 flex flex-col justify-between w-full",
        recommended
          ? "bg-gradient-to-b from-white via-pink-50/60 to-purple-50/60 border-2 border-pink-400 shadow-2xl shadow-pink-500/20 scale-105 z-10"
          : "bg-white/80 backdrop-blur-xl border border-pink-100 shadow-xl shadow-purple-500/5 hover:border-pink-300"
      )}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold tracking-wider uppercase shadow-md">
          {badge}
        </div>
      )}

      <div>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-extrabold text-purple-950 mb-1">{name}</h3>
          <p className="text-xs text-purple-900/60 font-medium">{tagline}</p>
        </div>

        <div className="text-center mb-8 pb-6 border-b border-pink-100">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold text-pink-600">$</span>
            <span className="text-5xl font-black text-purple-950 tracking-tight">
              {price.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-purple-900/60">/{period}</span>
          </div>
        </div>

        <ul className="space-y-3.5 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-purple-900/80">
              <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handlePricingAction}
        className={cn(
          "w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all duration-300 shadow-md",
          recommended
            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-500/30 hover:scale-105"
            : "bg-pink-50/80 border border-pink-200 text-pink-600 hover:bg-pink-100"
        )}
      >
        {ctaText}
      </button>
    </div>
  );
}

export interface TestimonialCardProps {
  name: string;
  role: string;
  city: string;
  avatarUrl: string;
  rating: number;
  quote: string;
  occasion: string;
}

export function TestimonialCard({
  name,
  role,
  city,
  avatarUrl,
  rating,
  quote,
  occasion,
}: TestimonialCardProps) {
  return (
    <div className="rounded-3xl p-8 bg-white/90 backdrop-blur-xl border border-pink-100 shadow-xl shadow-purple-500/5 relative flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-pink-500 text-pink-500" />
          ))}
        </div>

        <p className="text-purple-950 italic text-lg leading-relaxed mb-6 font-medium">
          &quot;{quote}&quot;
        </p>
      </div>

      <div className="flex items-center gap-4 pt-6 border-t border-pink-100/60">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-pink-300 shrink-0">
          <Image src={avatarUrl} alt={name} fill sizes="48px" className="object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-purple-950 text-base">{name}</h4>
          <p className="text-xs text-pink-600 font-medium">
            {role} • {city}
          </p>
          <span className="text-[10px] text-purple-900/50 block mt-0.5">{occasion}</span>
        </div>
      </div>
    </div>
  );
}

export interface StoryCardProps {
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  imageUrl: string;
  date: string;
  authorName: string;
  authorAvatar: string;
}

export function StoryCard({
  title,
  excerpt,
  readTime,
  category,
  imageUrl,
  date,
  authorName,
  authorAvatar,
}: StoryCardProps) {
  return (
    <div className="group rounded-3xl bg-white/80 backdrop-blur-xl border border-pink-100 shadow-xl shadow-purple-500/5 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/15 flex flex-col h-full">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md border border-pink-200/50 text-xs font-bold text-pink-600 uppercase tracking-wider">
          {category}
        </div>
      </div>

      <div className="p-7 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-3 text-xs text-purple-900/60 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              {readTime}
            </span>
            <span>•</span>
            <span>{date}</span>
          </div>

          <h3 className="text-xl font-bold text-purple-950 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
            {title}
          </h3>

          <p className="text-purple-900/70 text-sm leading-relaxed line-clamp-3 mb-6">
            {excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-pink-100/60">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-pink-200">
              <Image src={authorAvatar} alt={authorName} fill sizes="32px" className="object-cover" />
            </div>
            <span className="text-xs font-semibold text-purple-950">{authorName}</span>
          </div>
          <span className="text-xs font-bold text-pink-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function TeamCard({
  name,
  role,
  bio,
  imageUrl,
}: {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}) {
  return (
    <div className="group rounded-3xl p-6 bg-white/80 backdrop-blur-xl border border-pink-100 shadow-xl shadow-purple-500/5 hover:border-pink-300 transition-all duration-300">
      <div className="relative h-72 w-full rounded-2xl overflow-hidden mb-6">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="text-xl font-bold text-purple-950 mb-1">{name}</h3>
      <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-3">
        {role}
      </p>
      <p className="text-purple-900/70 text-xs leading-relaxed">{bio}</p>
    </div>
  );
}
