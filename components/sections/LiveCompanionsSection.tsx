"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export interface CompanionRequestProfile {
  id: string;
  name: string;
  secondaryName?: string;
  city: string;
  rate: number;
  status: "available" | "booked";
  windowCountdown: string;
  photoUrl: string;
  serviceId: string;
}

export const LIVE_PROFILES_DATA: CompanionRequestProfile[] = [
  {
    id: "p-1",
    name: "Rohan Malhotra",
    city: "Delhi",
    rate: 1800,
    status: "available",
    windowCountdown: "00:09:43",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
    serviceId: "movie-partner",
  },
  {
    id: "p-2",
    name: "Shaurya Verma",
    secondaryName: "శౌర్య (Shaurya)",
    city: "Hyderabad",
    rate: 1800,
    status: "booked",
    windowCountdown: "00:01:35",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    serviceId: "clubbing",
  },
  {
    id: "p-3",
    name: "Neha Verma",
    city: "Delhi",
    rate: 1600,
    status: "booked",
    windowCountdown: "00:03:28",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    serviceId: "shopping-buddy",
  },
  {
    id: "p-4",
    name: "Priya Malhotra",
    city: "Delhi",
    rate: 1800,
    status: "booked",
    windowCountdown: "00:05:20",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    serviceId: "hangingout",
  },
  {
    id: "p-5",
    name: "Aditi Sharma",
    city: "Delhi",
    rate: 2100,
    status: "booked",
    windowCountdown: "00:07:13",
    photoUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300",
    serviceId: "clubbing",
  },
  {
    id: "p-6",
    name: "Yash Kumar",
    city: "Kanpur",
    rate: 2000,
    status: "available",
    windowCountdown: "00:12:15",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
    serviceId: "movie-partner",
  },
  {
    id: "p-7",
    name: "Col. Rajesh Bakshi (Retd.)",
    secondaryName: "Senior Elder Companion",
    city: "Lucknow",
    rate: 1500,
    status: "available",
    windowCountdown: "00:14:50",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
    serviceId: "elder-care",
  },
  {
    id: "p-8",
    name: "Devendra Joshi",
    secondaryName: "Mature Conversationalist",
    city: "Kanpur",
    rate: 1500,
    status: "available",
    windowCountdown: "00:08:40",
    photoUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=300",
    serviceId: "medical-support",
  },
  {
    id: "p-9",
    name: "Sunita Deshmukh",
    secondaryName: "Culinary & Home Escort",
    city: "Pune",
    rate: 1400,
    status: "booked",
    windowCountdown: "00:04:12",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    serviceId: "domestic-help",
  },
  {
    id: "p-10",
    name: "Kabir Mehta",
    city: "Mumbai",
    rate: 2500,
    status: "available",
    windowCountdown: "00:11:05",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    serviceId: "travel-partner",
  },
];

export function LiveCompanionsSection() {
  const [activeSeconds, setActiveSeconds] = useState(20);

  // Live ticking countdown for the header window
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSeconds((prev) => (prev > 1 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedCountdown = `00:00:${activeSeconds < 10 ? `0${activeSeconds}` : activeSeconds}`;

  const availableCount = LIVE_PROFILES_DATA.filter((p) => p.status === "available").length;

  return (
    <section className="py-12 bg-[#FAF8F9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Card Container matching reference image */}
        <div className="rounded-[2rem] bg-white border border-[#F1E4E8] shadow-xl shadow-pink-900/5 p-6 sm:p-10 space-y-6">
          {/* Top Section Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#9F1239]">
                LIVE REQUEST WINDOW
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A0E35] tracking-tight">
                Profiles Currently Accepting Booking Requests
              </h2>
              <p className="text-xs sm:text-sm text-[#4A154B]/70 leading-relaxed">
                Check the current hourly request window, view the displayed companion rate, and open a profile to send your booking request.
              </p>
            </div>

            {/* Top Right Live Status Pill Card */}
            <div className="shrink-0 p-4 rounded-2xl bg-white border border-[#EAD5DC] shadow-sm flex flex-col gap-1 min-w-[240px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold tracking-wider">LIVE</span>
              </div>
              <p className="text-xs font-black text-[#2A0E35]">
                {availableCount} profiles accepting requests now
              </p>
              <p className="text-[10px] text-[#4A154B]/60 font-medium">
                Next profile window opens in {formattedCountdown}
              </p>
            </div>
          </div>

          {/* Profiles Rows List with Scrollable Container */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-50/50">
            {LIVE_PROFILES_DATA.map((profile) => (
              <div
                key={profile.id}
                className="rounded-2xl bg-white border border-[#F3E7EC] hover:border-[#DDA7B8] shadow-2xs hover:shadow-sm transition-all p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
              >
                {/* 1. Profile Avatar & Name */}
                <div className="flex items-center gap-3.5 min-w-[200px] sm:min-w-[240px]">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-pink-200 bg-pink-100">
                      <Image
                        src={profile.photoUrl}
                        alt={profile.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          profile.status === "available" ? "bg-emerald-500" : "bg-[#B91C1C]"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          profile.status === "available" ? "text-emerald-700" : "text-[#B91C1C]"
                        }`}
                      >
                        {profile.status === "available" ? "CLIENT AVAILABLE" : "CLIENT BOOKED"}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#2A0E35] truncate">
                      {profile.name}
                    </h3>
                    <p className="text-[11px] text-[#4A154B]/60 font-medium">
                      {profile.city}
                    </p>
                  </div>
                </div>

                {/* 2. Expected Earning / Rate */}
                <div className="md:text-left min-w-[130px] border-t md:border-t-0 pt-2 md:pt-0 border-pink-100/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#9F1239] block">
                    EXPECTED EARNING
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#2A0E35]">
                    ₹{profile.rate.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#4A154B]/60 block font-medium">
                    Earning / 1 hour
                  </span>
                </div>

                {/* 3. Availability Status Pill & Window Countdown */}
                <div className="min-w-[180px] space-y-1">
                  {profile.status === "available" ? (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-extrabold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>OPEN</span>
                      </div>
                      <p className="text-[10px] text-[#4A154B]/60 font-medium">
                        OPEN • Closes in {profile.windowCountdown}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E6EB] text-[#701A39] border border-[#E5C2CE] text-[11px] font-extrabold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#701A39]" />
                        <span>COMPANION BOOKED</span>
                      </div>
                      <p className="text-[10px] text-[#4A154B]/60 font-medium">
                        BOOKED • Next window opens in {profile.windowCountdown}
                      </p>
                    </>
                  )}
                </div>

                {/* 4. Action CTA Button */}
                <div className="shrink-0 flex items-center">
                  {profile.status === "available" ? (
                    <Link
                      href={`/services/${profile.serviceId}`}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#701A39] hover:bg-[#831843] text-white font-extrabold text-xs shadow-xs hover:shadow-md transition-all text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <span>Request Booking</span>
                      <span>→</span>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#A2677C] text-white font-extrabold text-xs cursor-not-allowed opacity-90 inline-flex items-center justify-center gap-1.5"
                    >
                      <span>Booked</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
