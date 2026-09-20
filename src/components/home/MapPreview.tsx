"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import type { Plant, Zone } from "@/lib/schema";

const PlantMapCanvas = dynamic(
  () => import("@/components/map/PlantMapCanvas").then((m) => m.PlantMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-paper-dim">
        <span className="text-xs text-graphite-400">Карта жүктелуде…</span>
      </div>
    ),
  },
);

/** Превью карты на главной: настоящая карта с настоящими точками, но без панели фильтров. */
export function MapPreview({ plants, zones }: { plants: Plant[]; zones: Zone[] }) {
  return (
    <Link
      href="/map"
      className="isolate block aspect-4/3 overflow-hidden rounded-card border border-line"
      aria-label="Толық картаны ашу"
    >
      <div className="pointer-events-none h-full w-full">
        <PlantMapCanvas
          plants={plants}
          zones={zones}
          selected={null}
          onSelect={() => {}}
          showZones={false}
        />
      </div>
    </Link>
  );
}
