"use client";

import type { Map as LeafletMap } from "leaflet";
import { Minus, Plus, Locate } from "lucide-react";

import { MAP_BOUNDS } from "./mapStyle";

/**
 * Управление картой: масштаб и возврат к обзору Жетісу.
 *
 * Стандартный zoomControl Leaflet выключен — он рисуется его же стилями
 * и выбивается из оформления сайта. Кнопка возврата нужна потому, что
 * перемещение по карте ничем не ограничено: уехать за пределы региона
 * можно, и вернуться надо одним нажатием, а не перетаскиванием.
 */
export function MapControls({ map }: { map: LeafletMap | null }) {
  if (!map) return null;

  const button =
    "flex size-9 items-center justify-center border-line bg-paper-bright text-forest-800 transition-colors hover:bg-sage-100 disabled:cursor-not-allowed disabled:text-graphite-400 disabled:hover:bg-paper-bright";

  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line shadow-raised">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Жақындату"
        className={`${button} border-b`}
      >
        <Plus size={16} />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Алыстату"
        className={`${button} border-b`}
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        onClick={() => map.fitBounds(MAP_BOUNDS)}
        aria-label="Жетісуға оралу"
        title="Жетісуға оралу"
        className={button}
      >
        <Locate size={15} />
      </button>
    </div>
  );
}
