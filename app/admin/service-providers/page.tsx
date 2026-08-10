"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllProviders } from "@/lib/admin/admin-providers";
import { AdminProviderListItem } from "@/types/admin";
import { AdminProviderCard } from "@/components/admin/AdminProviderCard";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { Briefcase, Loader2, Search } from "lucide-react";

export default function AdminServiceProvidersPage() {
  const [providers, setProviders] = useState<AdminProviderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadProviders() {
      try {
        const data = await getAllProviders();
        setProviders(data);
      } catch (err) {
        console.error("Failed to load providers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProviders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobileNumber?.includes(searchQuery) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKyc = kycFilter === "all" || p.kycStatus === kycFilter;
    const matchesStatus = statusFilter === "all" || p.providerStatus === statusFilter;

    return matchesSearch && matchesKyc && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Service Providers
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          View, monitor, and manage all registered RentasBuddy Service Provider partners.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider by name, city, email..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200/70 text-purple-950 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-bold focus:outline-none"
          >
            <option value="all">All KYC Statuses</option>
            <option value="pending">KYC Pending</option>
            <option value="approved">KYC Approved</option>
            <option value="rejected">KYC Rejected</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Provider List */}
      {filteredProviders.length > 0 ? (
        <div className="space-y-4">
          {filteredProviders.map((p) => (
            <AdminProviderCard key={p.uid} provider={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No Service Providers Found"
          description="No registered provider accounts match the filter criteria."
        />
      )}
    </div>
  );
}
