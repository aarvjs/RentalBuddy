export const runtime = "nodejs";

import { NextResponse } from "next/server";

export interface NominatimLocationResult {
  displayName: string;
  fullAddress: string;
  country: string;
  state: string;
  city: string;
  locality: string;
  pincode: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchQuery = `${query.trim()}, India`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(
      searchQuery
    )}`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "RentasBuddy-Marketplace/1.0 (contact@rentasbuddy.com)",
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();

    const results: NominatimLocationResult[] = (data || []).map((item: any) => {
      const addr = item.address || {};

      const city =
        addr.city ||
        addr.town ||
        addr.city_district ||
        addr.state_district ||
        addr.county ||
        addr.municipality ||
        "";

      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.village ||
        addr.road ||
        addr.amenity ||
        (item.display_name ? item.display_name.split(",")[0] : "") ||
        city;

      const state = addr.state || "";
      const country = addr.country || "India";
      const pincode = addr.postcode || "";
      const lat = parseFloat(item.lat || "0");
      const lon = parseFloat(item.lon || "0");

      const fullAddressParts = [locality, city, state, country].filter(Boolean);
      const fullAddress = Array.from(new Set(fullAddressParts)).join(", ");

      return {
        displayName: item.display_name || fullAddress,
        fullAddress: fullAddress || item.display_name || "",
        country,
        state,
        city: city || locality,
        locality: locality || city,
        pincode,
        latitude: lat,
        longitude: lon,
        placeId: String(item.place_id || item.osm_id || Math.random()),
      };
    });

    // Remove duplicates based on fullAddress
    const uniqueResults = results.filter(
      (item, idx, self) =>
        idx === self.findIndex((t) => t.fullAddress.toLowerCase() === item.fullAddress.toLowerCase())
    );

    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    console.error("Error fetching Nominatim location search:", error);
    return NextResponse.json({ results: [] });
  }
}
