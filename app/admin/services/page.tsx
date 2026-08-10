"use client";

import React, { useState, useEffect } from "react";
import { getAllServicesAdmin, updateServiceStatusAdmin } from "@/lib/admin/admin-services";
import { ProviderService, ServiceStatus } from "@/types/service-provider";
import { AdminTable } from "@/components/admin/AdminTable";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { Layers, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    async function loadServices() {
      try {
        const list = await getAllServicesAdmin();
        setServices(list);
      } catch (err) {
        console.error("Failed to load services for admin:", err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleToggleStatus = async (serviceId: string, currentStatus: ServiceStatus) => {
    const nextStatus: ServiceStatus = currentStatus === "paused" ? "active" : "paused";
    try {
      await updateServiceStatusAdmin(serviceId, nextStatus);
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      console.error("Failed to update service status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.serviceArea?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Services Management
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Monitor and manage companion service listings published by providers across RentasBuddy.
        </p>
      </div>

      <AdminTable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search service name, category, area..."
        filterComponent={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Social Companion">Social Companion</option>
            <option value="Event Companion">Event Companion</option>
            <option value="Travel Escort & Companion">Travel Escort & Companion</option>
            <option value="Executive Concierge Partner">Executive Concierge Partner</option>
          </select>
        }
      >
        {filteredServices.length > 0 ? (
          <table className="w-full text-left text-xs font-medium text-purple-950">
            <thead className="bg-purple-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-purple-100">
              <tr>
                <th className="p-4">Service Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Area</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="p-4 font-bold text-purple-950">{s.serviceName}</td>
                  <td className="p-4 font-semibold text-purple-700">{s.category}</td>
                  <td className="p-4 text-purple-900/70">{s.duration}</td>
                  <td className="p-4 text-purple-900/70">{s.serviceArea}</td>
                  <td className="p-4 font-extrabold">
                    ₹{s.price?.toLocaleString("en-IN")} <span className="text-[10px] font-normal text-purple-900/50">/ {s.priceType}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        s.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(s.id, s.status)}
                      className="px-3.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 font-bold text-purple-950 flex items-center gap-1.5 ml-auto"
                    >
                      {s.status === "paused" ? (
                        <>
                          <ToggleLeft className="w-4 h-4 text-amber-500" /> Enable
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-500" /> Pause
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={Layers}
            title="No Services Found"
            description="No service records matching current search and filter criteria."
          />
        )}
      </AdminTable>
    </div>
  );
}
