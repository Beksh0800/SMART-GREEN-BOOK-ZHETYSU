import Link from "next/link";

import { indexLabel, type ZoneMetrics } from "@/lib/bioindicator";

/**
 * Рейтинг зон по индексу сохранности — горизонтальные полосы.
 * Одна серия, значит один цвет: длина полосы и есть величина,
 * красить её «темнее там, где больше» было бы двойным кодированием.
 * Значение подписано у каждой полосы, поэтому цвет ничего не несёт в одиночку.
 */
export function ZoneRanking({ metrics }: { metrics: ZoneMetrics[] }) {
  return (
    <ol className="space-y-3.5">
      {metrics.map((m) => {
        const level = indexLabel(m.index);
        return (
          <li key={m.zone.id}>
            <div className="flex items-baseline justify-between gap-4">
              <Link
                href={`#${m.zone.id}`}
                className="text-sm font-semibold text-graphite-900 transition-colors hover:text-forest-700"
              >
                {m.zone.name.kk}
              </Link>
              <span className="shrink-0 text-xs text-graphite-400">
                {m.indicatorCount} индикатор түр
                {m.indicatorCount < 3 && (
                  <span
                    className="ml-1.5 text-ochre-700"
                    title="Түр саны аз — индекс шамамен алынған"
                  >
                    · іріктеме аз
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div
                className="h-2.5 flex-1 overflow-hidden rounded-badge bg-line"
                role="img"
                aria-label={`${m.zone.name.kk}: сақталу индексі ${m.index} / 100`}
              >
                <div
                  className="h-full rounded-badge"
                  style={{ width: `${Math.max(m.index, 2)}%`, backgroundColor: level.token }}
                />
              </div>
              <span
                className="w-24 shrink-0 text-right text-xs font-semibold"
                style={{ color: level.token }}
              >
                {m.index} · {level.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
