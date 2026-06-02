"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  Search,
  X,
  LocateFixed,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  POPULAR AREAS — quick-pick for common Accra delivery zones        */
/* ------------------------------------------------------------------ */
const POPULAR_AREAS = [
  "East Legon",
  "Cantonments",
  "Airport Residential",
  "Osu",
  "Labone",
  "Dzorwulu",
  "Spintex Road",
  "Tema",
  "Madina",
  "Achimota",
  "Dansoman",
  "Kasoa",
];

/* ------------------------------------------------------------------ */
/*  ACCRA AREA DATABASE — offline autocomplete fallback               */
/* ------------------------------------------------------------------ */
const ACCRA_AREAS: string[] = [
  // Greater Accra
  "East Legon", "East Legon Hills", "West Legon",
  "Cantonments", "Airport Residential Area", "Airport Hills",
  "Osu", "Osu Badu", "Osu Oxford Street",
  "Labone", "Labone Estate",
  "Dzorwulu", "Abelemkpe",
  "Roman Ridge", "Ridge",
  "North Ridge", "South Ridge",
  "Ringway Estates",
  "Spintex Road", "Baatsonaa", "Nmai Djorn",
  "Tema Community 1", "Tema Community 2", "Tema Community 5",
  "Tema Community 25", "Tema New Town", "Tema Industrial Area",
  "Sakumono", "Lashibi",
  "Teshie", "Nungua", "La",
  "Adenta", "Adenta Housing",
  "Madina", "Madina Zongo",
  "Dome", "Kwabenya",
  "Achimota", "Achimota Mile 7",
  "Legon", "University of Ghana",
  "Haatso", "Taifa", "Ofankor",
  "Pokuase", "Amasaman",
  "Dansoman", "North Kaneshie",
  "Kaneshie", "Abeka", "Lapaz",
  "Darkuman", "Bubuashie",
  "Circle", "Kwame Nkrumah Circle",
  "Makola", "Tudu",
  "James Town", "Ussher Town",
  "Korle Bu",
  "Mamprobi", "Chorkor",
  "Weija", "Gbawe", "Mallam",
  "Kasoa", "Kasoa Millenium City",
  "McCarthy Hill", "Anyaa",
  "Awoshie", "Ablekuma",
  "Santa Maria", "Kokomlemle",
  "Tesano", "Alajo",
  "Newtown", "Nima",
  "Mamobi", "Asylum Down",
  "North Dzorwulu", "South Dzorwulu",
  "Tantra Hill", "Westlands",
  "Trasacco Valley",
  "Adjiringanor", "Oyarifa",
  "Pantang", "Abokobi",
  "Dodowa", "Prampram",
  "Ningo",
  "Ashaiman",
  "Botwe", "Lakeside Estate",
  "Ogbojo",
  "Tseaddo", "Kotobabi",
  "Pig Farm",
  "Kanda", "Kanda Estates",
  "Shiashie", "Okponglo",
  "Atomic", "Atomic Junction",
  "Agbogba",
  "American House",
  "Bawaleshie",
];

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */
export interface LocationData {
  address: string;
  lat?: number;
  lng?: number;
  isLiveLocation?: boolean;
  googleMapsUrl?: string;
}

interface LocationPickerProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  error?: string;
  onClearError?: () => void;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */
export default function LocationPicker({
  value,
  onChange,
  error,
  onClearError,
}: LocationPickerProps) {
  const [query, setQuery] = useState(value.address);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPopularAreas, setShowPopularAreas] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync internal query when parent clears
  useEffect(() => {
    if (!value.address && query) setQuery("");
  }, [value.address]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setShowPopularAreas(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Autocomplete (offline fuzzy match on Accra areas) ────────── */
  const searchAreas = useCallback((input: string) => {
    const q = input.toLowerCase().trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = ACCRA_AREAS.filter((area) =>
      area.toLowerCase().includes(q)
    ).slice(0, 8);

    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    onClearError?.();

    // Update parent with text
    onChange({ address: val });

    // Debounced search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAreas(val), 150);
  };

  const selectSuggestion = (area: string) => {
    setQuery(area);
    setShowSuggestions(false);
    setShowPopularAreas(false);
    onChange({ address: area });
    onClearError?.();
  };

  const clearLocation = () => {
    setQuery("");
    onChange({ address: "" });
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  /* ── Live Location (GPS) ──────────────────────────────────────── */
  const requestLiveLocation = () => {
    if (!("geolocation" in navigator)) {
      setGpsError("Location not supported on this device");
      return;
    }

    setGpsLoading(true);
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`;

        // Try reverse geocoding via Nominatim (free, no key needed)
        let displayAddress = `📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "User-Agent": "JusWellness/1.0" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              // Shorten to useful parts
              const parts = data.display_name.split(",").slice(0, 4);
              displayAddress = parts.join(",").trim();
            }
          }
        } catch {
          // Fallback to coords — that's fine
        }

        setQuery(displayAddress);
        onChange({
          address: displayAddress,
          lat: latitude,
          lng: longitude,
          isLiveLocation: true,
          googleMapsUrl: mapsUrl,
        });
        setGpsLoading(false);
        onClearError?.();
      },
      (err) => {
        setGpsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsError("Location permission denied. Please allow in browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGpsError("Location unavailable. Try typing your address instead.");
            break;
          case err.TIMEOUT:
            setGpsError("Location request timed out. Please try again.");
            break;
          default:
            setGpsError("Could not get location. Try typing your address.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const hasLocation = !!value.address;

  return (
    <div ref={wrapperRef} className="space-y-2">
      {/* Main input */}
      <div className="relative">
        <MapPin
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
            value.isLiveLocation
              ? "text-green-500"
              : isFocused
                ? "text-brand-green"
                : "text-gray-400"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2) searchAreas(query);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay closing so clicks on suggestions register
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder="Search area or use live location..."
          maxLength={200}
          autoComplete="off"
          className={`w-full pl-10 pr-20 py-3.5 rounded-xl border transition-all text-sm ${
            error
              ? "border-red-400 focus:ring-red-200"
              : value.isLiveLocation
                ? "border-green-400 bg-green-50/50 focus:ring-green-200"
                : "border-gray-200 focus:ring-brand-green/20 focus:border-brand-green"
          } focus:ring-2 outline-none`}
        />

        {/* Right-side buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasLocation && (
            <button
              type="button"
              onClick={clearLocation}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Clear location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={requestLiveLocation}
            disabled={gpsLoading}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
              gpsLoading
                ? "bg-gray-100 text-gray-400"
                : value.isLiveLocation
                  ? "bg-green-100 text-green-700"
                  : "bg-brand-green/10 text-brand-green hover:bg-brand-green/20"
            }`}
            aria-label="Use live location"
          >
            {gpsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : value.isLiveLocation ? (
              <LocateFixed className="w-3.5 h-3.5" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {gpsLoading ? "Locating..." : value.isLiveLocation ? "Located" : "GPS"}
            </span>
          </button>
        </div>
      </div>

      {/* Live location badge */}
      <AnimatePresence>
        {value.isLiveLocation && value.googleMapsUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200"
          >
            <LocateFixed className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span className="text-xs text-green-700 flex-1 truncate">
              Live location pinned
            </span>
            <a
              href={value.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-green-700 underline shrink-0"
            >
              View on Map
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GPS error */}
      <AnimatePresence>
        {gpsError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-amber-600 flex items-center gap-1"
          >
            <Navigation className="w-3 h-3" />
            {gpsError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Validation error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* Autocomplete suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-20 relative"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Matching areas
              </p>
            </div>
            {suggestions.map((area) => (
              <button
                key={area}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur
                  selectSuggestion(area);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-green/5 transition-colors flex items-center gap-2.5 border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-gray-700">{area}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular areas (toggle) */}
      <div>
        <button
          type="button"
          onClick={() => setShowPopularAreas((p) => !p)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${showPopularAreas ? "rotate-180" : ""}`}
          />
          Popular delivery areas
        </button>

        <AnimatePresence>
          {showPopularAreas && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1.5 pt-2"
            >
              {POPULAR_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => selectSuggestion(area)}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                    value.address === area
                      ? "bg-brand-green/10 border-brand-green text-brand-green"
                      : "border-gray-200 text-gray-500 hover:border-brand-green/40 hover:text-brand-green"
                  }`}
                >
                  {area}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
