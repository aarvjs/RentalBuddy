"use client";

import React, { useState, useEffect } from "react";
import {
  getAllWithdrawalsAdmin,
  updateWithdrawalStatusAdmin,
  getAllCustomerPaymentsAdmin,
  CustomerPaymentRecord,
} from "@/lib/admin/admin-payments";
import { WithdrawalRecord } from "@/types/service-provider";
import { AdminTable } from "@/components/admin/AdminTable";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { CreditCard, Loader2, DollarSign, Wallet } from "lucide-react";

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"payments" | "withdrawals">("payments");
  const [payments, setPayments] = useState<CustomerPaymentRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [payList, withList] = await Promise.all([
          getAllCustomerPaymentsAdmin(),
          getAllWithdrawalsAdmin(),
        ]);
        setPayments(payList);
        setWithdrawals(withList);
      } catch (err) {
        console.error("Failed to load payments for admin:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: "processed" | "rejected") => {
    try {
      await updateWithdrawalStatusAdmin(id, status);
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status } : w))
      );
    } catch (err) {
      console.error("Failed to update withdrawal status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const filteredPayments = payments.filter(
    (p) =>
      !searchQuery ||
      p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.providerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWithdrawals = withdrawals.filter(
    (w) =>
      !searchQuery ||
      w.accountHolderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            Payments & Payout Settlements
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
            Monitor customer service payments and manage provider payout requests.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 p-1 rounded-full bg-purple-100/60 border border-purple-200 shrink-0">
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === "payments"
                ? "bg-purple-950 text-white shadow-md"
                : "text-purple-900/70 hover:text-purple-950"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Customer Payments ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === "withdrawals"
                ? "bg-purple-950 text-white shadow-md"
                : "text-purple-900/70 hover:text-purple-950"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> Provider Payouts ({withdrawals.length})
          </button>
        </div>
      </div>

      {activeTab === "payments" ? (
        <AdminTable
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search customer, provider, service, ID..."
        >
          {filteredPayments.length > 0 ? (
            <table className="w-full text-left text-xs font-medium text-purple-950">
              <thead className="bg-purple-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-purple-100">
                <tr>
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100/60">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-purple-950">{p.id?.slice(0, 14)}</td>
                    <td className="p-4">
                      <div className="font-bold text-purple-950">{p.customerName}</div>
                      {p.customerEmail && <div className="text-[10px] text-purple-900/60 font-semibold">{p.customerEmail}</div>}
                    </td>
                    <td className="p-4 font-extrabold text-pink-600">{p.providerName}</td>
                    <td className="p-4 font-bold">{p.serviceName}</td>
                    <td className="p-4 font-semibold text-purple-900/70">
                      {p.localityName || p.cityName ? `${p.localityName || ""}, ${p.cityName || ""}` : "Platform Standard"}
                    </td>
                    <td className="p-4 font-black text-purple-950 text-sm">₹{p.amount?.toLocaleString("en-IN")}</td>
                    <td className="p-4 font-mono text-[10px] uppercase font-bold text-purple-700">{p.paymentMethod || "demo"}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        {p.paymentStatus.toUpperCase()} ✓
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-purple-900/60 font-medium">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No Customer Payments"
              description="Customer service purchase transactions will appear here automatically."
            />
          )}
        </AdminTable>
      ) : (
        <AdminTable
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search bank, account holder, ID..."
        >
          {filteredWithdrawals.length > 0 ? (
            <table className="w-full text-left text-xs font-medium text-purple-950">
              <thead className="bg-purple-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-purple-100">
                <tr>
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Account Holder</th>
                  <th className="p-4">Bank Name</th>
                  <th className="p-4">Account Number</th>
                  <th className="p-4">IFSC</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100/60">
                {filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-purple-950">{w.id?.slice(0, 10)}</td>
                    <td className="p-4 font-bold">{w.accountHolderName}</td>
                    <td className="p-4 font-semibold text-purple-700">{w.bankName}</td>
                    <td className="p-4 font-mono">•••• {w.accountNumber?.slice(-4)}</td>
                    <td className="p-4 font-mono">{w.ifscCode}</td>
                    <td className="p-4 font-extrabold text-purple-950">₹{w.amount?.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          w.status === "processed"
                            ? "bg-emerald-100 text-emerald-800"
                            : w.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {w.status === "pending" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(w.id, "rejected")}
                            className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 font-bold text-rose-600 hover:bg-rose-100 text-[11px]"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(w.id, "processed")}
                            className="px-3 py-1 rounded-full bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700 text-[11px]"
                          >
                            Approve Payout
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
              icon={CreditCard}
              title="No Payout Requests"
              description="Provider withdrawal requests will be listed here for approval."
            />
          )}
        </AdminTable>
      )}
    </div>
  );
}
