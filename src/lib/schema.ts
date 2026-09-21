import { z } from "zod";

/**
 * Схемы данных проекта. Валидируются скриптом `npm run validate`,
 * который вызывается перед `next build` — битые данные падают в CI,
 * а не на показе перед жюри.
 */

/** Категории Красной книги Республики Казахстан (т. 2 — растения). */
export const RED_BOOK_CATEGORIES = ["I", "II", "III", "IV", "V"] as const;

/** Категории МСОП (IUCN Red List). */
export const IUCN_CATEGORIES = ["EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD"] as const;

/** Тип эндемизма: эндемик Казахстана либо региональный (Жетісу / Тянь-Шань). */
export const ENDEMIC_TYPES = ["kz", "regional"] as const;

/**
 * Точность координат — ключевое поле для честной подачи данных.
 * exact    — конкретная находка с координатами (GBIF occurrence и т.п.)
 * locality — центр описанного местонахождения (ущелье, урочище)
 * zone     — только принадлежность к зоне, точка = центр зоны
 */
export const LOCATION_PRECISION = ["exact", "locality", "zone"] as const;

/** Экологические факторы, которые индицирует вид. */
export const INDICATOR_FACTORS = [
  "soil-moisture",
  "salinity",
  "soil-ph",
  "grazing-pressure",
  "air-pollution",
  "soil-erosion",
  "groundwater",
] as const;

/**
 * Жизненная форма — первый вопрос определителя: её видно с расстояния,
 * не требуя ни лупы, ни цветка на растении.
 */
export const LIFE_FORMS = ["tree", "shrub", "subshrub", "herb", "grass", "bulb"] as const;

/**
 * Цвет околоцветника в определителе. `inconspicuous` — не «нет цветка»,
 * а «цветок мелкий и невзрачный» (злаки, маревые, ветроопыляемые деревья):
 * такие виды определяются по остальным признакам, поэтому в вопросе о цвете
 * они остаются в выдаче, а не отсеиваются.
 */
export const FLOWER_COLORS = [
  "white",
  "yellow",
  "red",
  "pink",
  "purple",
  "blue",
  "green",
  "inconspicuous",
] as const;

/** Тип местообитания — используется в фильтрах карты и каталога. */
export const HABITAT_TYPES = [
  "alpine",
  "mountain-forest",
  "shrubland",
  "steppe",
  "desert",
  "saline",
  "riparian",
  "rocky",
  "wetland",
] as const;

/**
 * Полевые признаки для модуля «Анықтағыш» (определитель).
 * Значения взяты из `description.morphology` и `description.phenology` того же
 * вида — определитель не должен противоречить тексту паспорта.
 */
export const plantTraitsSchema = z.object({
  lifeForm: z.enum(LIFE_FORMS),
  /** Высота взрослого растения в сантиметрах: [минимум, максимум] */
  heightCm: z
    .tuple([z.number().positive(), z.number().positive()])
    .refine(([min, max]) => min <= max, "heightCm: минимум больше максимума"),
  flowerColor: z.array(z.enum(FLOWER_COLORS)).min(1),
  /** Месяцы цветения, 1–12. У ветроопыляемых видов — месяцы пыления. */
  bloomMonths: z.array(z.number().int().min(1).max(12)).min(1),
});

export const zoneSchema = z.object({
  id: z.string().min(1),
  name: z.object({ kk: z.string().min(1), ru: z.string().min(1) }),
  /** Широта центра зоны */
  lat: z.number().min(42).max(49),
  /** Долгота центра зоны */
  lon: z.number().min(73).max(86),
  /** Радиус зоны в километрах — рисуется на карте для точек с precision != exact */
  radiusKm: z.number().positive().max(200),
  elevationM: z.tuple([z.number(), z.number()]),
  habitat: z.array(z.enum(HABITAT_TYPES)).min(1),
  description: z.object({ kk: z.string().min(1) }),
});

export const plantLocationSchema = z.object({
  zoneId: z.string().min(1),
  label: z.string().min(1),
  lat: z.number().min(42).max(49),
  lon: z.number().min(73).max(86),
  precision: z.enum(LOCATION_PRECISION),
  source: z.string().min(1),
  sourceUrl: z.url().nullable().default(null),
});

export const plantSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug: только строчные латинские буквы, цифры и дефис"),
  name: z.object({
    kk: z.string().min(1),
    ru: z.string().min(1),
    la: z.string().min(1),
  }),
  family: z.object({ kk: z.string().min(1), la: z.string().min(1) }),
  status: z.object({
    redBookKz: z.enum(RED_BOOK_CATEGORIES).nullable(),
    iucn: z.enum(IUCN_CATEGORIES).nullable(),
    endemic: z.enum(ENDEMIC_TYPES).nullable(),
    /** Краткая характеристика встречаемости на казахском */
    rarity: z.string().min(1),
  }),
  habitat: z.array(z.enum(HABITAT_TYPES)).min(1),
  traits: plantTraitsSchema,
  description: z.object({
    summary: z.string().min(1),
    morphology: z.string().min(1),
    habitat: z.string().min(1),
    phenology: z.string().min(1),
    uses: z.string().min(1),
    threats: z.string().min(1),
  }),
  bioIndicator: z.object({
    isIndicator: z.boolean(),
    indicates: z.array(z.enum(INDICATOR_FACTORS)),
    scores: z.object({
      /** Увлажнение местообитания: 1 — сухое, 5 — избыточно влажное */
      moisture: z.number().min(1).max(5),
      /** Засоление почв: 1 — незасолённые, 5 — солончак */
      salinity: z.number().min(1).max(5),
      /** Реакция почвы, pH */
      soilPh: z.number().min(3).max(10),
      /** Устойчивость к пастбищной нагрузке: 1 — исчезает первой, 5 — выдерживает выпас */
      grazing: z.number().min(1).max(5),
      /** Устойчивость к загрязнению воздуха/почв: 1 — чувствительный, 5 — толерантный */
      pollutionTolerance: z.number().min(1).max(5),
    }),
    note: z.string().min(1),
  }),
  locations: z.array(plantLocationSchema).min(1),
  photo: z
    .object({
      file: z.string().min(1),
      author: z.string().min(1),
      license: z.string().min(1),
      url: z.url(),
    })
    .nullable(),
  sources: z
    .array(z.object({ title: z.string().min(1), url: z.url().nullable().default(null) }))
    .min(1),
});

export type Plant = z.infer<typeof plantSchema>;
export type PlantLocation = z.infer<typeof plantLocationSchema>;
export type Zone = z.infer<typeof zoneSchema>;
export type RedBookCategory = (typeof RED_BOOK_CATEGORIES)[number];
export type IucnCategory = (typeof IUCN_CATEGORIES)[number];
export type EndemicType = (typeof ENDEMIC_TYPES)[number];
export type IndicatorFactor = (typeof INDICATOR_FACTORS)[number];
export type HabitatType = (typeof HABITAT_TYPES)[number];
export type LifeForm = (typeof LIFE_FORMS)[number];
export type FlowerColor = (typeof FLOWER_COLORS)[number];
export type PlantTraits = z.infer<typeof plantTraitsSchema>;
export type LocationPrecision = (typeof LOCATION_PRECISION)[number];
