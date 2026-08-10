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
    const matchesSearch =
      !searchQuery ||
      b.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
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
        searchPlaceholder="Search by service name, customer name, ID..."
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
                <th className="p-4">Service</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-950">{b.id?.slice(0, 10)}</td>
                  <td className="p-4 font-bold">{b.customerName}</td>
                  <td className="p-4">{b.serviceName}</td>
                  <td className="p-4 text-purple-900/70">{b.date} ({b.time})</td>
                  <td className="p-4 text-purple-900/70">{b.duration}</td>
                  <td className="p-4 font-extrabold">₹{b.amount?.toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        b.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : b.status === "upcoming"
                          ? "bg-indigo-100 text-indigo-800"
                          : b.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {b.status === "pending" && (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Bookings Found"
            description="No booking records match the filter criteria."
          />
        )}
      </AdminTable>
    </div>
  );
}
