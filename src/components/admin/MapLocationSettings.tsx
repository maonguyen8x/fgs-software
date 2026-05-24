"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Link2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { GoogleMapEmbed } from "@/components/contact/GoogleMapEmbed";
import { MAP_SETTING_KEYS, GOOGLE_MAPS_AUTOCOMPLETE_DEBOUNCE_MS } from "@/config/google-maps";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { buildMapEmbedUrl } from "@/lib/maps/google-maps-api";

interface MapValuesProps {
  values: Record<string, string>;
  onChange: (patch: Record<string, string>) => void;
}

interface Suggestion {
  id: string;
  description: string;
  latitude?: number;
  longitude?: number;
  provider: "google" | "nominatim";
}

export function applyMapLocation(
  onChange: (patch: Record<string, string>) => void,
  location: {
    address: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    embedUrl: string;
  }
) {
  onChange({
    [MAP_SETTING_KEYS.mapAddress]: location.address,
    [MAP_SETTING_KEYS.latitude]: String(location.latitude),
    [MAP_SETTING_KEYS.longitude]: String(location.longitude),
    [MAP_SETTING_KEYS.embedUrl]: location.embedUrl,
    [MAP_SETTING_KEYS.placeId]: location.placeId ?? "",
  });
}

export function GoogleMapsAddressField({ values, onChange }: MapValuesProps) {
  const t = useTranslations("admin.settings.maps");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mapAddress = values[MAP_SETTING_KEYS.mapAddress] ?? "";

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/admin/maps/autocomplete?input=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const selectSuggestion = async (item: Suggestion) => {
    setShowSuggestions(false);
    setSuggestions([]);

    if (item.latitude !== undefined && item.longitude !== undefined) {
      applyMapLocation(onChange, {
        address: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
        placeId: item.id,
        embedUrl: buildMapEmbedUrl(item.latitude, item.longitude),
      });
      showAdminSuccessToast(t("location_applied"));
      return;
    }

    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/admin/maps/place-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          description: item.description,
          provider: item.provider,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.location) {
        showAdminErrorToast(t("errors.place_failed"));
        return;
      }
      applyMapLocation(onChange, data.location);
      showAdminSuccessToast(t("location_applied"));
    } catch {
      showAdminErrorToast(t("errors.network"));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applyManualAddress = async () => {
    const query = mapAddress.trim();
    if (query.length < 3) return;
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/admin/maps/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: query }),
      });
      const data = await res.json();
      if (!res.ok || !data.location) {
        showAdminErrorToast(t("errors.geocode_failed"));
        return;
      }
      applyMapLocation(onChange, data.location);
      showAdminSuccessToast(t("location_applied"));
    } catch {
      showAdminErrorToast(t("errors.network"));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleChange = (value: string) => {
    onChange({ [MAP_SETTING_KEYS.mapAddress]: value });
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(value);
    }, GOOGLE_MAPS_AUTOCOMPLETE_DEBOUNCE_MS);
  };

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-1">
      <RequiredLabel htmlFor="settings-map-address">{t("map_address")}</RequiredLabel>
      <div className="mt-1 flex gap-2">
        <Input
          id="settings-map-address"
          value={mapAddress}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => mapAddress.length >= 3 && setShowSuggestions(true)}
          placeholder={t("map_address_placeholder")}
          autoComplete="off"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0 cursor-pointer"
          disabled={loadingSuggestions || mapAddress.trim().length < 3}
          onClick={() => void applyManualAddress()}
        >
          {loadingSuggestions ? <Loader2 className="h-4 w-4 animate-spin" /> : t("apply_address")}
        </Button>
      </div>

      {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
        <ul
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          role="listbox"
        >
          {loadingSuggestions && suggestions.length === 0 ? (
            <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-theme">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("searching")}
            </li>
          ) : (
            suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-start gap-2 px-3 py-2 text-left text-sm text-heading hover:bg-primary-50 dark:hover:bg-primary-950/40"
                  onClick={() => void selectSuggestion(item)}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <span>{item.description}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      <p className="text-xs text-muted-theme">{t("map_address_hint")}</p>
    </div>
  );
}

export function GoogleMapsLinkSettings({ values, onChange }: MapValuesProps) {
  const t = useTranslations("admin.settings.maps");
  const [mapsLink, setMapsLink] = useState("");
  const [resolving, setResolving] = useState(false);
  const [manualLat, setManualLat] = useState(values[MAP_SETTING_KEYS.latitude] ?? "");
  const [manualLng, setManualLng] = useState(values[MAP_SETTING_KEYS.longitude] ?? "");

  const lat = parseFloat(values[MAP_SETTING_KEYS.latitude] ?? "");
  const lng = parseFloat(values[MAP_SETTING_KEYS.longitude] ?? "");
  const mapAddress = values[MAP_SETTING_KEYS.mapAddress] ?? values[MAP_SETTING_KEYS.address] ?? "";
  const embedUrl = values[MAP_SETTING_KEYS.embedUrl];
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  const resolveMapsLink = async () => {
    const url = mapsLink.trim();
    if (!url) return;
    setResolving(true);
    try {
      const res = await fetch("/api/admin/maps/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || !data.location) {
        showAdminErrorToast(t("errors.resolve_failed"));
        return;
      }
      applyMapLocation(onChange, data.location);
      setManualLat(String(data.location.latitude));
      setManualLng(String(data.location.longitude));
      setMapsLink("");
      showAdminSuccessToast(t("location_applied"));
    } catch {
      showAdminErrorToast(t("errors.network"));
    } finally {
      setResolving(false);
    }
  };

  const applyManualCoordinates = () => {
    const latitude = parseFloat(manualLat);
    const longitude = parseFloat(manualLng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      showAdminErrorToast(t("errors.invalid_coordinates"));
      return;
    }
    const label = mapAddress.trim() || `${latitude}, ${longitude}`;
    applyMapLocation(onChange, {
      address: label,
      latitude,
      longitude,
      embedUrl: buildMapEmbedUrl(latitude, longitude),
    });
    showAdminSuccessToast(t("location_applied"));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="settings-maps-link">{t("maps_link")}</Label>
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-theme" />
            <Input
              id="settings-maps-link"
              className="pl-9"
              value={mapsLink}
              onChange={(e) => setMapsLink(e.target.value)}
              placeholder={t("maps_link_placeholder")}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 cursor-pointer"
            disabled={resolving || !mapsLink.trim()}
            onClick={() => void resolveMapsLink()}
          >
            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("apply_link")}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-theme">{t("maps_link_hint")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="manual-lat">{t("latitude")}</Label>
          <Input
            id="manual-lat"
            className="mt-1"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            placeholder="16.0544"
          />
        </div>
        <div>
          <Label htmlFor="manual-lng">{t("longitude")}</Label>
          <Input
            id="manual-lng"
            className="mt-1"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            placeholder="108.2022"
          />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={applyManualCoordinates}
      >
        {t("apply_coordinates")}
      </Button>

      {hasCoordinates && (
        <div>
          <Label>{t("preview")}</Label>
          <div className="mt-2 h-56 overflow-hidden rounded-xl">
            <GoogleMapEmbed
              address={mapAddress}
              latitude={lat}
              longitude={lng}
              embedUrl={embedUrl}
              className="h-56"
            />
          </div>
        </div>
      )}
    </div>
  );
}
