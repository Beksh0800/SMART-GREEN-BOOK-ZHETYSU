"use client";

import { Search, X } from "lucide-react";

import {
  emptyFilters,
  isFilterActive,
  toggleValue,
  type PlantFilters,
} from "@/lib/filters";
import { habitatLabels, indicatorFactorLabels, redBookLabels } from "@/lib/labels";
import {
  HABITAT_TYPES,
  INDICATOR_FACTORS,
  RED_BOOK_CATEGORIES,
  type Zone,
} from "@/lib/schema";

/** Кнопка-переключатель фильтра: рамка вместо заливки в неактивном состоянии. */
function Chip({
  active,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-badge border px-2.5 py-1.5 text-left text-xs transition-colors ${
        active
          ? "border-transparent font-semibold text-paper-bright"
          : "border-line bg-paper-bright text-graphite-600 hover:border-line-strong hover:bg-paper-dim"
      }`}
      style={active ? { backgroundColor: tone ?? "var(--color-forest-700)" } : undefined}
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="eyebrow">{title}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function FilterPanel({
  filters,
  onChange,
  zones,
  resultCount,
  totalCount,
}: {
  filters: PlantFilters;
  onChange: (next: PlantFilters) => void;
  zones: Zone[];
  resultCount: number;
  totalCount: number;
}) {
  const set = (patch: Partial<PlantFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-graphite-400"
        />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Атауы немесе тұқымдасы бойынша іздеу"
          aria-label="Өсімдікті іздеу"
          className="w-full rounded-badge border border-line bg-paper-bright py-2.5 pr-3 pl-9 text-sm text-graphite-900 placeholder:text-graphite-400 focus:border-forest-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-graphite-600">
        <span>
          <strong className="font-semibold text-graphite-900">{resultCount}</strong> / {totalCount}{" "}
          түр
        </span>
        {isFilterActive(filters) && (
          <button
            type="button"
            onClick={() => onChange(emptyFilters)}
            className="inline-flex items-center gap-1 text-graphite-400 transition-colors hover:text-forest-700"
          >
            <X size={13} />
            Сүзгілерді тазалау
          </button>
        )}
      </div>

      <Group title="Қорғау мәртебесі">
        {RED_BOOK_CATEGORIES.map((category) => (
          <Chip
            key={category}
            active={filters.redBook.includes(category)}
            tone={redBookLabels[category].token}
            onClick={() => set({ redBook: toggleValue(filters.redBook, category) })}
          >
            {redBookLabels[category].short}
          </Chip>
        ))}
        <Chip
          active={filters.endemicOnly}
          onClick={() => set({ endemicOnly: !filters.endemicOnly })}
        >
          Эндемиктер
        </Chip>
        <Chip
          active={filters.indicatorOnly}
          tone="var(--color-sage-600)"
          onClick={() => set({ indicatorOnly: !filters.indicatorOnly })}
        >
          Биоиндикаторлар
        </Chip>
      </Group>

      <Group title="Аймақ">
        {zones.map((zone) => (
          <Chip
            key={zone.id}
            active={filters.zoneIds.includes(zone.id)}
            onClick={() => set({ zoneIds: toggleValue(filters.zoneIds, zone.id) })}
          >
            {zone.name.kk}
          </Chip>
        ))}
      </Group>

      <Group title="Мекен түрі">
        {HABITAT_TYPES.map((habitat) => (
          <Chip
            key={habitat}
            active={filters.habitats.includes(habitat)}
            onClick={() => set({ habitats: toggleValue(filters.habitats, habitat) })}
          >
            {habitatLabels[habitat]}
          </Chip>
        ))}
      </Group>

      <Group title="Индикаторлық фактор">
        {INDICATOR_FACTORS.map((factor) => (
          <Chip
            key={factor}
            active={filters.factors.includes(factor)}
            tone="var(--color-sage-600)"
            onClick={() => set({ factors: toggleValue(filters.factors, factor) })}
          >
            {indicatorFactorLabels[factor]}
          </Chip>
        ))}
      </Group>
    </div>
  );
}
