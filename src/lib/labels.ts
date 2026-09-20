import type {
  EndemicType,
  HabitatType,
  IndicatorFactor,
  IucnCategory,
  LocationPrecision,
  RedBookCategory,
} from "./schema";

/**
 * Казахские подписи для всех перечислений схемы.
 * Используются и на сервере, и в клиентских компонентах — held free of `server-only`.
 */

export const habitatLabels: Record<HabitatType, string> = {
  alpine: "Альпі шалғыны",
  "mountain-forest": "Таулы орман",
  shrubland: "Бұталы белдеу",
  steppe: "Дала",
  desert: "Шөл",
  saline: "Сор, тұзды топырақ",
  riparian: "Тоғай, өзен аңғары",
  rocky: "Жартасты беткей",
  wetland: "Сулы-батпақты жер",
};

export const indicatorFactorLabels: Record<IndicatorFactor, string> = {
  "soil-moisture": "Топырақ ылғалдылығы",
  salinity: "Топырақ тұздануы",
  "soil-ph": "Топырақ реакциясы (pH)",
  "grazing-pressure": "Жайылым қысымы",
  "air-pollution": "Ауа ластануы",
  "soil-erosion": "Топырақ эрозиясы",
  groundwater: "Жер асты суы деңгейі",
};

/** Категории Красной книги РК: подпись + токен цвета из шкалы `--color-rb-*`. */
export const redBookLabels: Record<RedBookCategory, { short: string; full: string; token: string }> =
  {
    I: { short: "I санат", full: "Жойылу қаупі төнген түрлер", token: "var(--color-rb-1)" },
    II: { short: "II санат", full: "Саны қысқарып бара жатқан түрлер", token: "var(--color-rb-2)" },
    III: { short: "III санат", full: "Сирек кездесетін түрлер", token: "var(--color-rb-3)" },
    IV: { short: "IV санат", full: "Белгісіз мәртебедегі түрлер", token: "var(--color-rb-4)" },
    V: { short: "V санат", full: "Қалпына келтірілген түрлер", token: "var(--color-rb-5)" },
  };

export const iucnLabels: Record<IucnCategory, string> = {
  EX: "Жойылған (EX)",
  EW: "Табиғатта жойылған (EW)",
  CR: "Аса қауіпті жағдайда (CR)",
  EN: "Жойылу қаупінде (EN)",
  VU: "Осал түр (VU)",
  NT: "Қауіпке жақын (NT)",
  LC: "Қауіп тудырмайды (LC)",
  DD: "Деректер жеткіліксіз (DD)",
};

export const endemicLabels: Record<EndemicType, string> = {
  kz: "Қазақстан эндемигі",
  regional: "Аймақтық эндемик",
};

export const precisionLabels: Record<LocationPrecision, { label: string; hint: string }> = {
  exact: {
    label: "Нақты нүкте",
    hint: "Координаттары расталған нақты табылу орны",
  },
  locality: {
    label: "Мекен орталығы",
    hint: "Сипатталған мекеннің (шатқал, алқап) орталық нүктесі",
  },
  zone: {
    label: "Аймақ шегінде",
    hint: "Тек аймаққа тиесілігі белгілі, нүкте — аймақ орталығы",
  },
};

/** Подписи осей и шкал модуля BioIndicator. */
export const scoreLabels = {
  moisture: { label: "Ылғалдылық", low: "Құрғақ", high: "Ылғалды" },
  salinity: { label: "Тұздану", low: "Тұзданбаған", high: "Сор" },
  grazing: { label: "Жайылымға төзімділік", low: "Төзімсіз", high: "Төзімді" },
  pollutionTolerance: { label: "Ластануға төзімділік", low: "Сезімтал", high: "Төзімді" },
  soilPh: { label: "Топырақ pH", low: "Қышқыл", high: "Сілтілі" },
} as const;
