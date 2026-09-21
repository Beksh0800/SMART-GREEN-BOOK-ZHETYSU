import type {
  HabitatType,
  IndicatorFactor,
  Plant,
  RedBookCategory,
} from "./schema";

/**
 * Логика фильтрации общая для карты (/map) и каталога Красной книги (/red-book),
 * поэтому живёт отдельно от компонентов и не тянет за собой `server-only`.
 */

export type PlantFilters = {
  query: string;
  redBook: RedBookCategory[];
  /** Только эндемики */
  endemicOnly: boolean;
  /** Только виды-индикаторы */
  indicatorOnly: boolean;
  zoneIds: string[];
  habitats: HabitatType[];
  factors: IndicatorFactor[];
  /**
   * Месяц цветения, 1–12, либо null — «весь год».
   * Живёт в общих фильтрах, а не внутри карты: по нему отбирает и шкала
   * фенологии на карте, и фильтры каталога.
   */
  bloomMonth: number | null;
};

export const emptyFilters: PlantFilters = {
  query: "",
  redBook: [],
  endemicOnly: false,
  indicatorOnly: false,
  zoneIds: [],
  habitats: [],
  factors: [],
  bloomMonth: null,
};

export function isFilterActive(filters: PlantFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.redBook.length > 0 ||
    filters.endemicOnly ||
    filters.indicatorOnly ||
    filters.zoneIds.length > 0 ||
    filters.habitats.length > 0 ||
    filters.factors.length > 0 ||
    filters.bloomMonth !== null
  );
}

/** Поиск идёт по трём языкам названия и по семейству — жюри может искать «яблоня» или «Malus». */
function matchesQuery(plant: Plant, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [plant.name.kk, plant.name.ru, plant.name.la, plant.family.kk, plant.family.la]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function filterPlants(plants: Plant[], filters: PlantFilters): Plant[] {
  return plants.filter((plant) => {
    if (!matchesQuery(plant, filters.query)) return false;
    if (filters.redBook.length > 0) {
      if (!plant.status.redBookKz || !filters.redBook.includes(plant.status.redBookKz)) return false;
    }
    if (filters.endemicOnly && !plant.status.endemic) return false;
    if (filters.indicatorOnly && !plant.bioIndicator.isIndicator) return false;
    if (filters.zoneIds.length > 0) {
      if (!plant.locations.some((l) => filters.zoneIds.includes(l.zoneId))) return false;
    }
    if (filters.habitats.length > 0) {
      if (!plant.habitat.some((h) => filters.habitats.includes(h))) return false;
    }
    if (filters.factors.length > 0) {
      if (!plant.bioIndicator.indicates.some((f) => filters.factors.includes(f))) return false;
    }
    if (filters.bloomMonth !== null) {
      if (!plant.traits.bloomMonths.includes(filters.bloomMonth)) return false;
    }
    return true;
  });
}

/** Переключение значения в списке выбранных — общий помощник для всех групп фильтров. */
export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
