import Link from "next/link";

import { flowerColorLabels, lifeFormLabels, monthLabels } from "@/lib/labels";
import type { PlantTraits } from "@/lib/schema";

/**
 * Полевые признаки вида — те самые, по которым работает определитель
 * (/identify). Показываются в паспорте, чтобы результат определения можно
 * было перепроверить по странице вида, а не принимать на веру.
 */
export function FieldTraits({ traits }: { traits: PlantTraits }) {
  const [min, max] = traits.heightCm;
  const height =
    max >= 100
      ? `${(min / 100).toFixed(min % 100 === 0 ? 0 : 1)}–${(max / 100).toFixed(
          max % 100 === 0 ? 0 : 1,
        )} м`
      : `${min}–${max} см`;

  return (
    <div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-2xs text-graphite-400">Тіршілік формасы</dt>
          <dd className="mt-1 text-sm font-semibold text-graphite-900">
            {lifeFormLabels[traits.lifeForm].label}
          </dd>
        </div>
        <div>
          <dt className="text-2xs text-graphite-400">Биіктігі</dt>
          <dd className="mt-1 text-sm font-semibold text-graphite-900">{height}</dd>
        </div>
        <div>
          <dt className="text-2xs text-graphite-400">Гүлінің түсі</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2">
            {traits.flowerColor.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="block size-3 rounded-full border border-line-strong"
                  style={{ backgroundColor: flowerColorLabels[c].swatch }}
                />
                <span className="text-sm font-semibold text-graphite-900">
                  {flowerColorLabels[c].label}
                </span>
              </span>
            ))}
          </dd>
        </div>
      </dl>

      {/* Годовая шкала: закрашены месяцы цветения */}
      <div className="mt-5">
        <p className="text-2xs text-graphite-400">Гүлдеу айлары</p>
        <div
          className="mt-1.5 flex gap-[3px]"
          role="img"
          aria-label={`Гүлдеу айлары: ${traits.bloomMonths
            .map((m) => monthLabels[m - 1].full)
            .join(", ")}`}
        >
          {monthLabels.map((m, i) => {
            const on = traits.bloomMonths.includes(i + 1);
            return (
              <span key={m.full} className="flex flex-1 flex-col items-center gap-1">
                <span
                  aria-hidden
                  className={`h-2 w-full rounded-[2px] ${on ? "bg-ochre-500" : "bg-line"}`}
                />
                <span
                  className={`text-2xs ${on ? "font-semibold text-ochre-700" : "text-graphite-400"}`}
                >
                  {m.short}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-xs text-graphite-400">
        Осы белгілер бойынша{" "}
        <Link href="/identify" className="underline underline-offset-2 hover:text-ochre-700">
          анықтағышта
        </Link>{" "}
        түрді далада анықтауға болады.
      </p>
    </div>
  );
}
