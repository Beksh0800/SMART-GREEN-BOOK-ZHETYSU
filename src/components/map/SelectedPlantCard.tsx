"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

import { PlantPlaceholder } from "@/components/plant/PlantPlaceholder";
import { EndemicBadge, IndicatorBadge, IucnBadge, RedBookBadge } from "@/components/ui/Badge";
import { habitatLabels, precisionLabels } from "@/lib/labels";
import type { Plant, Zone } from "@/lib/schema";

/** Карточка выбранного вида поверх карты: превью данных и переход в полный паспорт. */
export function SelectedPlantCard({
  plant,
  zones,
  onClose,
}: {
  plant: Plant;
  zones: Zone[];
  onClose: () => void;
}) {
  return (
    <div className="flex max-h-full flex-col overflow-hidden rounded-card border border-line bg-paper shadow-raised">
      <div className="relative h-52 shrink-0 sm:h-56">
        {plant.photo ? (
          <Image
            src={`/images/plants/${plant.photo.file}`}
            alt={plant.name.kk}
            fill
            sizes="380px"
            className="object-cover"
          />
        ) : (
          <PlantPlaceholder slug={plant.slug} className="h-full w-full" label="" />
        )}
        {plant.photo && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3/5"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,39,31,0) 0%, rgba(18,39,31,0.72) 70%, rgba(18,39,31,0.92) 100%)",
            }}
          />
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Жабу"
          className={`absolute top-3 right-3 rounded-badge p-1.5 backdrop-blur-sm transition-colors ${
            plant.photo
              ? "border border-paper/30 bg-graphite-900/35 text-paper hover:bg-graphite-900/60"
              : "border border-line bg-paper/90 text-graphite-600 hover:bg-paper"
          }`}
        >
          <X size={15} />
        </button>

        {plant.photo && (
          <div className="absolute inset-x-5 bottom-4">
            <h2 className="font-display text-xl leading-tight font-semibold text-paper">
              {plant.name.kk}
            </h2>
            <p className="latin mt-1 text-sm text-paper/75">{plant.name.la}</p>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {!plant.photo && (
          <div className="mb-4">
            <h2 className="font-display text-xl leading-tight font-semibold text-forest-900">
              {plant.name.kk}
            </h2>
            <p className="latin mt-1 text-sm text-graphite-600">{plant.name.la}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {plant.status.redBookKz && <RedBookBadge category={plant.status.redBookKz} />}
          {plant.status.iucn && <IucnBadge category={plant.status.iucn} />}
          {plant.status.endemic && <EndemicBadge type={plant.status.endemic} />}
          {plant.bioIndicator.isIndicator && <IndicatorBadge />}
        </div>

        <p className="mt-4 text-sm text-graphite-600">{plant.description.summary}</p>

        <p className="mt-4 text-xs text-graphite-400">
          {plant.habitat.map((h) => habitatLabels[h]).join(" · ")}
        </p>

        <ul className="mt-4 space-y-2 border-t border-line pt-3">
          {plant.locations.map((location) => (
            <li key={`${location.lat}-${location.lon}`} className="text-xs text-graphite-600">
              <span className="font-semibold text-graphite-900">
                {zones.find((z) => z.id === location.zoneId)?.name.kk}
              </span>
              <br />
              {location.label}
              <span className="text-graphite-400">
                {" "}
                · {precisionLabels[location.precision].label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={`/plant/${plant.slug}`}
        className="flex shrink-0 items-center justify-between gap-2 border-t border-line bg-forest-800 px-5 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-700"
      >
        Толық паспортты ашу
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
