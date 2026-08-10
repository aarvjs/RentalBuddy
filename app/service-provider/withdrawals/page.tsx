"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  getProviderEarningsSummary,
  getProviderWithdrawals,
  requestWithdrawal,
} from "@/lib/service-provider/provider-earnings";
import { EarningsSummary, WithdrawalRecord } from "@/types/service-provider";
import { EmptyState } from "@/components/service-provider/EmptyState";
import {
  Wallet,
  Building,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function ServiceProviderWithdrawalsPage() {
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    completedServicesCount: 0,
  });
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);

  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadWithdrawalData() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const [sumData, wList] = await Promise.all([
          getProviderEarningsSummary(user.uid),
          getProviderWithdrawals(user.uid),
        ]);
        setSummary(sumData);
        setWithdrawals(wList);
      } catch (err) {
        console.error("Error loading withdrawal page:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWithdrawalData();
  }, []);

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const user = auth.currentUser;
    if (!user) return;

    const amt = Number(withdrawAmount);

    if (!amt || amt <= 0) {
      setErrorMessage("Please enter a valid withdrawal amount.");
      return;
    }
    if (amt > summary.availableBalance) {
      setErrorMessage(`Withdrawal amount cannot exceed available balance of ₹${summary.availableBalance.toLocaleString("en-IN")}.`);
      return;
    }
    if (accountNumber !== confirmAccount) {
      setErrorMessage("Bank Account numbers do not match.");
      return;
    }
    if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
      setErrorMessage("Please fill all required bank account details.");
      return;
    }

    try {
      setSubmitting(true);

      const record = await requestWithdrawal(user.uid, amt, {
        accountNumber,
        ifscCode,
        bankName,
        accountHolderName,
      });

      setWithdrawals((prev) => [record, ...prev]);
      setSummary((prev) => ({
        ...prev,
        availableBalance: Math.max(0, prev.availableBalance - amt),
      }));
      setWithdrawAmount("");
      setSuccessMessage("Withdrawal request submitted successfully! Funds will be transferred upon verification.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Payouts & Withdrawals
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Withdraw available service revenue directly to your verified bank account.
        </p>
      </div>

      {/* Balance Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-pink-100 uppercase tracking-wider block">
            Current Available Payout Balance
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold mt-1">
            ₹{summary.availableBalance.toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs font-medium text-pink-50">
          🔒 Secure Encrypted Payouts
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bank Details & Request Form */}
      <form onSubmit={handleWithdrawalRequest} className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-6">
        <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-pink-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-pink-500" /> Bank Account & Withdrawal Form
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Account Holder Name
            </label>
            <input
              type="text"
              required
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="Name as registered with bank"
              className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Bank Name
            </label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. HDFC Bank / ICICI Bank"
              className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Account Number
            </label>
            <input
              type="password"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter bank account number"
              className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Confirm Account Number
            </label>
            <input
              type="text"
              required
              value={confirmAccount}
              onChange={(e) => setConfirmAccount(e.target.value)}
              placeholder="Re-enter bank account number"
              className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              IFSC Code
            </label>
            <input
              type="text"
              required
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0001234"
              className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              required
              min={100}
              max={summary.availableBalance}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={`Max: ₹${summary.availableBalance.toLocaleString("en-IN")}`}
              className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting || summary.availableBalance <= 0}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
              </>
            ) : (
              <>
                Submit Withdrawal Request <ArrowUpRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Withdrawal History Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-purple-950">Withdrawal History</h3>

        {withdrawals.length > 0 ? (
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-purple-950">
                <thead className="bg-pink-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-pink-100">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Bank Name</th>
                    <th className="p-4">Account Number</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100/60">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="p-4 font-semibold">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-bold">{w.bankName}</td>
                      <td className="p-4 text-purple-900/70 font-mono">
                        •••• {w.accountNumber?.slice(-4)}
                      </td>
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
                      <td className="p-4 text-right font-extrabold text-purple-950">
                        ₹{w.amount?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title="No Payout History"
            description="Submitted withdrawal requests and settlement history will be listed here."
          />
        )}
      </div>
    </div>
  );
}
