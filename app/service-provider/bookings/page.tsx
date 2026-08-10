"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  getProviderBookings,
  updateBookingStatus,
} from "@/lib/service-provider/provider-bookings";
import { ProviderBooking, BookingStatus } from "@/types/service-provider";
import { BookingCard } from "@/components/service-provider/BookingCard";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { Calendar, Loader2 } from "lucide-react";

export default function ServiceProviderBookingsPage() {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingStatus>("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const list = await getProviderBookings(user.uid);
        setBookings(list);
      } catch (err) {
        console.error("Error loading bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, status);
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
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  const TABS: { label: string; key: BookingStatus; count: number }[] = [
    { label: "Pending", key: "pending", count: bookings.filter((b) => b.status === "pending").length },
    { label: "Upcoming", key: "upcoming", count: bookings.filter((b) => b.status === "upcoming").length },
    { label: "Completed", key: "completed", count: bookings.filter((b) => b.status === "completed").length },
    { label: "Cancelled", key: "cancelled", count: bookings.filter((b) => b.status === "cancelled").length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Bookings & Customer Requests
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Review, accept, reject, and track completed customer companion bookings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-pink-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                : "bg-white/80 text-purple-950 border border-pink-100 hover:bg-pink-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Booking List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <BookingCard key={b.id} booking={b} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings`}
          description={`There are currently no bookings in the "${activeTab}" status list.`}
        />
      )}
    </div>
  );
}
