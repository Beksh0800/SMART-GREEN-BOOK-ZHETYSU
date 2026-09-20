/**
 * Проверка всей базы данных проекта по zod-схемам + отчёт о заполненности.
 * Запускается вручную (`npm run validate`) и автоматически перед `next build`,
 * чтобы битые данные падали в сборке, а не на показе.
 *
 * Выполняется нативным TypeScript-раннером Node 24 (type stripping).
 */
import fs from "node:fs";
import path from "node:path";

import { plantSchema, zoneSchema, type Plant } from "../src/lib/schema.ts";

const ROOT = process.cwd();
const PLANTS_DIR = path.join(ROOT, "src", "data", "plants");
const ZONES_FILE = path.join(ROOT, "src", "data", "zones.json");

/** Географические границы Жетісу — точка за их пределами почти наверняка опечатка. */
const BOUNDS = { latMin: 42.5, latMax: 47.5, lonMin: 74.0, lonMax: 82.5 };

const errors: string[] = [];
const warnings: string[] = [];

function validateZones() {
  const parsed = zoneSchema.array().safeParse(JSON.parse(fs.readFileSync(ZONES_FILE, "utf8")));
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`zones.json → ${issue.path.join(".")}: ${issue.message}`);
    }
    return [];
  }
  const ids = parsed.data.map((z) => z.id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length) errors.push(`zones.json: қайталанған id — ${duplicates.join(", ")}`);
  return parsed.data;
}

function validatePlants(zoneIds: Set<string>): Plant[] {
  const files = fs.readdirSync(PLANTS_DIR).filter((f) => f.endsWith(".json"));
  const plants: Plant[] = [];

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(PLANTS_DIR, file), "utf8"));
    const parsed = plantSchema.safeParse(raw);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${file} → ${issue.path.join(".")}: ${issue.message}`);
      }
      continue;
    }

    const plant = parsed.data;
    if (`${plant.slug}.json` !== file) {
      errors.push(`${file}: файл аты slug-пен сәйкес емес (${plant.slug})`);
    }

    for (const loc of plant.locations) {
      if (!zoneIds.has(loc.zoneId)) {
        errors.push(`${file}: белгісіз аймақ "${loc.zoneId}"`);
      }
      if (
        loc.lat < BOUNDS.latMin ||
        loc.lat > BOUNDS.latMax ||
        loc.lon < BOUNDS.lonMin ||
        loc.lon > BOUNDS.lonMax
      ) {
        errors.push(
          `${file}: "${loc.label}" нүктесі Жетісу шегінен тыс (${loc.lat}, ${loc.lon})`,
        );
      }
    }

    if (plant.bioIndicator.isIndicator && plant.bioIndicator.indicates.length === 0) {
      errors.push(`${file}: индикатор деп белгіленген, бірақ indicates тізімі бос`);
    }
    if (!plant.photo) warnings.push(`${file}: фотосурет жоқ`);
    if (!plant.locations.some((l) => l.precision === "exact")) {
      warnings.push(`${file}: нақты координаты бар нүкте жоқ`);
    }
    if (plant.photo && !fs.existsSync(path.join(ROOT, "public", "images", "plants", plant.photo.file))) {
      errors.push(`${file}: фотофайл табылмады — public/images/plants/${plant.photo.file}`);
    }

    plants.push(plant);
  }

  const slugs = plants.map((p) => p.slug);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) errors.push(`Қайталанған slug: ${dupes.join(", ")}`);

  return plants;
}

const zones = validateZones();
const plants = validatePlants(new Set(zones.map((z) => z.id)));

const locations = plants.flatMap((p) => p.locations);
const stats = {
  "Барлық түр": plants.length,
  "Қызыл кітапта": plants.filter((p) => p.status.redBookKz).length,
  Эндемик: plants.filter((p) => p.status.endemic).length,
  Биоиндикатор: plants.filter((p) => p.bioIndicator.isIndicator).length,
  Аймақ: zones.length,
  Нүкте: locations.length,
  "Оның ішінде нақты": locations.filter((l) => l.precision === "exact").length,
  Фотосуретпен: plants.filter((p) => p.photo).length,
};

console.log("\n  Zhetysu GreenMap — деректер тексерісі\n");
for (const [key, value] of Object.entries(stats)) {
  console.log(`  ${key.padEnd(22, ".")} ${value}`);
}

if (warnings.length) {
  console.log(`\n  Ескертулер (${warnings.length}):`);
  for (const w of warnings) console.log(`   · ${w}`);
}

if (errors.length) {
  console.error(`\n  Қателер (${errors.length}):`);
  for (const e of errors) console.error(`   ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log("\n  Барлық деректер схемаға сәйкес.\n");
