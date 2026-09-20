import Image from "next/image";
import Link from "next/link";

import { EndemicBadge, IndicatorBadge, IucnBadge, RedBookBadge } from "@/components/ui/Badge";
import type { Plant } from "@/lib/schema";

import { PlantPlaceholder } from "./PlantPlaceholder";

/**
 * Карточка вида для сетки каталога.
 *
 * Снимок занимает всю карточку, название лежит поверх него — в каталоге
 * растений главным должно быть растение, а не строка текста рядом с ним.
 * У видов без свободного фото силуэт светлый, поэтому подписи там тёмные.
 */
export function PlantCard({ plant }: { plant: Plant }) {
  const hasPhoto = Boolean(plant.photo);

  return (
    <article className="group relative h-full overflow-hidden rounded-card border border-line bg-paper-bright">
      <Link href={`/plant/${plant.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-3/4 w-full overflow-hidden">
          {plant.photo ? (
            <Image
              src={`/images/plants/${plant.photo.file}`}
              alt={plant.name.kk}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <PlantPlaceholder slug={plant.slug} className="h-full w-full" label="" />
          )}

          {hasPhoto && (
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/3 transition-opacity duration-500 group-hover:opacity-95"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,39,31,0) 0%, rgba(18,39,31,0.58) 55%, rgba(18,39,31,0.9) 100%)",
              }}
            />
          )}

          {plant.status.redBookKz && (
            <div className="absolute top-4 left-4 rounded-badge bg-paper/92 backdrop-blur-sm">
              <RedBookBadge category={plant.status.redBookKz} />
            </div>
          )}

          {/* Название поверх снимка */}
          <div className="absolute inset-x-5 bottom-5">
            <h3
              className={`font-display text-xl leading-tight font-semibold ${
                hasPhoto ? "text-paper" : "text-forest-900"
              }`}
            >
              {plant.name.kk}
            </h3>
            <p
              className={`latin mt-1 text-sm ${hasPhoto ? "text-paper/75" : "text-graphite-600"}`}
            >
              {plant.name.la}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col border-t border-line p-5">
          <p className="line-clamp-3 text-sm text-graphite-600">{plant.description.summary}</p>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {plant.status.iucn && <IucnBadge category={plant.status.iucn} />}
            {plant.status.endemic && <EndemicBadge type={plant.status.endemic} />}
            {plant.bioIndicator.isIndicator && <IndicatorBadge />}
          </div>
        </div>
      </Link>
    </article>
  );
}
