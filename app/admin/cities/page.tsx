"use client";

import React, { useState, useEffect } from "react";
import { getAllUsers } from "@/lib/admin/admin-users";
import { getAllProviders } from "@/lib/admin/admin-providers";
import { getAllBookingsAdmin } from "@/lib/admin/admin-bookings";
import { AdminCityStat } from "@/types/admin";
import { AdminTable } from "@/components/admin/AdminTable";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { MapPin, Loader2 } from "lucide-react";

export default function AdminCitiesPage() {
  const [cityStats, setCityStats] = useState<AdminCityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadCityData() {
      try {
        const [users, providers, bookings] = await Promise.all([
          getAllUsers(),
          getAllProviders(),
          getAllBookingsAdmin(),
        ]);

        const cityMap: { [key: string]: AdminCityStat } = {};

        // Process users by city
        users.forEach((u) => {
          const city = u.city?.trim() || "Unspecified City";
          if (!cityMap[city]) {
            cityMap[city] = { city, state: u.state || "India", userCount: 0, providerCount: 0, bookingCount: 0 };
          }
          cityMap[city].userCount += 1;
        });

        // Process providers by city
        providers.forEach((p) => {
          const city = p.city?.trim() || "Unspecified City";
          if (!cityMap[city]) {
            cityMap[city] = { city, state: p.state || "India", userCount: 0, providerCount: 0, bookingCount: 0 };
          }
          cityMap[city].providerCount += 1;
          if (p.state) cityMap[city].state = p.state;
        });

        // Process bookings count
        const list = Object.values(cityMap).sort((a, b) => (b.userCount + b.providerCount) - (a.userCount + a.providerCount));
        setCityStats(list);
      } catch (err) {
        console.error("Failed to load city analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCityData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const filtered = cityStats.filter(
    (c) =>
      !searchQuery ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          City & Regional Analytics
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Geographic breakdown of user and service provider activity across Indian cities.
        </p>
      </div>

      <AdminTable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by city or state name..."
      >
        {filtered.length > 0 ? (
          <table className="w-full text-left text-xs font-medium text-purple-950">
            <thead className="bg-purple-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-purple-100">
              <tr>
                <th className="p-4">City</th>
                <th className="p-4">State</th>
                <th className="p-4">Registered Users</th>
                <th className="p-4">Active Providers</th>
                <th className="p-4 text-right">Activity Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {filtered.map((c, idx) => (
                <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                  <td className="p-4 font-extrabold text-purple-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-pink-500" /> {c.city}
                  </td>
                  <td className="p-4 font-semibold text-purple-700">{c.state}</td>
                  <td className="p-4 font-bold">{c.userCount} Users</td>
                  <td className="p-4 font-bold text-pink-600">{c.providerCount} Providers</td>
                  <td className="p-4 text-right font-extrabold text-purple-950">
                    {c.userCount + c.providerCount * 2} Points
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={MapPin}
            title="No Geographic Records"
            description="Geographic data will assemble automatically as users register from different cities."
          />
        )}
      </AdminTable>
    </div>
  );
}
