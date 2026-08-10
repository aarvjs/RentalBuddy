"use client";

import React, { useState, useEffect } from "react";
import { getAllKycSubmissions, reviewProviderKyc } from "@/lib/admin/admin-kyc";
import { ProviderKyc } from "@/types/service-provider";
import { AdminKycReview } from "@/components/admin/AdminKycReview";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminKycPage() {
  const [kycList, setKycList] = useState<ProviderKyc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    async function loadKycData() {
      try {
        const list = await getAllKycSubmissions();
        setKycList(list);
      } catch (err) {
        console.error("Failed to load KYC submissions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadKycData();
  }, []);

  const handleReview = async (uid: string, decision: "approved" | "rejected", reason?: string) => {
    await reviewProviderKyc(uid, decision, reason);
    setKycList((prev) =>
      prev.map((item) =>
        item.uid === uid ? { ...item, status: decision, rejectionReason: reason } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const filteredKyc = kycList.filter((k) => k.status === activeTab);

  const TABS: { label: string; key: "pending" | "approved" | "rejected"; count: number }[] = [
    { label: "Pending Verification", key: "pending", count: kycList.filter((k) => k.status === "pending").length },
    { label: "Approved KYC", key: "approved", count: kycList.filter((k) => k.status === "approved").length },
    { label: "Rejected KYC", key: "rejected", count: kycList.filter((k) => k.status === "rejected").length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          KYC Identity Verification Portal
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          Carefully review submitted Aadhaar cards and profile photos to approve or reject service provider verification applications.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-purple-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20"
                : "bg-white/80 text-purple-950 border border-purple-100 hover:bg-purple-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* KYC Submissions List */}
      {filteredKyc.length > 0 ? (
        <div className="space-y-6">
          {filteredKyc.map((kyc) => (
            <AdminKycReview key={kyc.uid} kyc={kyc} onReview={handleReview} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title={`No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} KYC Records`}
          description={`There are currently no provider KYC submissions in the "${activeTab}" state.`}
        />
      )}
    </div>
  );
}
