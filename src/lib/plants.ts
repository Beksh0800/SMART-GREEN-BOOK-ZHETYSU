import "server-only";

import fs from "node:fs";
import path from "node:path";

import { plantSchema, zoneSchema, type Plant, type Zone } from "./schema";

/**
 * Единственная точка доступа к данным проекта.
 * UI-компоненты ходят в данные только через этот модуль — если позже
 * понадобится вынести базу в Firestore или CMS, меняется только он.
 */

const PLANTS_DIR = path.join(process.cwd(), "src", "data", "plants");
const ZONES_FILE = path.join(process.cwd(), "src", "data", "zones.json");

function readPlantsFromDisk(): Plant[] {
  const files = fs.readdirSync(PLANTS_DIR).filter((f) => f.endsWith(".json"));

  const plants = files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(PLANTS_DIR, file), "utf8"));
    const parsed = plantSchema.safeParse(raw);

    if (!parsed.success) {
      throw new Error(
        `Деректер қатесі — src/data/plants/${file}:\n${JSON.stringify(parsed.error.issues, null, 2)}`,
      );
    }
    if (parsed.data.slug !== file.replace(/\.json$/, "")) {
      throw new Error(`Файл аты мен slug сәйкес емес: ${file} ≠ ${parsed.data.slug}`);
    }
    return parsed.data;
  });

  // Сортировка: сначала краснокнижные (I → V), затем эндемики, затем по алфавиту
  return plants.sort(compareByConservationThenName);
}

function readZonesFromDisk(): Zone[] {
  const raw = JSON.parse(fs.readFileSync(ZONES_FILE, "utf8"));
  const parsed = zoneSchema.array().safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `Деректер қатесі — src/data/zones.json:\n${JSON.stringify(parsed.error.issues, null, 2)}`,
    );
  }
  return parsed.data;
}

const redBookOrder = { I: 0, II: 1, III: 2, IV: 3, V: 4 } as const;

function compareByConservationThenName(a: Plant, b: Plant): number {
  const aRank = a.status.redBookKz ? redBookOrder[a.status.redBookKz] : 90;
  const bRank = b.status.redBookKz ? redBookOrder[b.status.redBookKz] : 90;
  const aScore = aRank + (a.status.endemic ? 0 : 5);
  const bScore = bRank + (b.status.endemic ? 0 : 5);
  if (aScore !== bScore) return aScore - bScore;
  return a.name.kk.localeCompare(b.name.kk, "kk");
}

// Данные читаются с диска один раз за процесс сборки.
let plantsCache: Plant[] | null = null;
let zonesCache: Zone[] | null = null;

export function getAllPlants(): Plant[] {
  plantsCache ??= readPlantsFromDisk();
  return plantsCache;
}

export function getAllZones(): Zone[] {
  zonesCache ??= readZonesFromDisk();
  return zonesCache;
}

export function getPlantBySlug(slug: string): Plant | undefined {
  return getAllPlants().find((plant) => plant.slug === slug);
}

export function getZoneById(id: string): Zone | undefined {
  return getAllZones().find((zone) => zone.id === id);
}

/** Виды Красной книги РК и эндемики — база модуля Red & Endemic Book. */
export function getProtectedPlants(): Plant[] {
  return getAllPlants().filter((p) => p.status.redBookKz !== null || p.status.endemic !== null);
}

/** Виды-индикаторы — база модуля BioIndicator. */
export function getIndicatorPlants(): Plant[] {
  return getAllPlants().filter((p) => p.bioIndicator.isIndicator);
}

export function getPlantsByZone(zoneId: string): Plant[] {
  return getAllPlants().filter((p) => p.locations.some((l) => l.zoneId === zoneId));
}

/** Сводка для лендинга и заголовков разделов. */
export function getStats() {
  const plants = getAllPlants();
  const locations = plants.flatMap((p) => p.locations);

  return {
    total: plants.length,
    redBook: plants.filter((p) => p.status.redBookKz !== null).length,
    endemic: plants.filter((p) => p.status.endemic !== null).length,
    indicators: plants.filter((p) => p.bioIndicator.isIndicator).length,
    zones: getAllZones().length,
    locations: locations.length,
    exactLocations: locations.filter((l) => l.precision === "exact").length,
    withPhoto: plants.filter((p) => p.photo !== null).length,
  };
}
