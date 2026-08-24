"use client";

import React, { useState, useEffect } from "react";
import {
  getAllInquiriesAdmin,
  updateInquiryStatusAdmin,
  deleteInquiryAdmin,
  AdminInquiry,
} from "@/lib/admin/admin-inquiries";
import { AdminTable } from "@/components/admin/AdminTable";
import { EmptyState } from "@/components/service-provider/EmptyState";
import {
  MessageSquare,
  Loader2,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Inbox,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(null);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const list = await getAllInquiriesAdmin();
      setInquiries(list);
    } catch (err) {
      console.error("Failed to load inquiries for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusUpdate = async (
    inquiryId: string,
    status: "new" | "contacted" | "resolved"
  ) => {
    try {
      await updateInquiryStatusAdmin(inquiryId, status);
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiryId ? { ...item, status } : item))
      );
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (!window.confirm("Are you sure you want to delete this inquiry record?")) return;
    try {
      await deleteInquiryAdmin(inquiryId);
      setInquiries((prev) => prev.filter((item) => item.id !== inquiryId));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.phone && item.phone.toLowerCase().includes(q)) ||
      (item.occasion && item.occasion.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q));

    const currentStatus = (item.status || "new").toLowerCase();
    const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => (i.status || "new") === "new").length;
  const contactedCount = inquiries.filter((i) => i.status === "contacted").length;
  const resolvedCount = inquiries.filter((i) => i.status === "resolved").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
        <p className="text-sm font-extrabold text-purple-950">Loading Client Inquiries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            VIP Client Desk
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            Contact & VIP Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
            Review, track, and manage all confidential client submissions sent from the contact portal.
          </p>
        </div>

        <button
          onClick={loadInquiries}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-white border border-purple-200 hover:border-purple-300 text-purple-950 text-xs font-extrabold transition-all shadow-sm flex items-center gap-2"
        >
          <Inbox className="w-4 h-4 text-purple-600" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white shadow-xl shadow-purple-500/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 block mb-1">
            Total Submissions
          </span>
          <div className="text-3xl font-extrabold">{totalCount}</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-amber-200/80 shadow-lg shadow-purple-500/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            New / Unread
          </span>
          <div className="text-3xl font-extrabold text-amber-600">{newCount}</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-blue-200/80 shadow-lg shadow-purple-500/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
            In Contact
          </span>
          <div className="text-3xl font-extrabold text-blue-600">{contactedCount}</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-lg shadow-purple-500/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Resolved
          </span>
          <div className="text-3xl font-extrabold text-emerald-600">{resolvedCount}</div>
        </div>
      </div>

      {/* Main Data Table */}
      <AdminTable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by client name, email, phone, service category..."
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Inquiry Statuses</option>
            <option value="new">New / Unread</option>
            <option value="contacted">Contacted</option>
            <option value="resolved">Resolved</option>
          </select>
        }
      >
        {filteredInquiries.length > 0 ? (
          <table className="w-full text-left text-xs font-medium text-purple-950">
            <thead className="bg-purple-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-purple-100">
              <tr>
                <th className="p-4">Date & ID</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Service Category</th>
                <th className="p-4">Notes / Requirements</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {filteredInquiries.map((item) => {
                const currentStatus = item.status || "new";
                const formattedDate = item.createdAt
                  ? new Date(item.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                return (
                  <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-purple-950 block">{formattedDate}</span>
                      <span className="font-mono text-[10px] text-purple-900/50 block mt-0.5">
                        {item.id.slice(0, 10)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-extrabold text-purple-950 text-sm block">
                        {item.name || "Anonymous Client"}
                      </span>
                    </td>
                    <td className="p-4 space-y-1">
                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className="flex items-center gap-1.5 font-semibold text-purple-950 hover:text-pink-600 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                          <span>{item.email}</span>
                        </a>
                      )}
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="flex items-center gap-1.5 font-semibold text-purple-900/80 hover:text-pink-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{item.phone}</span>
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-[11px] font-bold inline-block">
                        {item.occasion || "General Inquiry"}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-purple-900/70 text-xs truncate">
                        {item.notes || "No additional notes provided."}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          currentStatus === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : currentStatus === "contacted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-900 animate-pulse"
                        }`}
                      >
                        {currentStatus === "new" ? (
                          <Clock className="w-3 h-3" />
                        ) : currentStatus === "contacted" ? (
                          <Mail className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        <span>{currentStatus.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInquiry(item)}
                          className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {currentStatus === "new" && (
                          <button
                            onClick={() => handleStatusUpdate(item.id, "contacted")}
                            className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 shadow-sm"
                          >
                            Mark Contacted
                          </button>
                        )}

                        {currentStatus === "contacted" && (
                          <button
                            onClick={() => handleStatusUpdate(item.id, "resolved")}
                            className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 shadow-sm"
                          >
                            Mark Resolved
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-colors"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No Inquiries Found"
            description="No client inquiry submissions match your current search or status filter."
          />
        )}
      </AdminTable>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-purple-950">Inquiry Details</h3>
                  <span className="text-xs text-purple-900/60 font-mono">{selectedInquiry.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-950 hover:bg-purple-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">Client Name</span>
                  <span className="text-sm font-extrabold text-purple-950">{selectedInquiry.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">Service Category</span>
                  <span className="text-sm font-extrabold text-pink-600">{selectedInquiry.occasion || "General Inquiry"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">Email Address</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-sm font-bold text-purple-950 hover:underline">
                    {selectedInquiry.email || "N/A"}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">Phone / Signal</span>
                  <a href={`tel:${selectedInquiry.phone}`} className="text-sm font-bold text-purple-950 hover:underline">
                    {selectedInquiry.phone || "N/A"}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 block mb-1">
                  Specific Requirements & Notes
                </span>
                <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 text-purple-950 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.notes || "No additional notes provided by client."}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-purple-900/60 pt-2">
                <span>Submitted: {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : "N/A"}</span>
                <span className="uppercase font-bold text-purple-950">Status: {selectedInquiry.status || "new"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100">
              <button
                onClick={() => handleStatusUpdate(selectedInquiry.id, "new")}
                className="px-4 py-2 rounded-2xl bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 transition-colors"
              >
                Set New
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedInquiry.id, "contacted")}
                className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Set Contacted
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedInquiry.id, "resolved")}
                className="px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Set Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
