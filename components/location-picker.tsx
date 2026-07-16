"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Loader2 } from "lucide-react";
import type { Map as LMap, Marker as LMarker } from "leaflet";
import { requestLocation } from "@/lib/location";
import { haptic } from "@/lib/telegram-webapp";

// Toshkent markazi — boshlang'ich fallback
const TASHKENT: [number, number] = [41.3111, 69.2797];

interface Props {
  value: { lat: number; lng: number } | null;
  onChange: (loc: { lat: number; lng: number }) => void;
  className?: string;
}

/**
 * OpenStreetMap (Leaflet) xarita — foydalanuvchi markerni surib yoki
 * xaritaga bosib joylashuvni belgilaydi. Kalitsiz, bepul.
 */
export function LocationPicker({ value, onChange, className }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const markerRef = useRef<LMarker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !boxRef.current || mapRef.current) return;

      const start: [number, number] = value
        ? [value.lat, value.lng]
        : TASHKENT;

      const map = L.map(boxRef.current, {
        center: start,
        zoom: value ? 16 : 12,
        zoomControl: true,
        attributionControl: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Rasm-ikonasiz marker (bundler muammolarini oldini olish uchun)
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:26px;height:26px;transform:translate(-50%,-100%);
          display:flex;align-items:center;justify-content:center;
          filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#059669" stroke="#fff" stroke-width="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none"/>
          </svg></div>`,
        iconSize: [26, 26],
        iconAnchor: [0, 0],
      });

      const marker = L.marker(start, { draggable: true, icon }).addTo(map);
      markerRef.current = marker;

      const emit = (lat: number, lng: number) => {
        onChangeRef.current({ lat, lng });
      };
      if (value) emit(value.lat, value.lng);

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        haptic.select();
        emit(p.lat, p.lng);
      });
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        haptic.select();
        emit(e.latlng.lat, e.latlng.lng);
      });

      // Modal/sheet ichida to'g'ri chizilishi uchun
      setTimeout(() => map.invalidateSize(), 200);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Faqat bir marta ishga tushadi (value keyingi o'zgarishlari markerni buzmasin)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function locateMe() {
    setLocating(true);
    try {
      const l = await requestLocation();
      const map = mapRef.current;
      const marker = markerRef.current;
      if (map && marker) {
        marker.setLatLng([l.lat, l.lng]);
        map.setView([l.lat, l.lng], 16);
      }
      onChangeRef.current(l);
      haptic.notify("success");
    } catch {
      /* ruxsat berilmadi — foydalanuvchi qo'lда belgilaydi */
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className={"relative overflow-hidden rounded-2xl border border-line " + (className ?? "")}>
      <div ref={boxRef} className="h-56 w-full" />
      <button
        type="button"
        onClick={locateMe}
        disabled={locating}
        className="press absolute right-2.5 top-2.5 z-[500] flex items-center gap-1.5 rounded-xl bg-surface/95 px-3 py-2 text-xs font-bold text-ink shadow-md backdrop-blur disabled:opacity-60"
      >
        {locating ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <LocateFixed size={14} className="text-brand-600" />
        )}
        Mening joyim
      </button>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[500] bg-gradient-to-t from-ink/55 to-transparent px-3 py-2 text-center text-[11px] font-medium text-white">
        Nuqtani bosing yoki markerni suring
      </div>
    </div>
  );
}
