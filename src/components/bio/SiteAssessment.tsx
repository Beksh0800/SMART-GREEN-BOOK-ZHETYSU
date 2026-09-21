"use client";

import { Check, Printer, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { computeSampleMetrics, indexLabel, type ZoneMetrics } from "@/lib/bioindicator";
import { habitatLabels, scoreLabels } from "@/lib/labels";
import type { HabitatType, Plant } from "@/lib/schema";

/**
 * «Өз учаскем» — оценка своего участка по той же формуле, что и готовые зоны.
 *
 * Пользователь отмечает виды, которые видел, и получает индекс сохранности,
 * средние показатели и текстовое заключение. Это единственное место, где
 * методика проекта применяется к данным, собранным не нами, — без него
 * BioIndicator остаётся набором заранее посчитанных чисел.
 *
 * Расчёт идёт в браузере: ничего не отправляется и нигде не сохраняется,
 * поэтому модуль работает и без сети, и без базы.
 */

const FACTORS = ["moisture", "salinity", "grazing", "pollutionTolerance"] as const;

/** Ниже этого числа видов выборка слишком мала — показываем предупреждение, а не оценку. */
const MIN_SAMPLE = 3;

function ScaleRow({
  label,
  low,
  high,
  value,
}: {
  label: string;
  low: string;
  high: string;
  value: number;
}) {
  return (
    <div className="border-t border-line py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-graphite-900">{label}</span>
        <span className="text-xs text-graphite-400">{value.toFixed(1)} / 5</span>
      </div>
      <div
        className="mt-2 h-2.5 rounded-badge bg-paper-dim"
        role="img"
        aria-label={`${label}: ${value.toFixed(1)} из 5`}
      >
        <div
          className="h-full rounded-badge"
          style={{
            width: `${(value / 5) * 100}%`,
            backgroundColor: "var(--color-series-a)",
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-2xs text-graphite-400">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export function SiteAssessment({
  plants,
  zoneMetrics,
}: {
  plants: Plant[];
  zoneMetrics: ZoneMetrics[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [habitat, setHabitat] = useState<HabitatType | null>(null);

  const sample = useMemo(
    () => plants.filter((p) => selected.includes(p.slug)),
    [plants, selected],
  );
  const metrics = useMemo(() => computeSampleMetrics(sample), [sample]);
  const level = indexLabel(metrics.index);

  /**
   * Ближайшая по индексу зона — ориентир для пользователя: «ваш участок
   * примерно как вот эта известная территория». Без такой привязки число
   * от 0 до 100 не с чем сопоставить.
   */
  const closestZone = useMemo(() => {
    if (sample.length < MIN_SAMPLE || zoneMetrics.length === 0) return null;
    return zoneMetrics.reduce((best, m) =>
      Math.abs(m.index - metrics.index) < Math.abs(best.index - metrics.index) ? m : best,
    );
  }, [zoneMetrics, metrics.index, sample.length]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants.filter((p) => {
      if (habitat && !p.habitat.includes(habitat)) return false;
      if (!q) return true;
      return [p.name.kk, p.name.ru, p.name.la].join(" ").toLowerCase().includes(q);
    });
  }, [plants, query, habitat]);

  const toggle = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const enough = sample.length >= MIN_SAMPLE;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12">
      {/* Чек-лист видов */}
      <div className="print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[14rem] flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-graphite-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Түрдің атауы бойынша іздеу"
              aria-label="Түрді іздеу"
              className="w-full rounded-badge border border-line bg-paper-bright py-2.5 pr-3 pl-9 text-sm text-graphite-900 placeholder:text-graphite-400 focus:border-forest-400 focus:outline-none"
            />
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="inline-flex items-center gap-1.5 text-xs text-graphite-600 transition-colors hover:text-ochre-700"
            >
              <RotateCcw size={13} aria-hidden />
              Белгілеуді тазалау
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setHabitat(null)}
            aria-pressed={habitat === null}
            className={`rounded-badge border px-2.5 py-1.5 text-xs transition-colors ${
              habitat === null
                ? "border-forest-700 bg-forest-700 font-semibold text-paper-bright"
                : "border-line bg-paper-bright text-graphite-600 hover:bg-paper-dim"
            }`}
          >
            Барлығы
          </button>
          {(Object.keys(habitatLabels) as HabitatType[]).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHabitat(habitat === h ? null : h)}
              aria-pressed={habitat === h}
              className={`rounded-badge border px-2.5 py-1.5 text-xs transition-colors ${
                habitat === h
                  ? "border-forest-700 bg-forest-700 font-semibold text-paper-bright"
                  : "border-line bg-paper-bright text-graphite-600 hover:bg-paper-dim"
              }`}
            >
              {habitatLabels[h]}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-graphite-400">
          Көрсетілген {visible.length} түрдің ішінен өз учаскеңізде кездестіргендерін белгілеңіз.
        </p>

        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {visible.map((plant) => {
            const on = selected.includes(plant.slug);
            return (
              <li key={plant.slug}>
                <button
                  type="button"
                  onClick={() => toggle(plant.slug)}
                  aria-pressed={on}
                  className={`flex w-full items-start gap-2.5 rounded-badge border px-3 py-2 text-left transition-colors ${
                    on
                      ? "border-forest-600 bg-sage-100"
                      : "border-line bg-paper-bright hover:border-line-strong hover:bg-paper-dim"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border ${
                      on ? "border-forest-700 bg-forest-700 text-paper" : "border-line-strong"
                    }`}
                  >
                    {on && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-graphite-900">
                      {plant.name.kk}
                    </span>
                    <span className="latin block truncate text-xs text-graphite-400">
                      {plant.name.la}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {visible.length === 0 && (
          <p className="mt-4 rounded-card border border-dashed border-line-strong p-6 text-center text-sm text-graphite-600">
            Сұранысқа сәйкес түр табылмады.
          </p>
        )}
      </div>

      {/* Заключение */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card border border-line bg-paper-bright p-6 print:border-0 print:p-0">
          <p className="eyebrow">Учаске бойынша қорытынды</p>

          {!enough ? (
            <p className="mt-4 text-sm text-graphite-600">
              Бағалау үшін кемінде {MIN_SAMPLE} түр белгіленуі керек. Қазір белгіленгені:{" "}
              <strong className="text-forest-800">{sample.length}</strong>. Іріктеме аз болса,
              индекс кездейсоқ шығады — сондықтан ол әдейі есептелмейді.
            </p>
          ) : (
            <>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-4xl leading-none" style={{ color: level.token }}>
                  {metrics.index}
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: level.token }}>
                    {level.label}
                  </p>
                  <p className="text-2xs text-graphite-400">Сақталу индексі · 100 балдан</p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
                {[
                  { label: "Белгіленген түр", value: metrics.plantCount },
                  { label: "Индикатор", value: metrics.indicatorCount },
                  { label: "Қорғалатын", value: metrics.protectedCount },
                ].map((item) => (
                  <div key={item.label}>
                    <dd className="font-display text-lg text-forest-800">{item.value}</dd>
                    <dt className="text-2xs text-graphite-400">{item.label}</dt>
                  </div>
                ))}
              </dl>

              <div className="mt-4">
                {FACTORS.map((f) => (
                  <ScaleRow
                    key={f}
                    label={scoreLabels[f].label}
                    low={scoreLabels[f].low}
                    high={scoreLabels[f].high}
                    value={metrics.averages[f]}
                  />
                ))}
              </div>

              <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-graphite-600">
                {metrics.interpretation.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              {closestZone && (
                <p className="mt-4 border-t border-line pt-4 text-xs text-graphite-600">
                  Индексі бойынша бұл учаске{" "}
                  <strong className="font-semibold text-forest-800">
                    {closestZone.zone.name.kk}
                  </strong>{" "}
                  аймағына жақын ({closestZone.index} балл).
                </p>
              )}

              {/* На печати список отмеченных видов обязателен: без него
                  заключение — число без исходных данных, проверить его нечем. */}
              <div className="mt-4 hidden border-t border-line pt-4 print:block">
                <p className="eyebrow">Белгіленген түрлер</p>
                <ol className="mt-2 columns-2 text-xs text-graphite-600">
                  {sample.map((p) => (
                    <li key={p.slug}>
                      {p.name.kk} — <span className="latin">{p.name.la}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-badge border border-forest-700 px-4 py-2.5 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-700 hover:text-paper-bright print:hidden"
              >
                <Printer size={15} aria-hidden />
                Қорытындыны басып шығару
              </button>
            </>
          )}
        </div>

        {enough && (
          <p className="mt-3 text-2xs text-graphite-400">
            Есептеу браузерде жүреді, деректер ешқайда жіберілмейді. Формула —{" "}
            <a href="/about" className="underline underline-offset-2 hover:text-ochre-700">
              «Әдістеме»
            </a>{" "}
            бетінде.
          </p>
        )}
      </div>
    </div>
  );
}
