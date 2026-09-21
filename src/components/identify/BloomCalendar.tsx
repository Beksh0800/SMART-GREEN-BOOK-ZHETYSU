import Link from "next/link";

import { monthLabels } from "@/lib/labels";
import type { Plant } from "@/lib/schema";

/**
 * Календарь цветения всей базы: строка на вид, колонка на месяц.
 *
 * Отдельная ценность этой таблицы — не поиск конкретного вида, а форма
 * всей картины: почти половина базы цветёт в апреле–мае, к августу остаются
 * полыни и галофиты. Для определения это значит, что месяц — сильный признак
 * весной и почти бесполезный в середине лета.
 *
 * Вид сортируется по первому месяцу цветения, поэтому закрашенные клетки
 * складываются в диагональ — сезон читается без легенды.
 */
export function BloomCalendar({ plants }: { plants: Plant[] }) {
  const rows = [...plants].sort((a, b) => {
    const aStart = Math.min(...a.traits.bloomMonths);
    const bStart = Math.min(...b.traits.bloomMonths);
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = Math.max(...a.traits.bloomMonths);
    const bEnd = Math.max(...b.traits.bloomMonths);
    if (aEnd !== bEnd) return aEnd - bEnd;
    return a.name.kk.localeCompare(b.name.kk, "kk");
  });

  const counts = monthLabels.map(
    (_, i) => plants.filter((p) => p.traits.bloomMonths.includes(i + 1)).length,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">
          Базадағы {plants.length} түрдің гүлдеу айлары
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-[14rem] pb-2 text-left">
              <span className="eyebrow">Түр</span>
            </th>
            {monthLabels.map((m) => (
              <th key={m.full} scope="col" className="pb-2 text-center">
                <span className="text-2xs font-semibold text-graphite-400">{m.short}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((plant) => (
            <tr key={plant.slug} className="border-t border-line">
              <th scope="row" className="py-1.5 pr-3 text-left font-normal">
                <Link
                  href={`/plant/${plant.slug}`}
                  className="block truncate text-xs text-graphite-900 transition-colors hover:text-forest-700"
                  title={`${plant.name.kk} — ${plant.name.la}`}
                >
                  {plant.name.kk}
                </Link>
              </th>
              {monthLabels.map((m, i) => {
                const on = plant.traits.bloomMonths.includes(i + 1);
                return (
                  <td key={m.full} className="px-[2px] py-1.5">
                    <span
                      className={`block h-3 rounded-[2px] ${on ? "bg-ochre-500" : "bg-paper-dim"}`}
                      title={on ? `${plant.name.kk}: ${m.full}` : undefined}
                    >
                      <span className="sr-only">
                        {on ? `${m.full} — гүлдейді` : `${m.full} — гүлдемейді`}
                      </span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line-strong">
            <td className="pt-2 text-2xs text-graphite-400">Айына гүлдейтін түр саны</td>
            {counts.map((count, i) => (
              <td key={monthLabels[i].full} className="pt-2 text-center">
                <span className="text-2xs font-semibold text-forest-800">{count}</span>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
