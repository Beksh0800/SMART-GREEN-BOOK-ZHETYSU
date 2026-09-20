"use client";

import dynamic from "next/dynamic";

import type { PlantLocation, Zone } from "@/lib/schema";

/**
 * Leaflet обращается к window, поэтому карта грузится только в браузере.
 * Пока подгружается — показываем скелетон того же размера, чтобы макет не прыгал.
 */
const MiniMap = dynamic(() => import("./MiniMap").then((m) => m.MiniMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-paper-dim">
      <span className="text-xs text-graphite-400">Карта жүктелуде…</span>
    </div>
  ),
});

export function MiniMapLoader(props: {
  locations: PlantLocation[];
  zones: Zone[];
  color: string;
}) {
  return <MiniMap {...props} />;
}
