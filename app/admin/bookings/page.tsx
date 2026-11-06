"use client";

import React, { useState, useEffect } from "react";
import { getAllBookingsAdmin, updateBookingStatusAdmin } from "@/lib/admin/admin-bookings";
import { ProviderBooking, BookingStatus } from "@/types/service-provider";
import { AdminTable } from "@/components/admin/AdminTable";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { Calendar, Loader2 } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function loadBookings() {
      try {
        const list = await getAllBookingsAdmin();
        setBookings(list);
      } catch (err) {
        console.error("Failed to load bookings for admin:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateBookingStatusAdmin(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (b.serviceName && b.serviceName.toLowerCase().includes(q)) ||
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.providerName && b.providerName.toLowerCase().includes(q)) ||
      (b.cityName && b.cityName.toLowerCase().includes(q)) ||
      (b.localityName && b.localityName.toLowerCase().includes(q)) ||
      (b.id && b.id.toLowerCase().includes(q));

    const currentStatus = (b.status || "upcoming").toLowerCase();
    const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Bookings Overview
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Monitor and track customer bookings across all active companion service providers.
        </p>
      </div>

      <AdminTable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by service, customer, partner, location, ID..."
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Booking Statuses</option>
            <option value="pending">Pending</option>
            <option value="upcoming">Upcoming / Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        }
      >
        {filteredBookings.length > 0 ? (
          <table className="w-full text-left text-xs font-medium text-purple-950">
            <thead className="bg-purple-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-purple-100">
              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Partner</th>
                <th className="p-4">Service</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Location</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Connection</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {filteredBookings.map((b, index) => {
                const displayStatus = (b.status || "upcoming").toLowerCase();
                const isConnected = b.connectionStatus === "connected";

                return (
                  <tr key={b.id || `booking-${index}`} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-purple-950">{b.id ? b.id.slice(0, 12) : "N/A"}</td>
                    <td className="p-4 font-bold">{b.customerName || "Member"}</td>
                    <td className="p-4 font-extrabold text-pink-600">{b.providerName || "Partner"}</td>
                    <td className="p-4 font-semibold">{b.serviceName || "Service"}</td>
                    <td className="p-4 text-purple-900/70">{b.date || "Today"} ({b.time || "N/A"})</td>
                    <td className="p-4 font-medium text-purple-900/60">
                      {b.localityName || b.cityName ? `${b.localityName || ""}, ${b.cityName || ""}` : "Standard"}
                    </td>
                    <td className="p-4 font-black text-purple-950">₹{(b.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isConnected
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isConnected ? "✓ Connected" : "Waiting"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          displayStatus === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : displayStatus === "upcoming"
                            ? "bg-indigo-100 text-indigo-800"
                            : displayStatus === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {displayStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {displayStatus === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStatusUpdate(b.id, "cancelled")}
                            className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-[11px]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(b.id, "upcoming")}
                            className="px-3 py-1 rounded-full bg-purple-700 text-white font-bold text-[11px]"
                          >
                            Confirm
                          </button>
                        </div>
                      ) : displayStatus === "upcoming" ? (
                        <button
                          onClick={() => handleStatusUpdate(b.id, "completed")}
                          className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100"
                        >
                          Mark Completed
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Bookings Found"
            description="No booking records match the search filter criteria."
          />
        )}
      </AdminTable>
    </div>
  );
}
