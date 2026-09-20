"use client";

import { useState } from "react";

import { indexLabel, type ZoneMetrics } from "@/lib/bioindicator";
import { scoreLabels } from "@/lib/labels";

const FACTORS = ["moisture", "salinity", "grazing", "pollutionTolerance"] as const;

const SERIES = [
  { token: "var(--color-series-a)", name: "А аймағы" },
  { token: "var(--color-series-b)", name: "Б аймағы" },
] as const;

function ZonePicker({
  label,
  value,
  onChange,
  metrics,
  tone,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  metrics: ZoneMetrics[];
  tone: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="eyebrow inline-flex items-center gap-2">
        <span className="block size-2.5 rounded-badge" style={{ backgroundColor: tone }} />
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-badge border border-line bg-paper-bright px-3 py-2.5 text-sm font-semibold text-graphite-900 focus:border-forest-400 focus:outline-none"
      >
        {metrics.map((m) => (
          <option key={m.zone.id} value={m.zone.id}>
            {m.zone.name.kk}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Одна пара полос: два значения одного фактора по двум зонам. */
function CompareRow({
  label,
  low,
  high,
  a,
  b,
}: {
  label: string;
  low: string;
  high: string;
  a: number;
  b: number;
}) {
  return (
    <div className="border-t border-line py-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-graphite-900">{label}</span>
        <span className="text-2xs text-graphite-400">
          {low} → {high}
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        {[a, b].map((value, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 flex-1 rounded-badge bg-paper-dim">
              <div
                className="h-full rounded-badge"
                style={{
                  width: `${(value / 5) * 100}%`,
                  backgroundColor: SERIES[i].token,
                }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs font-semibold text-graphite-900">
              {value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ZoneSummary({ metrics, tone }: { metrics: ZoneMetrics; tone: string }) {
  const level = indexLabel(metrics.index);
  return (
    <div className="rounded-card border border-line bg-paper-bright p-5">
      <div className="flex items-center gap-2">
        <span className="block size-2.5 rounded-badge" style={{ backgroundColor: tone }} />
        <p className="font-display text-base font-semibold text-forest-900">
          {metrics.zone.name.kk}
        </p>
      </div>
      <p className="mt-3 font-display text-3xl" style={{ color: level.token }}>
        {metrics.index}
        <span className="ml-1 text-base text-graphite-400">/ 100</span>
      </p>
      <p className="mt-1 text-xs font-semibold" style={{ color: level.token }}>
        {level.label}
      </p>
      <p className="mt-3 text-xs text-graphite-400">
        {metrics.plantCount} түр · {metrics.indicatorCount} индикатор · {metrics.protectedCount}{" "}
        қорғалатын
      </p>
      <ul className="mt-4 space-y-2 border-t border-line pt-3 text-sm text-graphite-600">
        {metrics.interpretation.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/** Сравнение двух зон: одинаковые шкалы, две серии, подписи у каждой полосы. */
export function ZoneCompare({ metrics }: { metrics: ZoneMetrics[] }) {
  // По умолчанию сравниваем крайние оценённые зоны — контраст виден сразу
  const [aId, setAId] = useState(metrics[0]?.zone.id ?? "");
  const [bId, setBId] = useState(metrics.at(-1)?.zone.id ?? "");

  const a = metrics.find((m) => m.zone.id === aId) ?? metrics[0];
  const b = metrics.find((m) => m.zone.id === bId) ?? metrics.at(-1);
  if (!a || !b) return null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <ZonePicker
          label={SERIES[0].name}
          value={a.zone.id}
          onChange={setAId}
          metrics={metrics}
          tone={SERIES[0].token}
        />
        <ZonePicker
          label={SERIES[1].name}
          value={b.zone.id}
          onChange={setBId}
          metrics={metrics}
          tone={SERIES[1].token}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ZoneSummary metrics={a} tone={SERIES[0].token} />
        <ZoneSummary metrics={b} tone={SERIES[1].token} />
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-forest-900">
            Индикаторлық көрсеткіштерді салыстыру
          </h3>
          <ul className="flex gap-4">
            {[a, b].map((zone, i) => (
              <li key={zone.zone.id} className="flex items-center gap-2 text-xs text-graphite-600">
                <span
                  className="block size-2.5 rounded-badge"
                  style={{ backgroundColor: SERIES[i].token }}
                />
                {zone.zone.name.kk}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-2">
          {FACTORS.map((factor) => (
            <CompareRow
              key={factor}
              label={scoreLabels[factor].label}
              low={scoreLabels[factor].low}
              high={scoreLabels[factor].high}
              a={a.averages[factor]}
              b={b.averages[factor]}
            />
          ))}
          <div className="border-t border-line py-4 text-sm text-graphite-600">
            <span className="font-semibold text-graphite-900">{scoreLabels.soilPh.label}:</span>{" "}
            {a.zone.name.kk} — pH {a.averages.soilPh.toFixed(1)} · {b.zone.name.kk} — pH{" "}
            {b.averages.soilPh.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
