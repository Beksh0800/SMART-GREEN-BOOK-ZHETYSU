"use client";

import { groupStyles, type PlantGroup } from "./mapStyle";

const order: PlantGroup[] = ["red-book", "endemic", "indicator", "common"];

export function MapLegend({
  showZones,
  onToggleZones,
}: {
  showZones: boolean;
  onToggleZones: () => void;
}) {
  return (
    <div className="rounded-card border border-line bg-paper/95 p-3.5 shadow-raised backdrop-blur-sm">
      <p className="eyebrow">Шартты белгілер</p>
      <ul className="mt-2.5 space-y-1.5">
        {order.map((group) => (
          <li key={group} className="flex items-center gap-2 text-xs text-graphite-600">
            <span
              className="block size-2.5 rounded-full border border-paper-bright"
              style={{ backgroundColor: groupStyles[group].color }}
            />
            {groupStyles[group].label}
          </li>
        ))}
        <li className="flex items-center gap-2 border-t border-line pt-2 text-xs text-graphite-600">
          <span className="block size-2.5 rounded-full border border-dashed border-graphite-400 bg-graphite-400/35" />
          Дәл координаты жоқ — шамамен
        </li>
      </ul>

      <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-line pt-2.5 text-xs text-graphite-600">
        <input
          type="checkbox"
          checked={showZones}
          onChange={onToggleZones}
          className="size-3.5 accent-[var(--color-forest-700)]"
        />
        Аймақтарды көрсету
      </label>
    </div>
  );
}
