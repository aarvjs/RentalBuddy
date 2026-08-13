"use client";

import React, { useState, useEffect } from "react";
import {
  getAllServicesAdmin,
  createMasterServiceAdmin,
  updateMasterServiceAdmin,
  updateServiceStatusAdmin,
} from "@/lib/admin/admin-services";
import { MasterServiceItem } from "@/lib/service-provider/provider-services";
import { ServiceStatus } from "@/types/service-provider";
import { AdminTable } from "@/components/admin/AdminTable";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { LocationSearchSelector, ServiceLocationData } from "@/components/location/LocationSearchSelector";
import { Layers, Loader2, Plus, Edit, ToggleLeft, ToggleRight, X, MapPin } from "lucide-react";

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800";

export default function AdminServicesPage() {
  const [services, setServices] = useState<MasterServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MasterServiceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [locationError, setLocationError] = useState("");

  // Form input states
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("Social Companion");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">(2000);
  const [priceType, setPriceType] = useState("hourly");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<ServiceStatus>("active");
  const [structuredLocation, setStructuredLocation] = useState<ServiceLocationData | null>(null);

  // Lock background body scroll when modal is open
  useEffect(() => {
    const isModalOpen = isCreateModalOpen || Boolean(editingService);
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCreateModalOpen, editingService]);

  useEffect(() => {
    async function loadServices() {
      try {
        const list = await getAllServicesAdmin();
        setServices(list);
      } catch (err) {
        console.error("Failed to load services for admin:", err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const openCreateModal = () => {
    setServiceName("");
    setCategory("Social Companion");
    setDescription("");
    setPrice(2000);
    setPriceType("hourly");
    setImageUrl("");
    setStatus("active");
    setStructuredLocation(null);
    setFormError("");
    setLocationError("");
    setIsCreateModalOpen(true);
  };

  const openEditModal = (service: MasterServiceItem) => {
    setEditingService(service);
    setServiceName(service.serviceName);
    setCategory(service.category || "Social Companion");
    setDescription(service.description);
    setPrice(service.price);
    setPriceType(service.priceType || "hourly");
    setImageUrl(service.imageUrl || "");
    setStatus(service.status || "active");

    const locCity = service.city || service.location?.city || service.cityName || "";
    const locLocality = service.locality || service.location?.locality || service.localityName || "";
    const locState = service.state || service.location?.state || service.stateName || "";
    const locCountry = service.country || service.location?.country || "India";
    const locAddress = service.address || service.location?.fullAddress || (locLocality ? `${locLocality}, ${locCity}` : locCity);

    setStructuredLocation(
      locCity || locLocality || locAddress
        ? {
            fullAddress: service.location?.fullAddress || locAddress || `${locLocality}, ${locCity}, ${locCountry}`,
            address: locAddress || `${locLocality}, ${locCity}`,
            locality: locLocality,
            city: locCity,
            state: locState,
            country: locCountry,
            pincode: service.pincode || service.location?.pincode || "",
            latitude: service.latitude || service.location?.latitude || 26.4499,
            longitude: service.longitude || service.location?.longitude || 80.3319,
            placeId: service.placeId || `place_${Date.now()}`,
            stateId: service.stateId || "",
            stateName: service.stateName || locState,
            cityId: service.cityId || "",
            cityName: service.cityName || locCity,
            localityId: service.localityId || "",
            localityName: service.localityName || locLocality,
          }
        : null
    );
    setFormError("");
    setLocationError("");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLocationError("");

    if (!serviceName.trim()) {
      setFormError("Service Name is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Service Description is required.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError("Valid Rate/Price is required.");
      return;
    }
    if (!structuredLocation || !structuredLocation.city || !structuredLocation.locality) {
      setLocationError("Please select a service location.");
      return;
    }

    const effectiveAddress =
      structuredLocation.address ||
      structuredLocation.fullAddress ||
      `${structuredLocation.localityName || structuredLocation.locality}, ${structuredLocation.cityName || structuredLocation.city}`;

    try {
      setSubmitting(true);
      const newService = await createMasterServiceAdmin({
        serviceName,
        category,
        description,
        price: Number(price),
        priceType,
        imageUrl: imageUrl.trim() || DEFAULT_FALLBACK_IMAGE,
        status,
        address: effectiveAddress,
        locality: structuredLocation.locality || structuredLocation.localityName || "",
        city: structuredLocation.city || structuredLocation.cityName || "",
        state: structuredLocation.state || structuredLocation.stateName || "",
        country: structuredLocation.country || "India",
        pincode: structuredLocation.pincode || "",
        latitude: structuredLocation.latitude || 26.4499,
        longitude: structuredLocation.longitude || 80.3319,
        placeId: structuredLocation.placeId || `place_${Date.now()}`,
        stateId: structuredLocation.stateId || "",
        stateName: structuredLocation.stateName || structuredLocation.state || "",
        cityId: structuredLocation.cityId || "",
        cityName: structuredLocation.cityName || structuredLocation.city || "",
        localityId: structuredLocation.localityId || "",
        localityName: structuredLocation.localityName || structuredLocation.locality || "",
      });

      setServices((prev) => [newService, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || "Failed to create master service.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setFormError("");
    setLocationError("");

    if (!serviceName.trim()) {
      setFormError("Service Name is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Service Description is required.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError("Valid Rate/Price is required.");
      return;
    }
    if (!structuredLocation || !structuredLocation.city || !structuredLocation.locality) {
      setLocationError("Please select a service location.");
      return;
    }

    const effectiveAddress =
      structuredLocation.address ||
      structuredLocation.fullAddress ||
      `${structuredLocation.localityName || structuredLocation.locality}, ${structuredLocation.cityName || structuredLocation.city}`;

    try {
      setSubmitting(true);
      await updateMasterServiceAdmin(editingService.id, {
        serviceName,
        category,
        description,
        price: Number(price),
        priceType,
        imageUrl: imageUrl.trim() || DEFAULT_FALLBACK_IMAGE,
        status,
        address: effectiveAddress,
        locality: structuredLocation.locality || structuredLocation.localityName || "",
        city: structuredLocation.city || structuredLocation.cityName || "",
        state: structuredLocation.state || structuredLocation.stateName || "",
        country: structuredLocation.country || "India",
        pincode: structuredLocation.pincode || "",
        latitude: structuredLocation.latitude || 26.4499,
        longitude: structuredLocation.longitude || 80.3319,
        placeId: structuredLocation.placeId || `place_${Date.now()}`,
        stateId: structuredLocation.stateId || "",
        stateName: structuredLocation.stateName || structuredLocation.state || "",
        cityId: structuredLocation.cityId || "",
        cityName: structuredLocation.cityName || structuredLocation.city || "",
        localityId: structuredLocation.localityId || "",
        localityName: structuredLocation.localityName || structuredLocation.locality || "",
      });

      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                serviceName,
                category,
                description,
                price: Number(price),
                priceType,
                imageUrl: imageUrl.trim() || DEFAULT_FALLBACK_IMAGE,
                status,
                address: effectiveAddress,
                locality: structuredLocation.locality || structuredLocation.localityName || "",
                city: structuredLocation.city || structuredLocation.cityName || "",
                state: structuredLocation.state || structuredLocation.stateName || "",
                country: structuredLocation.country || "India",
                pincode: structuredLocation.pincode || "",
                latitude: structuredLocation.latitude || 26.4499,
                longitude: structuredLocation.longitude || 80.3319,
                placeId: structuredLocation.placeId || `place_${Date.now()}`,
                stateId: structuredLocation.stateId || "",
                stateName: structuredLocation.stateName || structuredLocation.state || "",
                cityId: structuredLocation.cityId || "",
                cityName: structuredLocation.cityName || structuredLocation.city || "",
                localityId: structuredLocation.localityId || "",
                localityName: structuredLocation.localityName || structuredLocation.locality || "",
              }
            : s
        )
      );
      setEditingService(null);
    } catch (err: any) {
      setFormError(err?.message || "Failed to update master service.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (serviceId: string, currentStatus: ServiceStatus) => {
    const nextStatus: ServiceStatus = currentStatus === "paused" ? "active" : "paused";
    try {
      await updateServiceStatusAdmin(serviceId, nextStatus);
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      console.error("Failed to update service status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.locality?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            Master Services Management
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
            Create and manage master platform services with location search across India.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Master Service
        </button>
      </div>

      <AdminTable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search service name, city, locality..."
        filterComponent={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Social Companion">Social Companion</option>
            <option value="Cinema & Theater">Cinema & Theater</option>
            <option value="Fashion & Style">Fashion & Style</option>
            <option value="Nightlife & VIP">Nightlife & VIP</option>
            <option value="Travel & Escape">Travel & Escape</option>
            <option value="Care & Companionship">Care & Companionship</option>
          </select>
        }
      >
        {filteredServices.length > 0 ? (
          <table className="w-full text-left text-xs font-medium text-purple-950">
            <thead className="bg-purple-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-purple-100">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Service Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-50 border border-purple-200 shrink-0">
                      <img
                        src={s.imageUrl || DEFAULT_FALLBACK_IMAGE}
                        alt={s.serviceName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-purple-950">
                    <div>{s.serviceName}</div>
                    <span className="text-[10px] text-purple-600 font-semibold">{s.category}</span>
                  </td>
                  <td className="p-4 text-purple-900/80">
                    <div className="font-bold flex items-center gap-1 text-purple-950">
                      <MapPin className="w-3.5 h-3.5 text-pink-600" />
                      {s.locality || s.localityName || "Location not set"}, {s.city || s.cityName || ""}
                    </div>
                    <div className="text-[10px] text-purple-900/60">{s.state || s.stateName || "India"}</div>
                  </td>
                  <td className="p-4 font-extrabold">
                    ₹{s.price?.toLocaleString("en-IN")} <span className="text-[10px] font-normal text-purple-900/50">/ {s.priceType || "hr"}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        s.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {s.status === "active" ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 font-bold text-purple-950 inline-flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-purple-600" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(s.id, s.status)}
                      className="px-3.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 font-bold text-purple-950 inline-flex items-center gap-1.5"
                    >
                      {s.status === "paused" ? (
                        <>
                          <ToggleLeft className="w-4 h-4 text-amber-500" /> Enable
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-500" /> Disable
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={Layers}
            title="No Services Found"
            description="No master service records matching search criteria."
          />
        )}
      </AdminTable>

      {/* Create / Edit Master Service Modal */}
      {(isCreateModalOpen || editingService) && (
        <div
          className="fixed inset-0 z-50 bg-purple-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCreateModalOpen(false);
              setEditingService(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-purple-200 overflow-hidden">
            {/* Fixed Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-purple-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                {editingService ? "Edit Master Service" : "Create Master Service"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingService(null);
                }}
                className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-purple-950 hover:bg-purple-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Form Container with Scrollable Content & Fixed Actions */}
            <form
              onSubmit={editingService ? handleEditSubmit : handleCreateSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              {/* Scrollable Content Area */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    {formError}
                  </div>
                )}

                {/* Service Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-purple-950 uppercase tracking-wider mb-1">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Clubbing"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-purple-950 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="Social Companion">Social Companion</option>
                      <option value="Cinema & Theater">Cinema & Theater</option>
                      <option value="Fashion & Style">Fashion & Style</option>
                      <option value="Nightlife & VIP">Nightlife & VIP</option>
                      <option value="Travel & Escape">Travel & Escape</option>
                      <option value="Care & Companionship">Care & Companionship</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-extrabold text-purple-950 uppercase tracking-wider mb-1">
                    Service Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe the experience..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Rate, Price Type & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-purple-950 uppercase tracking-wider mb-1">
                      Rate (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="2000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-purple-950 uppercase tracking-wider mb-1">
                      Billing Unit *
                    </label>
                    <select
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="hourly">per hour</option>
                      <option value="daily">per day</option>
                      <option value="fixed">fixed rate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-purple-950 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Service Location (Nominatim OpenStreetMap Search - Starts completely empty) */}
                <div className="pt-2 border-t border-purple-100">
                  <label className="block text-[11px] font-extrabold text-purple-950 uppercase tracking-wider mb-1">
                    Service Location *
                  </label>
                  <LocationSearchSelector
                    value={structuredLocation || undefined}
                    onChange={(val) => {
                      setStructuredLocation(val);
                      if (val) setLocationError("");
                    }}
                    error={locationError}
                  />
                </div>

                {/* Service Image URL & Preview */}
                <div className="pt-2 border-t border-purple-100 space-y-2">
                  <div>
                    <label className="block text-[11px] font-extrabold text-purple-950 uppercase tracking-wider mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Compact Image Live Preview */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-purple-100 border border-purple-200 shrink-0">
                      <img
                        src={imageUrl.trim() || DEFAULT_FALLBACK_IMAGE}
                        alt="Service Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-extrabold text-purple-600 block">Live Preview</span>
                      <span className="text-[11px] text-slate-600 truncate block">
                        {imageUrl.trim() ? imageUrl : "Using professional fallback image"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer Actions */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-purple-100 flex justify-end gap-2.5 shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : editingService ? (
                    "Save Changes"
                  ) : (
                    "Save Master Service"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


