import React from "react";
import Link from "next/link";
import { User, Phone, MapPin, ShieldCheck, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { AdminProviderListItem } from "@/types/admin";

interface AdminProviderCardProps {
  provider: AdminProviderListItem;
}

export function AdminProviderCard({ provider }: AdminProviderCardProps) {
  return (
    <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-md hover:border-purple-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
          {provider.photoURL ? (
            <img src={provider.photoURL} alt={provider.fullName} className="w-full h-full object-cover" />
          ) : (
            provider.fullName?.charAt(0)?.toUpperCase() || "P"
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="font-extrabold text-base text-purple-950">{provider.fullName}</h4>
            <span
              className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                provider.kycStatus === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : provider.kycStatus === "pending"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              }`}
            >
              KYC: {provider.kycStatus}
            </span>
            <span
              className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                provider.providerStatus === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              Status: {provider.providerStatus}
            </span>
          </div>

          <p className="text-xs text-purple-900/60 font-semibold">{provider.email}</p>

          <div className="flex items-center gap-4 text-xs text-purple-900/70 pt-1 flex-wrap font-medium">
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-purple-500" />
              <span>{provider.mobileNumber}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-500" />
              <span>{provider.city}, {provider.state}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-purple-100">
        <Link
          href={`/admin/providers/${provider.uid}`}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/10 hover:opacity-95 transition-all flex items-center gap-1.5"
        >
          View Full Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
