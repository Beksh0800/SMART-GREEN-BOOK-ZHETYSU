import type { Plant, PlantLocation, Zone } from "@/lib/schema";

/**
 * Единый визуальный язык карты для всех модулей.
 *
 * Подложка — стандартные тайлы OpenStreetMap: единственный вариант без
 * API-ключа и карты оплаты (CARTO Positron с 2025 года требует ключ и
 * рисует поверх плитки «API KEY REQUIRED»). Пёстрость «дорожной» плитки
 * гасится CSS-фильтром `.leaflet-tile-pane` в globals.css — карта читается
 * как атлас, а точки видов остаются самым ярким слоем.
 */
export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> қауымдастығы';

/** Центр и масштаб обзорной карты Жетісу. */
export const ZHETYSU_CENTER: [number, number] = [45.0, 78.6];
export const ZHETYSU_ZOOM = 7;

/**
 * Рамка Жетісу — обзорный вид, к которому возвращает кнопка «Жетісуға оралу».
 *
 * Как `maxBounds` она не годится и раньше ломала карту: по долготе рамка
 * занимает около 9°, а видимая область на широком экране при zoom 7 — больше,
 * поэтому Leaflet возвращал карту назад при каждой попытке её сдвинуть.
 * Ограничивать перемещение теперь нечем — вместо этого есть minZoom и
 * явная кнопка возврата.
 */
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [42.2, 73.5],
  [47.8, 82.8],
];

/** Группа вида определяет цвет точки — легенда строится из этих же значений. */
export type PlantGroup = "red-book" | "endemic" | "indicator" | "common";

/**
 * Leaflet рисует точки SVG-атрибутами, а они не понимают var(--token),
 * поэтому здесь лежат те же цвета палитры в виде литералов.
 * Это единственное место в проекте, где цвет продублирован — при правке
 * токенов в globals.css значения ниже нужно обновить вместе с ними.
 */
export const groupStyles: Record<PlantGroup, { color: string; label: string }> = {
  "red-book": { color: "#a03328", label: "Қызыл кітап түрлері" }, // --color-rb-1
  endemic: { color: "#234a3b", label: "Эндемиктер" }, // --color-forest-700
  indicator: { color: "#67765b", label: "Биоиндикаторлар" }, // --color-sage-600
  common: { color: "#857f74", label: "Өзге түрлер" }, // --color-graphite-400
};

export function getPlantGroup(plant: Plant): PlantGroup {
  if (plant.status.redBookKz) return "red-book";
  if (plant.status.endemic) return "endemic";
  if (plant.bioIndicator.isIndicator) return "indicator";
  return "common";
}

/**
 * Точка с precision !== "exact" рисуется полупрозрачным кругом радиуса зоны:
 * пользователь сразу видит, что это ареал, а не GPS-находка.
 */
export function uncertaintyRadiusM(location: PlantLocation, zone?: Zone): number | null {
  if (location.precision === "exact") return null;
  const km = location.precision === "zone" ? (zone?.radiusKm ?? 40) : 8;
  return km * 1000;
}
