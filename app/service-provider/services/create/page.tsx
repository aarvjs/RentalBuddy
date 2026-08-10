"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getProviderProfile } from "@/lib/service-provider/provider-auth";
import { createProviderService } from "@/lib/service-provider/provider-services";
import { PriceType, ProviderProfile } from "@/types/service-provider";
import {
  Briefcase,
  Upload,
  IndianRupee,
  Clock,
  MapPin,
  Tag,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export default function CreateServicePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("Social Companion");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [priceType, setPriceType] = useState<PriceType>("hourly");
  const [duration, setDuration] = useState("2 Hours");
  const [availability, setAvailability] = useState("Weekdays & Weekends (10 AM - 10 PM)");
  const [serviceArea, setServiceArea] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const profData = await getProviderProfile(user.uid);
        setProfile(profData);
        if (profData?.city) setServiceArea(profData.city);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setImageFiles(filesArr);
      const previews = filesArr.map((f) => URL.createObjectURL(f));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const user = auth.currentUser;
    if (!user) return;

    if (profile?.kycStatus !== "approved") {
      setErrorMessage("Complete KYC verification before adding services.");
      return;
    }

    if (!serviceName.trim()) {
      setErrorMessage("Service Name is required.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Description is required.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("Please enter a valid price amount.");
      return;
    }

    try {
      setSubmitting(true);

      await createProviderService(user.uid, {
        serviceName,
        category,
        description,
        price: Number(price),
        priceType,
        duration,
        availability,
        serviceArea,
        imageFiles,
      });

      router.push("/service-provider/services");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create service.");
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

  const isKycApproved = profile?.kycStatus === "approved";

  if (!isKycApproved) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-purple-950">
          KYC Verification Required
        </h2>
        <p className="text-sm text-purple-900/70">
          Complete KYC verification before adding services. Your identity must be verified by the admin team to publish new service offerings.
        </p>
        <div className="pt-4">
          <Link
            href="/service-provider/kyc"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/20"
          >
            Complete KYC Verification
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/service-provider/services"
          className="w-10 h-10 rounded-2xl bg-white border border-pink-200 flex items-center justify-center text-purple-950 hover:bg-pink-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            Create New Service
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-0.5">
            Add details for your companion or lifestyle experience.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-6">
          <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-pink-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-pink-500" /> Service Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Service Name
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Gala & Dinner Date Companion"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              >
                <option value="Social Companion">Social Companion</option>
                <option value="Event Companion">Event Companion</option>
                <option value="Travel Escort & Companion">Travel Escort & Companion</option>
                <option value="Executive Concierge Partner">Executive Concierge Partner</option>
                <option value="Personal Lifestyle Guide">Personal Lifestyle Guide</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Detailed Service Description
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what customers can expect, etiquette, and highlights of this service experience..."
                className="w-full p-4 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Price (₹ INR)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-pink-400 absolute left-4 top-3.5" />
                <input
                  type="number"
                  required
                  min={100}
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Price Type
              </label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as PriceType)}
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              >
                <option value="hourly">Per Hour</option>
                <option value="daily">Per Day</option>
                <option value="fixed">Fixed Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2 Hours / Half Day"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Service Area / City
              </label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Mumbai / All Metro Cities"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
                Availability Schedule
              </label>
              <input
                type="text"
                required
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g. Mon-Fri (6 PM - 11 PM), Sat-Sun (All Day)"
                className="w-full px-4 py-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-purple-950 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Image Uploads Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-purple-950 pb-3 border-b border-pink-100 flex items-center gap-2">
            <Upload className="w-4 h-4 text-pink-500" /> Service Gallery Images
          </h3>

          <div className="relative border-2 border-dashed border-pink-200 rounded-2xl p-6 text-center bg-pink-50/20 hover:border-pink-400 transition-colors">
            <Upload className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <p className="text-xs font-extrabold text-purple-950">Click or Drag images to upload</p>
            <p className="text-[11px] text-purple-900/60 mt-1">High resolution lifestyle or promotional service photos</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="h-24 rounded-xl overflow-hidden border border-pink-200 shadow-sm">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/service-provider/services"
            className="px-6 py-3.5 rounded-full bg-pink-50 border border-pink-200 text-purple-950 font-bold text-xs hover:bg-pink-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Service...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Publish Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
