"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { FilterPanel } from "@/components/map/FilterPanel";
import { PlantCard } from "@/components/plant/PlantCard";
import { emptyFilters, filterPlants, type PlantFilters } from "@/lib/filters";
import type { Plant, Zone } from "@/lib/schema";

/** Каталог охраняемых и эндемичных видов с теми же фильтрами, что и на карте. */
export function RedBookCatalog({ plants, zones }: { plants: Plant[]; zones: Zone[] }) {
  const [filters, setFilters] = useState<PlantFilters>(emptyFilters);
  const [panelOpen, setPanelOpen] = useState(false);

  const visible = useMemo(() => filterPlants(plants, filters), [plants, filters]);

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          className="mb-4 inline-flex w-full items-center justify-between gap-2 rounded-badge border border-line bg-paper-bright px-4 py-3 text-sm font-semibold text-forest-800 lg:hidden"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal size={15} />
            Сүзгілер
          </span>
          <span className="text-xs font-normal text-graphite-400">
            {visible.length} / {plants.length}
          </span>
        </button>

        <div className={panelOpen ? "block" : "hidden lg:block"}>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            zones={zones}
            resultCount={visible.length}
            totalCount={plants.length}
          />
        </div>
      </aside>

      <div>
        {visible.length === 0 ? (
          <div className="rounded-card border border-line bg-paper-bright p-10 text-center">
            <p className="font-display text-lg font-semibold text-forest-900">
              Сәйкес түр табылмады
            </p>
            <p className="mx-auto mt-2 max-w-measure text-sm text-graphite-600">
              Таңдалған шарттарға сай өсімдік жоқ. Бір-екі сүзгіні алып тастап көріңіз.
            </p>
            <button
              type="button"
              onClick={() => setFilters(emptyFilters)}
              className="mt-5 rounded-badge border border-line px-4 py-2 text-sm text-graphite-600 transition-colors hover:border-line-strong hover:bg-paper-dim"
            >
              Сүзгілерді тазалау
            </button>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((plant) => (
              <li key={plant.slug}>
                <PlantCard plant={plant} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
