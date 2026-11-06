"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Search, ChevronRight, ArrowRight } from "lucide-react";
import { getMasterServices, MasterServiceItem, DEFAULT_MASTER_SERVICES } from "@/lib/service-provider/provider-services";
import { SERVICES } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

export default function ServicesCatalogPage() {
  const [services, setServices] = useState<MasterServiceItem[]>(DEFAULT_MASTER_SERVICES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { profile } = useAuth();
  const currentCity = profile?.customerLocation?.city || profile?.city || "Kanpur";
  const currentLocality = profile?.customerLocation?.locality || "Panki";

  useEffect(() => {
    async function loadAllServices() {
      try {
        const list = await getMasterServices();
        if (list && list.length > 0) {
          setServices(list);
        }
      } catch (e) {
        console.warn("Could not fetch services for catalog:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAllServices();
  }, []);

  const categories = ["all", ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#FFF9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-purple-900/60 mb-6">
          <Link href="/" className="hover:text-pink-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-purple-950 font-bold">Services Directory</span>
        </nav>

        {/* Hero Section */}
        <div className="rounded-3xl bg-white border border-pink-100 shadow-xl shadow-purple-500/5 p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Verified Companion Experiences
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 tracking-tight">
                Discover Social & Lifestyle Services
              </h1>
              <p className="text-purple-900/70 text-sm sm:text-base leading-relaxed">
                Choose a specialized service to explore verified, background-approved partners matching your locality in{" "}
                <span className="font-extrabold text-purple-950">
                  {currentLocality}, {currentCity}
                </span>.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-purple-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-pink-200 bg-pink-50/40 text-xs font-bold text-purple-950 placeholder:text-purple-900/40 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-pink-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all shrink-0 capitalize ${
                  selectedCategory === cat
                    ? "bg-purple-950 text-white shadow-xs"
                    : "bg-pink-50 text-purple-950 hover:bg-pink-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredServices.map((service) => {
            const staticMatch = SERVICES.find(
              (cs) =>
                cs.id === service.id ||
                cs.title.toLowerCase() === service.serviceName.toLowerCase()
            );
            const img = service.imageUrl || staticMatch?.imageUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800";
            const serviceSlug = service.id || service.serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

            return (
              <Link
                key={service.id}
                href={`/services/${serviceSlug}`}
                className="group rounded-3xl bg-white border border-pink-100 shadow-md hover:shadow-2xl hover:border-pink-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={img}
                      alt={service.serviceName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-pink-200 text-pink-700 text-[10px] font-extrabold uppercase">
                      {service.category}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="text-lg font-extrabold text-purple-950 group-hover:text-pink-600 transition-colors">
                      {service.serviceName}
                    </h3>
                    <p className="text-purple-900/70 text-xs line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-full bg-pink-50/80 border border-pink-200 text-xs font-bold text-pink-600 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    <span>Find Partners</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
