"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, RefreshCw, Edit3, Check, AlertCircle } from "lucide-react";
import { INDIAN_STATES } from "@/lib/locations";

export interface ServiceLocationData {
  fullAddress: string;
  address?: string;
  country: string;
  state: string;
  city: string;
  locality: string;
  pincode: string;
  latitude: number;
  longitude: number;
  displayName?: string;
  placeId?: string;
  // Matching helpers
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  localityId: string;
  localityName: string;
}

interface LocationSearchSelectorProps {
  value?: Partial<ServiceLocationData>;
  onChange: (value: ServiceLocationData | null) => void;
  error?: string;
}

export function LocationSearchSelector({ value, onChange, error }: LocationSearchSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServiceLocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Selected state
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocationData | null>(
    value && value.city && value.locality
      ? {
          fullAddress: value.fullAddress || `${value.locality}, ${value.city}, ${value.state || ""}, ${value.country || "India"}`,
          country: value.country || "India",
          state: value.state || value.stateName || "",
          city: value.city || value.cityName || "",
          locality: value.locality || value.localityName || "",
          pincode: value.pincode || "",
          latitude: value.latitude || 26.4499,
          longitude: value.longitude || 80.3319,
          displayName: value.displayName || `${value.locality}, ${value.city}`,
          placeId: value.placeId || `loc_${Date.now()}`,
          stateId: value.stateId || "",
          stateName: value.stateName || value.state || "",
          cityId: value.cityId || "",
          cityName: value.cityName || value.city || "",
          localityId: value.localityId || "",
          localityName: value.localityName || value.locality || "",
        }
      : null
  );

  // Manual input fields
  const [manualLocality, setManualLocality] = useState(value?.locality || "");
  const [manualCity, setManualCity] = useState(value?.city || "");
  const [manualState, setManualState] = useState(value?.state || "");
  const [manualPincode, setManualPincode] = useState(value?.pincode || "");

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync state with value prop updates
  useEffect(() => {
    if (value && value.city && value.locality) {
      setSelectedLocation({
        fullAddress: value.fullAddress || `${value.locality}, ${value.city}, ${value.state || ""}, ${value.country || "India"}`,
        country: value.country || "India",
        state: value.state || value.stateName || "",
        city: value.city || value.cityName || "",
        locality: value.locality || value.localityName || "",
        pincode: value.pincode || "",
        latitude: value.latitude || 26.4499,
        longitude: value.longitude || 80.3319,
        displayName: value.displayName || `${value.locality}, ${value.city}`,
        placeId: value.placeId || `loc_${Date.now()}`,
        stateId: value.stateId || "",
        stateName: value.stateName || value.state || "",
        cityId: value.cityId || "",
        cityName: value.cityName || value.city || "",
        localityId: value.localityId || "",
        localityName: value.localityName || value.locality || "",
      });
    } else {
      setSelectedLocation(null);
    }
  }, [value]);

  // Normalize IDs for RentasBuddy backend matching
  const normalizeStateId = (stName: string): string => {
    const s = stName.toLowerCase();
    if (s.includes("uttar pradesh") || s === "up") return "up";
    if (s.includes("delhi")) return "delhi";
    if (s.includes("maharashtra")) return "maharashtra";
    if (s.includes("karnataka")) return "karnataka";
    if (s.includes("telangana")) return "telangana";
    return s.replace(/[^a-z0-9]/g, "_");
  };

  const normalizeId = (str: string): string => {
    return str.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
  };

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced OpenStreetMap Nominatim Search (600ms debounce)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Abort previous stale request if running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setSearchError("");

      try {
        const q = query.trim();
        const searchMatches: ServiceLocationData[] = [];

        // 1. Check local master dataset for instant response
        INDIAN_STATES.forEach((st) => {
          st.cities.forEach((ct) => {
            if (ct.name.toLowerCase().includes(q.toLowerCase())) {
              ct.localities.forEach((loc) => {
                searchMatches.push({
                  fullAddress: `${loc.name}, ${ct.name}, ${st.name}, India`,
                  country: "India",
                  state: st.name,
                  city: ct.name,
                  locality: loc.name,
                  pincode: "",
                  latitude: 26.4499,
                  longitude: 80.3319,
                  displayName: `${loc.name}, ${ct.name}, ${st.name}`,
                  placeId: `off_${ct.id}_${loc.id}`,
                  stateId: st.id,
                  stateName: st.name,
                  cityId: ct.id,
                  cityName: ct.name,
                  localityId: loc.id,
                  localityName: loc.name,
                });
              });
            }
          });
        });

        // 2. Fetch OpenStreetMap Nominatim API via server route
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          (data.results || []).forEach((item: any) => {
            const locName = item.locality || item.city;
            const ctyName = item.city || item.locality;
            const stName = item.state || "India";

            if (
              !searchMatches.some(
                (m) =>
                  m.city.toLowerCase() === ctyName.toLowerCase() &&
                  m.locality.toLowerCase() === locName.toLowerCase()
              )
            ) {
              searchMatches.push({
                fullAddress: item.fullAddress || `${locName}, ${ctyName}, ${stName}, India`,
                country: item.country || "India",
                state: stName,
                city: ctyName,
                locality: locName,
                pincode: item.pincode || "",
                latitude: item.latitude || 26.4499,
                longitude: item.longitude || 80.3319,
                displayName: item.displayName || `${locName}, ${ctyName}`,
                placeId: item.placeId || `nom_${Date.now()}`,
                stateId: normalizeStateId(stName),
                stateName: stName,
                cityId: normalizeId(ctyName),
                cityName: ctyName,
                localityId: normalizeId(locName),
                localityName: locName,
              });
            }
          });
        }

        // Limit results to 5
        const limited = searchMatches.slice(0, 5);
        setResults(limited);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Location search error:", err);
          setSearchError("Location search unavailable. Enter address manually below.");
        }
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (item: ServiceLocationData) => {
    setSelectedLocation(item);
    setQuery("");
    setIsOpen(false);
    setIsManual(false);
    onChange(item);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocality.trim() || !manualCity.trim() || !manualState.trim()) {
      return;
    }

    const loc = manualLocality.trim();
    const cty = manualCity.trim();
    const st = manualState.trim();
    const pin = manualPincode.trim();

    const manualObj: ServiceLocationData = {
      fullAddress: `${loc}, ${cty}, ${st}, India`,
      country: "India",
      state: st,
      city: cty,
      locality: loc,
      pincode: pin,
      latitude: 26.4499,
      longitude: 80.3319,
      displayName: `${loc}, ${cty}`,
      placeId: `man_${Date.now()}`,
      stateId: normalizeStateId(st),
      stateName: st,
      cityId: normalizeId(cty),
      cityName: cty,
      localityId: normalizeId(loc),
      localityName: loc,
    };

    setSelectedLocation(manualObj);
    setIsManual(false);
    onChange(manualObj);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    setQuery("");
    setResults([]);
    onChange(null);
  };

  return (
    <div className="space-y-2.5">
      {/* Selected Location Card & Leaflet OpenStreetMap Preview */}
      {selectedLocation ? (
        <div className="p-3 sm:p-4 rounded-2xl bg-purple-50/60 border border-purple-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-purple-950">
                  {selectedLocation.locality}, {selectedLocation.city}
                </div>
                <div className="text-[11px] text-purple-900/70 font-medium">
                  {selectedLocation.state}, {selectedLocation.country}
                  {selectedLocation.pincode ? ` • ${selectedLocation.pincode}` : ""}
                </div>
                <div className="text-[10px] text-purple-900/50 font-mono">
                  Lat: {selectedLocation.latitude?.toFixed(4)} • Lon: {selectedLocation.longitude?.toFixed(4)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearLocation}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100 border border-purple-200 text-purple-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3 h-3 text-purple-600" /> Change Location
            </button>
          </div>

          {/* OpenStreetMap Leaflet Embedded Map Preview */}
          <div className="rounded-xl overflow-hidden border border-purple-200 bg-slate-100 h-28 relative">
            <iframe
              title="OpenStreetMap Location Preview"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedLocation.longitude || 80.3319) - 0.01}%2C${(selectedLocation.latitude || 26.4499) - 0.01}%2C${(selectedLocation.longitude || 80.3319) + 0.01}%2C${(selectedLocation.latitude || 26.4499) + 0.01}&layer=mapnik&marker=${selectedLocation.latitude || 26.4499}%2C${selectedLocation.longitude || 80.3319}`}
              className="w-full h-full border-0 pointer-events-none"
            />
            <div className="absolute bottom-1 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-slate-700 border border-slate-200">
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                © OpenStreetMap contributors
              </a>
            </div>
          </div>
        </div>
      ) : isManual ? (
        /* Manual Address Input Form */
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-purple-600" /> Enter Address Manually
            </span>
            <button
              type="button"
              onClick={() => setIsManual(false)}
              className="text-xs font-bold text-purple-600 hover:underline"
            >
              Back to Search
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Area / Locality *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Panki"
                value={manualLocality}
                onChange={(e) => setManualLocality(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kanpur"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Uttar Pradesh"
                value={manualState}
                onChange={(e) => setManualState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Pincode (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 208020"
                value={manualPincode}
                onChange={(e) => setManualPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsManual(false)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveManual}
              className="px-4 py-1.5 rounded-xl bg-purple-950 text-white text-xs font-bold hover:bg-purple-900"
            >
              Save Address
            </button>
          </div>
        </div>
      ) : (
        /* Single Search Bar Flow */
        <div className="space-y-1.5" ref={containerRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search city, area or address... (e.g. Kanpur, Panki)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="w-5 h-5 rounded-full hover:bg-purple-100 flex items-center justify-center text-purple-600 absolute right-3 top-2.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {loading && (
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin absolute right-3 top-3" />
            )}
          </div>

          {/* Search Dropdown Results */}
          {isOpen && (
            <div className="relative z-50 bg-white rounded-xl border border-purple-200 shadow-xl max-h-52 overflow-y-auto divide-y divide-purple-50">
              {results.length > 0 ? (
                results.map((item, idx) => (
                  <button
                    key={`${item.placeId}_${idx}`}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className="w-full px-3.5 py-2 text-left text-xs hover:bg-purple-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-extrabold text-purple-950 block">{item.locality}, {item.city}</span>
                      <span className="text-[10px] text-purple-900/60 font-medium">
                        {item.state}, {item.country} {item.pincode ? `(${item.pincode})` : ""}
                      </span>
                    </div>
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-purple-900/70 font-medium space-y-1">
                  <p>Location not found. Try a nearby area, city or complete address.</p>
                  <button
                    type="button"
                    onClick={() => setIsManual(true)}
                    className="text-[11px] text-purple-700 font-extrabold hover:underline"
                  >
                    Enter address manually →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Trigger to manual fallback */}
          {!isOpen && (
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setIsManual(true)}
                className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Enter address manually
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
