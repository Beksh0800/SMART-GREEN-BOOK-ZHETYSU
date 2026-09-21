"use client";

import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { emptyFilters, filterPlants, isFilterActive, type PlantFilters } from "@/lib/filters";
import type { Plant, Zone } from "@/lib/schema";

import { BloomTimeline } from "./BloomTimeline";
import { FilterPanel } from "./FilterPanel";
import { MapControls } from "./MapControls";
import { MapLegend } from "./MapLegend";
import { SelectedPlantCard } from "./SelectedPlantCard";

const PlantMapCanvas = dynamic(() => import("./PlantMapCanvas").then((m) => m.PlantMapCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-paper-dim">
      <span className="text-sm text-graphite-400">Карта жүктелуде…</span>
    </div>
  ),
});

/**
 * Модуль PlantMap: карта во весь экран, панели поверх неё.
 * На мобильном фильтры открываются отдельным слоем, карточка вида — снизу.
 */
export function PlantMapView({ plants, zones }: { plants: Plant[]; zones: Zone[] }) {
  const [filters, setFilters] = useState<PlantFilters>(emptyFilters);
  const [selected, setSelected] = useState<Plant | null>(null);
  const [showZones, setShowZones] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Экземпляр Leaflet нужен кнопкам масштаба: они лежат поверх карты,
  // в общем слое панелей, а не внутри самого контейнера карты.
  const [map, setMap] = useState<LeafletMap | null>(null);
  const reduced = useReducedMotion();

  const visible = useMemo(() => filterPlants(plants, filters), [plants, filters]);

  // Выбранный вид, выпавший из выборки, не должен оставаться на карте
  const selectedVisible = selected && visible.some((p) => p.slug === selected.slug) ? selected : null;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Leaflet раздаёт своим слоям z-index до 800. Без изоляции они
          перекрывают панели поверх карты, поэтому карта живёт
          в собственном контексте наложения. */}
      <div className="absolute inset-0 isolate z-0">
        <PlantMapCanvas
          plants={visible}
          zones={zones}
          selected={selectedVisible}
          onSelect={setSelected}
          showZones={showZones}
          onReady={setMap}
        />
      </div>

      {/* Фильтры: слева на десктопе, слоем на мобильном */}
      <div
        className={`absolute inset-y-0 left-0 z-30 w-full max-w-[22rem] overflow-y-auto border-r border-line bg-paper/96 p-5 backdrop-blur-sm transition-transform duration-300 md:w-[22rem] ${
          filtersOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">PlantMap</p>
            <h1 className="mt-1 font-display text-lg font-semibold text-forest-900">
              Жетісу өсімдіктерінің картасы
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Сүзгілерді жабу"
            className="rounded-badge border border-line p-1.5 text-graphite-600 md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <FilterPanel
          filters={filters}
          onChange={setFilters}
          zones={zones}
          resultCount={visible.length}
          totalCount={plants.length}
        />

        {visible.length === 0 && (
          <p className="mt-6 rounded-card border border-line bg-paper-dim p-4 text-sm text-graphite-600">
            Таңдалған шарттарға сәйкес өсімдік табылмады. Сүзгілерді азайтып көріңіз.
          </p>
        )}
      </div>

      {/* Кнопка фильтров на мобильном */}
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 rounded-badge border border-line bg-paper px-3.5 py-2.5 text-sm font-semibold text-forest-800 shadow-raised md:hidden"
      >
        <SlidersHorizontal size={15} />
        Сүзгілер
        {isFilterActive(filters) && <span className="size-1.5 rounded-full bg-ochre-500" />}
      </button>

      {/* Нижний ряд: легенда и шкала цветения.
          Справа оставлено место под карточку вида — ряд не переезжает,
          когда её открывают и закрывают. На мобильном шкала уступает
          место карточке: две панели поверх маленького экрана не помещаются. */}
      <div className="absolute inset-x-4 bottom-6 z-20 flex items-end gap-3 md:left-[23.5rem] md:right-[24.5rem]">
        <div className="hidden w-[15rem] shrink-0 md:block">
          <MapLegend showZones={showZones} onToggleZones={() => setShowZones((v) => !v)} />
        </div>
        <div className={`min-w-0 flex-1 md:max-w-[30rem] ${selectedVisible ? "hidden md:block" : ""}`}>
          <BloomTimeline
            plants={plants}
            month={filters.bloomMonth}
            onChange={(bloomMonth) => setFilters((f) => ({ ...f, bloomMonth }))}
          />
        </div>
        <div className={`shrink-0 ${selectedVisible ? "hidden md:block" : ""}`}>
          <MapControls map={map} />
        </div>
      </div>

      {/* Карточка выбранного вида */}
      <AnimatePresence>
        {selectedVisible && (
          <motion.div
            key={selectedVisible.slug}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute inset-x-3 bottom-3 z-30 max-h-[60vh] md:inset-x-auto md:top-4 md:right-4 md:bottom-4 md:w-[23rem] md:max-h-none"
          >
            <SelectedPlantCard
              plant={selectedVisible}
              zones={zones}
              onClose={() => setSelected(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
