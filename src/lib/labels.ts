import type {
  EndemicType,
  FlowerColor,
  HabitatType,
  IndicatorFactor,
  IucnCategory,
  LifeForm,
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

/** Жизненные формы — первый шаг определителя. */
export const lifeFormLabels: Record<LifeForm, { label: string; hint: string }> = {
  tree: { label: "Ағаш", hint: "Бір діңді, биіктігі 2 м-ден асады" },
  shrub: { label: "Бұта", hint: "Түбінен тармақталған, ағаштанған сабақты" },
  subshrub: { label: "Жартылай бұта", hint: "Тек төменгі бөлігі ағаштанған, аласа" },
  herb: { label: "Шөптесін өсімдік", hint: "Сабағы жұмсақ, ағаштанбаған" },
  grass: { label: "Астық тұқымдас", hint: "Ұзын жіңішке жапырақты, шоқ түзеді" },
  bulb: { label: "Пиязшықты, түйнекті", hint: "Көктемде гүлдеп, жазда қурайды" },
};

/**
 * Цвета венчика. `swatch` — токен из globals.css: это реальный цвет лепестка,
 * а не цвет интерфейса, поэтому у него отдельная группа токенов `--color-petal-*`.
 */
export const flowerColorLabels: Record<FlowerColor, { label: string; swatch: string }> = {
  white: { label: "Ақ", swatch: "var(--color-petal-white)" },
  yellow: { label: "Сары", swatch: "var(--color-petal-yellow)" },
  red: { label: "Қызыл", swatch: "var(--color-petal-red)" },
  pink: { label: "Қызғылт", swatch: "var(--color-petal-pink)" },
  purple: { label: "Күлгін", swatch: "var(--color-petal-purple)" },
  blue: { label: "Көк", swatch: "var(--color-petal-blue)" },
  green: { label: "Жасыл", swatch: "var(--color-petal-green)" },
  inconspicuous: { label: "Гүлі ұсақ, байқалмайды", swatch: "var(--color-petal-none)" },
};

/** Месяцы: полная форма — для текста, короткая — для шкалы цветения. */
export const monthLabels = [
  { full: "Қаңтар", short: "Қаң" },
  { full: "Ақпан", short: "Ақп" },
  { full: "Наурыз", short: "Нау" },
  { full: "Сәуір", short: "Сәу" },
  { full: "Мамыр", short: "Мам" },
  { full: "Маусым", short: "Мау" },
  { full: "Шілде", short: "Шіл" },
  { full: "Тамыз", short: "Там" },
  { full: "Қыркүйек", short: "Қыр" },
  { full: "Қазан", short: "Қаз" },
  { full: "Қараша", short: "Қар" },
  { full: "Желтоқсан", short: "Жел" },
] as const;

/** Ступени высоты в определителе: человек оценивает рост «на глаз», а не в сантиметрах. */
export const heightSteps = [
  { id: "low", label: "Тізеден төмен", hint: "30 см-ге дейін", range: [0, 30] },
  { id: "mid", label: "Тізеден беліме дейін", hint: "30–100 см", range: [30, 100] },
  { id: "tall", label: "Бойдан аспайды", hint: "1–2 м", range: [100, 200] },
  { id: "high", label: "Бойдан биік", hint: "2 м-ден жоғары", range: [200, 10000] },
] as const;

export type HeightStepId = (typeof heightSteps)[number]["id"];
