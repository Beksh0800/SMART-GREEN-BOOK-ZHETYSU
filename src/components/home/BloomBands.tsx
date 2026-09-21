import { monthLabels } from "@/lib/labels";
import type { Plant } from "@/lib/schema";

/**
 * Превью календаря цветения на главной: сколько видов базы цветёт в каждом
 * месяце. Полный календарь по видам живёт на /identify — здесь только форма
 * кривой, ради которой стоит туда зайти: весенний пик и пустой конец лета.
 */
export function BloomBands({ plants }: { plants: Plant[] }) {
  const counts = monthLabels.map(
    (_, i) => plants.filter((p) => p.traits.bloomMonths.includes(i + 1)).length,
  );
  const peak = Math.max(...counts, 1);
  const peakMonth = monthLabels[counts.indexOf(peak)];

  return (
    <div>
      <div className="flex h-32 items-end gap-1.5">
        {counts.map((count, i) => (
          <div key={monthLabels[i].full} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-2xs text-graphite-400">{count || ""}</span>
            <span
              aria-hidden
              className={`w-full rounded-t-[2px] ${
                count === peak ? "bg-ochre-500" : "bg-sage-300"
              }`}
              style={{ height: `${Math.max((count / peak) * 88, 2)}px` }}
            />
            <span className="text-2xs text-graphite-400">{monthLabels[i].short}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-line pt-3 text-xs text-graphite-600">
        Ең көп гүлдейтін ай — {peakMonth.full}: базадағы {plants.length} түрдің {peak}-і гүлдейді.
      </p>
    </div>
  );
}
