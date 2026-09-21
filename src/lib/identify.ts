import { heightSteps, type HeightStepId } from "./labels";
import type { FlowerColor, HabitatType, LifeForm, Plant } from "./schema";

/**
 * Модуль «Анықтағыш» — определитель видов по полевым признакам.
 *
 * Здесь сознательно нет жёсткой фильтрации. Человек в поле ошибается:
 * путает полукустарник с кустарником, промахивается с высотой, видит растение
 * без цветков. Жёсткий фильтр на такой ответ выдал бы пустой экран, и
 * определение обрывалось бы на первом же неточном шаге.
 *
 * Поэтому ответ не отсекает, а взвешивает: вид получает балл за каждый
 * совпавший признак, и список ранжируется по доле совпадений. Виды с полным
 * совпадением стоят вверху; вид, разошедшийся ровно по одному признаку,
 * остаётся в выдаче ниже — с пометкой, какой именно признак не сошёлся.
 * Два и более расхождения — это уже другое растение, такие виды скрываются.
 */

export type IdentifyAnswers = {
  lifeForm: LifeForm | null;
  habitat: HabitatType | null;
  flowerColor: FlowerColor | null;
  height: HeightStepId | null;
  month: number | null;
};

export const emptyAnswers: IdentifyAnswers = {
  lifeForm: null,
  habitat: null,
  flowerColor: null,
  height: null,
  month: null,
};

/** Признак, по которому шёл отбор, — для объяснения результата пользователю. */
export type IdentifyCriterion = "lifeForm" | "habitat" | "flowerColor" | "height" | "month";

export const criterionLabels: Record<IdentifyCriterion, string> = {
  lifeForm: "Тіршілік формасы",
  habitat: "Мекен түрі",
  flowerColor: "Гүл түсі",
  height: "Биіктігі",
  month: "Гүлдеу айы",
};

export type IdentifyMatch = {
  plant: Plant;
  /** Доля совпавших признаков среди отвеченных, 0–1 */
  score: number;
  matched: IdentifyCriterion[];
  missed: IdentifyCriterion[];
};

export function answeredCount(answers: IdentifyAnswers): number {
  return Object.values(answers).filter((v) => v !== null).length;
}

function heightMatches(plant: Plant, stepId: HeightStepId): boolean {
  const step = heightSteps.find((s) => s.id === stepId);
  if (!step) return false;
  const [from, to] = step.range;
  const [min, max] = plant.traits.heightCm;
  // Диапазоны пересекаются — вид может выглядеть так, как указал пользователь.
  return min <= to && max >= from;
}

function colorMatches(plant: Plant, color: FlowerColor): boolean {
  return plant.traits.flowerColor.includes(color);
}

/**
 * Совпадение по каждому признаку считается отдельно, чтобы в карточке
 * результата можно было показать, что именно сошлось, а что нет.
 */
function evaluate(plant: Plant, answers: IdentifyAnswers): IdentifyMatch {
  const matched: IdentifyCriterion[] = [];
  const missed: IdentifyCriterion[] = [];

  const check = (criterion: IdentifyCriterion, ok: boolean) =>
    (ok ? matched : missed).push(criterion);

  if (answers.lifeForm) check("lifeForm", plant.traits.lifeForm === answers.lifeForm);
  if (answers.habitat) check("habitat", plant.habitat.includes(answers.habitat));
  if (answers.flowerColor) check("flowerColor", colorMatches(plant, answers.flowerColor));
  if (answers.height) check("height", heightMatches(plant, answers.height));
  if (answers.month) check("month", plant.traits.bloomMonths.includes(answers.month));

  const total = matched.length + missed.length;
  return {
    plant,
    score: total === 0 ? 0 : matched.length / total,
    matched,
    missed,
  };
}

/**
 * Результат определения. Пока не отвечен ни один вопрос, список пуст:
 * показывать все 50 видов как «результат определения» было бы обманом —
 * это просто каталог, и для него есть /red-book.
 */
export function identify(plants: Plant[], answers: IdentifyAnswers): IdentifyMatch[] {
  if (answeredCount(answers) === 0) return [];

  return plants
    .map((plant) => evaluate(plant, answers))
    .filter((m) => m.missed.length <= 1)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.plant.name.kk.localeCompare(b.plant.name.kk, "kk");
    });
}

/** Разделение выдачи на точные и частичные совпадения — у них разный вес. */
export function splitMatches(matches: IdentifyMatch[]) {
  return {
    exact: matches.filter((m) => m.missed.length === 0),
    partial: matches.filter((m) => m.missed.length > 0),
  };
}

/**
 * Подсказка «какой вопрос задать следующим»: выбирается признак, который
 * сильнее всего делит текущую выдачу, — тот же принцип, что в бумажных
 * определительных ключах, где каждая теза делит выборку примерно пополам.
 */
export function mostUsefulNext(
  matches: IdentifyMatch[],
  answers: IdentifyAnswers,
): IdentifyCriterion | null {
  const open = (
    ["lifeForm", "habitat", "flowerColor", "height", "month"] as IdentifyCriterion[]
  ).filter((c) => answers[c] === null);
  if (open.length === 0 || matches.length <= 1) return null;

  const variety = (criterion: IdentifyCriterion): number => {
    const values = new Set<string>();
    for (const { plant } of matches) {
      if (criterion === "lifeForm") values.add(plant.traits.lifeForm);
      if (criterion === "habitat") plant.habitat.forEach((h) => values.add(h));
      if (criterion === "flowerColor") plant.traits.flowerColor.forEach((c) => values.add(c));
      if (criterion === "month") plant.traits.bloomMonths.forEach((m) => values.add(String(m)));
      if (criterion === "height") {
        heightSteps.forEach((s) => heightMatches(plant, s.id) && values.add(s.id));
      }
    }
    return values.size;
  };

  return open.reduce((best, c) => (variety(c) > variety(best) ? c : best), open[0]);
}
