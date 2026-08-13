"use client";

import React, { useEffect, useState } from "react";
import {
  INDIAN_STATES,
  getCitiesForState,
  getLocalitiesForCity,
  State,
  City,
  Locality,
} from "@/lib/locations";
import { MapPin } from "lucide-react";

export interface LocationSelectionValue {
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  localityId: string;
  localityName: string;
}

interface LocationSelectorProps {
  value?: Partial<LocationSelectionValue>;
  onChange: (value: LocationSelectionValue) => void;
  className?: string;
  disabled?: boolean;
  compact?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  className = "",
  disabled = false,
  compact = false,
}: LocationSelectorProps) {
  const [selectedStateId, setSelectedStateId] = useState(value?.stateId || "");
  const [selectedCityId, setSelectedCityId] = useState(value?.cityId || "");
  const [selectedLocalityId, setSelectedLocalityId] = useState(value?.localityId || "");

  // Sync internal state with external value changes
  useEffect(() => {
    if (value) {
      if (value.stateId !== undefined && value.stateId !== selectedStateId) {
        setSelectedStateId(value.stateId);
      }
      if (value.cityId !== undefined && value.cityId !== selectedCityId) {
        setSelectedCityId(value.cityId);
      }
      if (value.localityId !== undefined && value.localityId !== selectedLocalityId) {
        setSelectedLocalityId(value.localityId);
      }
    }
  }, [value?.stateId, value?.cityId, value?.localityId]);

  const availableCities = getCitiesForState(selectedStateId);
  const availableLocalities = getLocalitiesForCity(selectedStateId, selectedCityId);

  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedCityId("");
    setSelectedLocalityId("");

    const stateObj = INDIAN_STATES.find((s) => s.id === stateId);
    onChange({
      stateId,
      stateName: stateObj?.name || "",
      cityId: "",
      cityName: "",
      localityId: "",
      localityName: "",
    });
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedLocalityId("");

    const stateObj = INDIAN_STATES.find((s) => s.id === selectedStateId);
    const cityObj = availableCities.find((c) => c.id === cityId);

    onChange({
      stateId: selectedStateId,
      stateName: stateObj?.name || "",
      cityId,
      cityName: cityObj?.name || "",
      localityId: "",
      localityName: "",
    });
  };

  const handleLocalityChange = (localityId: string) => {
    setSelectedLocalityId(localityId);

    const stateObj = INDIAN_STATES.find((s) => s.id === selectedStateId);
    const cityObj = availableCities.find((c) => c.id === selectedCityId);
    const localityObj = availableLocalities.find((l) => l.id === localityId);

    onChange({
      stateId: selectedStateId,
      stateName: stateObj?.name || "",
      cityId: selectedCityId,
      cityName: cityObj?.name || "",
      localityId,
      localityName: localityObj?.name || "",
    });
  };

  const selectStyles = compact
    ? "px-3 py-2 text-xs rounded-xl bg-purple-50/40 border border-purple-200 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
    : "w-full px-4 py-3 text-sm rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={compact ? "grid grid-cols-1 sm:grid-cols-3 gap-2" : "grid grid-cols-1 sm:grid-cols-3 gap-4"}>
        {/* State Dropdown */}
        <div>
          {!compact && (
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-600" /> State *
            </label>
          )}
          <select
            disabled={disabled}
            value={selectedStateId}
            onChange={(e) => handleStateChange(e.target.value)}
            className={selectStyles}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Dropdown */}
        <div>
          {!compact && (
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              City *
            </label>
          )}
          <select
            disabled={disabled || !selectedStateId}
            value={selectedCityId}
            onChange={(e) => handleCityChange(e.target.value)}
            className={selectStyles}
          >
            <option value="">
              {!selectedStateId ? "Select State First" : "Select City"}
            </option>
            {availableCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Locality Dropdown */}
        <div>
          {!compact && (
            <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-1.5">
              Locality / Area *
            </label>
          )}
          <select
            disabled={disabled || !selectedCityId}
            value={selectedLocalityId}
            onChange={(e) => handleLocalityChange(e.target.value)}
            className={selectStyles}
          >
            <option value="">
              {!selectedCityId ? "Select City First" : "Select Locality"}
            </option>
            {availableLocalities.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {locality.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
