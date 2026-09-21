import type { Plant, Zone } from "./schema";

/**
 * Методика модуля BioIndicator.
 *
 * Идея простая и проверяемая: состояние территории оценивается не прямыми
 * измерениями, а составом растений-индикаторов, которые на ней растут.
 * Все формулы ниже описаны на странице /about — жюри должно иметь возможность
 * пересчитать любой показатель вручную.
 */

/**
 * Результат расчёта по набору видов. Одинаков и для готовой зоны, и для
 * участка, набранного пользователем вручную, — считает их одна функция.
 */
export type SampleMetrics = {
  /** Сколько видов базы отмечено в наборе и сколько из них индикаторы */
  plantCount: number;
  indicatorCount: number;
  protectedCount: number;
  /** Средние баллы видов-индикаторов зоны */
  averages: {
    moisture: number;
    salinity: number;
    soilPh: number;
    grazing: number;
    pollutionTolerance: number;
  };
  /** Доля чувствительных видов (0–1): исчезают первыми при нагрузке */
  sensitiveShare: number;
  /** Доля охраняемых и эндемичных видов (0–1) */
  protectedShare: number;
  /** Итоговый индекс сохранности, 0–100 */
  index: number;
  /** Текстовая интерпретация на казахском */
  interpretation: string[];
};

export type ZoneMetrics = SampleMetrics & { zone: Zone };

const avg = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;

/** Вид считается чувствительным, если плохо переносит выпас или загрязнение. */
function isSensitive(plant: Plant): boolean {
  return plant.bioIndicator.scores.grazing <= 2 || plant.bioIndicator.scores.pollutionTolerance <= 2;
}

/**
 * Индекс сохранности, 0–100:
 *   50 × доля чувствительных видов
 * + 20 × доля охраняемых и эндемичных видов
 * + 30 × (1 − (средняя устойчивость к выпасу − 1) / 4)
 *
 * Логика: чем больше в зоне уязвимых и охраняемых видов и чем меньше
 * доминируют виды, безразличные к выпасу, тем менее нарушена территория.
 */
function conservationIndex(sensitiveShare: number, protectedShare: number, grazing: number): number {
  const grazingTerm = grazing === 0 ? 0 : 1 - (grazing - 1) / 4;
  return Math.round(50 * sensitiveShare + 20 * protectedShare + 30 * grazingTerm);
}

function interpret(metrics: Omit<SampleMetrics, "interpretation">): string[] {
  const out: string[] = [];
  const { averages, index, sensitiveShare, indicatorCount } = metrics;

  if (indicatorCount === 0) {
    // Формулировка нейтральна к источнику набора: это может быть и зона без
    // данных, и пустой список видов, отмеченных пользователем.
    return ["Индикатор түрлер белгіленбеген — баға есептелмейді."];
  }

  if (averages.salinity >= 3.5) {
    out.push("Галофитті түрлердің басым болуы топырақтың қатты тұзданғанын көрсетеді.");
  } else if (averages.salinity <= 1.7) {
    out.push("Тұзға төзімді түрлер аз — топырақ тұздануы байқалмайды.");
  }

  if (averages.moisture >= 3.5) {
    out.push("Ылғал сүйгіш түрлер басым: жер асты суы жақын немесе тұрақты ылғал көзі бар.");
  } else if (averages.moisture <= 2) {
    out.push("Құрғақшылыққа бейім түрлер басым — аймақ ылғал тапшылығында.");
  }

  if (averages.grazing >= 3.5) {
    out.push(
      "Жайылымға төзімді түрлердің үлесі жоғары: мал жаю қысымы күшті, нәзік түрлер ығыстырылған.",
    );
  } else if (sensitiveShare >= 0.5) {
    out.push("Жайылымға сезімтал түрлердің сақталуы — аймақтың салыстырмалы бұзылмағанының белгісі.");
  }

  if (averages.pollutionTolerance >= 3.5) {
    out.push("Ластануға төзімді түрлер басым — антропогендік жүктеме жоғары деп бағаланады.");
  }

  if (index >= 70) {
    out.push("Жалпы бағалау: аймақтың табиғи жағдайы салыстырмалы түрде жақсы сақталған.");
  } else if (index >= 45) {
    out.push("Жалпы бағалау: аймақта орташа деңгейдегі антропогендік өзгерістер байқалады.");
  } else {
    out.push("Жалпы бағалау: аймақ айтарлықтай өзгерген, қалпына келтіру шаралары қажет.");
  }

  return out;
}

/**
 * Расчёт по произвольному набору видов. Отдельно от зон, потому что тот же
 * счёт нужен модулю «Өз учаскем» (/bioindicator#site): пользователь отмечает
 * виды, которые видел на своём участке, и получает оценку по той же формуле,
 * что и готовые зоны. Иначе методика была бы применима только к нашим данным,
 * а проверить её на своей местности было бы нечем.
 */
export function computeSampleMetrics(sample: Plant[]): SampleMetrics {
  const indicators = sample.filter((p) => p.bioIndicator.isIndicator);
  const scores = indicators.map((p) => p.bioIndicator.scores);

  const averages = {
    moisture: avg(scores.map((s) => s.moisture)),
    salinity: avg(scores.map((s) => s.salinity)),
    soilPh: avg(scores.map((s) => s.soilPh)),
    grazing: avg(scores.map((s) => s.grazing)),
    pollutionTolerance: avg(scores.map((s) => s.pollutionTolerance)),
  };

  const protectedCount = sample.filter((p) => p.status.redBookKz || p.status.endemic).length;
  const sensitiveShare = sample.length === 0 ? 0 : sample.filter(isSensitive).length / sample.length;
  const protectedShare = sample.length === 0 ? 0 : protectedCount / sample.length;

  const base = {
    plantCount: sample.length,
    indicatorCount: indicators.length,
    protectedCount,
    averages,
    sensitiveShare,
    protectedShare,
    index: conservationIndex(sensitiveShare, protectedShare, averages.grazing),
  };

  return { ...base, interpretation: interpret(base) };
}

export function computeZoneMetrics(zone: Zone, plants: Plant[]): ZoneMetrics {
  const inZone = plants.filter((p) => p.locations.some((l) => l.zoneId === zone.id));
  return { zone, ...computeSampleMetrics(inZone) };
}

export function computeAllZoneMetrics(zones: Zone[], plants: Plant[]): ZoneMetrics[] {
  return zones
    .map((zone) => computeZoneMetrics(zone, plants))
    .sort((a, b) => b.index - a.index);
}

/**
 * Зоны без индикаторных видов в рейтинге не участвуют: индекс 0 у них
 * означает «нет данных», а не «полностью разрушено» — показывать их
 * рядом с оценёнными зонами было бы прямым враньём.
 */
export function splitByDataAvailability(metrics: ZoneMetrics[]) {
  return {
    rated: metrics.filter((m) => m.indicatorCount > 0),
    noData: metrics.filter((m) => m.indicatorCount === 0),
  };
}

/** Подпись уровня индекса — используется и в карточках, и в сравнении зон. */
export function indexLabel(index: number): { label: string; token: string } {
  if (index >= 70) return { label: "Сақталған", token: "var(--color-forest-600)" };
  if (index >= 45) return { label: "Орташа өзгерген", token: "var(--color-ochre-600)" };
  return { label: "Қатты өзгерген", token: "var(--color-rb-1)" };
}
