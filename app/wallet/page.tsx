"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet as WalletIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  PlusCircle,
  History,
  Lock,
  Loader2,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/buttons/Buttons";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/Animations";

interface Transaction {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
  status: "Completed" | "Pending";
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "TX-9021",
    title: "Booking Deposit Refill",
    category: "Wallet Top-up",
    date: "Aug 02, 2026",
    amount: 500,
    type: "credit",
    status: "Completed",
  },
  {
    id: "TX-8910",
    title: "Hanging Out & Coffee Outing",
    category: "Concierge Escort",
    date: "Aug 15, 2026",
    amount: 180,
    type: "debit",
    status: "Completed",
  },
  {
    id: "TX-8750",
    title: "Privé Lifestyle Membership Renewal",
    category: "Membership Fee",
    date: "Jul 01, 2026",
    amount: 990,
    type: "debit",
    status: "Completed",
  },
];

export default function WalletPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/wallet");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-sm font-bold text-purple-950">Loading wallet balance...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF9FA] px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/90 border border-pink-200 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-purple-950 mb-2">Authentication Required</h3>
          <p className="text-purple-900/70 text-sm mb-6">
            Please sign in or create an account to view your confidential wallet balance.
          </p>
          <div className="flex flex-col gap-3">
            <Button href="/login?redirect=/wallet" variant="primary" className="w-full">
              Sign In
            </Button>
            <Button href="/register?redirect=/wallet" variant="secondary" className="w-full">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-pink-100/50 via-purple-50/30 to-[#FFF9FA]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-8">
        {/* Breadcrumb */}
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 text-xs font-semibold text-purple-950 shadow-sm">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-pink-600 font-bold">Wallet</span>
          </div>
        </FadeIn>

        {/* Page Heading */}
        <FadeIn delay={0.2}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Confidential Billing
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-purple-950 tracking-tight">
              Member Wallet
            </h1>
            <p className="text-purple-900/70 text-sm sm:text-base mt-1">
              Manage your booking credits, neutral payment methods, and confidential billing statement.
            </p>
          </div>
        </FadeIn>

        {/* Wallet Balance Card */}
        <FadeIn delay={0.3}>
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950 text-white shadow-2xl shadow-purple-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-pink-300" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-200">
                  Available Privé Credits
                </span>
              </div>

              <div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  $1,330.00
                </div>
                <span className="text-xs text-pink-100/70 block mt-1">
                  Includes 2 rollover booking credits from last month
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-pink-200/80">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>Encrypted Holding Account • Swiss Privacy Standard</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => alert("Add Money functionality will connect to your payment processor.")}
                className="py-3.5 px-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Money</span>
              </button>

              <a
                href="#transactions"
                className="py-3.5 px-6 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4 text-pink-300" />
                <span>View Transactions</span>
              </a>
            </div>
          </div>
        </FadeIn>

        {/* Transaction History Section */}
        <section id="transactions" className="space-y-6 pt-4">
          <FadeIn delay={0.4}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-purple-950 flex items-center gap-2">
                <History className="w-6 h-6 text-pink-500" />
                Transaction History
              </h3>
              <span className="text-xs font-bold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                Discreet Descriptors
              </span>
            </div>
          </FadeIn>

          <StaggerContainer className="space-y-4">
            {SAMPLE_TRANSACTIONS.map((tx) => (
              <StaggerItem key={tx.id}>
                <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-200/80 shadow-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        tx.type === "credit"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-pink-100 text-pink-600"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <ArrowDownLeft className="w-6 h-6" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-purple-950 text-base">{tx.title}</h4>
                      <p className="text-xs text-purple-900/60 font-medium">
                        {tx.category} • {tx.date} • <span className="font-mono">{tx.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-lg font-black ${
                        tx.type === "credit" ? "text-emerald-600" : "text-purple-950"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}${tx.amount.toLocaleString()}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {tx.status}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </div>
    </div>
  );
}
