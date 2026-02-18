"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

export interface LocationPickerProps {
  city: string;
  country?: string;
  onLocationChange: (location: {
    lat: number;
    lng: number;
    city: string;
    country?: string;
  }) => void;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function LocationPicker(props: LocationPickerProps) {
  const [query, setQuery] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }
    try {
      setSearching(true);
      setMessage(null);
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("q", trimmed);
      url.searchParams.set("limit", "5");
      const response = await fetch(url.toString(), {
        headers: {
          "accept-language": "en"
        }
      });
      if (!response.ok) {
        setMessage("Unable to search this location right now.");
        return;
      }
      const results = (await response.json()) as NominatimResult[];
      if (!results.length) {
        setMessage("No results found for this query.");
        return;
      }
      const first = results[0];
      const lat = Number(first.lat);
      const lng = Number(first.lon);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        setMessage("This location could not be resolved.");
        return;
      }
      const label = first.display_name;
      const cityLabel = label.split(",")[0] ?? trimmed;
      props.onLocationChange({
        lat,
        lng,
        city: cityLabel,
        country: undefined
      });
      setMessage(`Using location: ${cityLabel}`);
    } catch {
      setMessage("Unexpected error while searching for this location.");
    } finally {
      setSearching(false);
    }
  }

  const currentLabel = props.country
    ? `${props.city}, ${props.country}`
    : props.city || "Unknown location";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-300" />
          <span>Location</span>
        </div>
        <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
          {currentLabel}
        </span>
      </div>
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search city, country"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-0 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
        />
        <button
          type="submit"
          disabled={searching}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-600/70"
        >
          {searching && (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-emerald-950" />
          )}
          Set location
        </button>
      </form>
      {message && (
        <p className="text-xs text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}
