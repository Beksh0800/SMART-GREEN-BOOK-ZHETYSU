import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";

import { MiniMapLoader } from "@/components/map/MiniMapLoader";
import { OpenInMaps } from "@/components/map/OpenInMaps";
import { getPlantGroup, groupStyles } from "@/components/map/mapStyle";
import { EndemicBadge, IndicatorBadge, IucnBadge, RedBookBadge } from "@/components/ui/Badge";
import { FieldTraits } from "@/components/plant/FieldTraits";
import { IndicatorScale } from "@/components/plant/IndicatorScale";
import { PlantPlaceholder } from "@/components/plant/PlantPlaceholder";
import { QrBlock } from "@/components/plant/QrBlock";
import {
  habitatLabels,
  indicatorFactorLabels,
  iucnLabels,
  precisionLabels,
  redBookLabels,
  scoreLabels,
} from "@/lib/labels";
import { getAllPlants, getAllZones, getPlantBySlug, getZoneById } from "@/lib/plants";

export function generateStaticParams() {
  return getAllPlants().map((plant) => ({ slug: plant.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plant = getPlantBySlug(slug);
  if (!plant) return {};

  return {
    title: `${plant.name.kk} (${plant.name.la})`,
    description: plant.description.summary,
    openGraph: {
      title: `${plant.name.kk} · ${plant.name.la}`,
      description: plant.description.summary,
    },
  };
}

/** Блок текстовых данных паспорта — разделители тонкой линией, без карточек в карточках. */
function DataBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <h2 className="eyebrow">{title}</h2>
      <div className="mt-3 max-w-measure text-base text-graphite-600">{children}</div>
    </section>
  );
}

export default async function PlantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plant = getPlantBySlug(slug);
  if (!plant) notFound();

  const zones = getAllZones();
  const color = groupStyles[getPlantGroup(plant)].color;
  const { scores } = plant.bioIndicator;

  return (
    <article className="mx-auto max-w-[84rem] px-6 py-10">
      <Link
        href="/map"
        className="inline-flex items-center gap-2 text-sm text-graphite-600 transition-colors hover:text-forest-800 print:hidden"
      >
        <ArrowLeft size={16} />
        Картаға оралу
      </Link>

      {/* Разворот гербарного листа: слева образец, справа данные */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <figure className="overflow-hidden rounded-card border border-line bg-paper-bright">
            <div className="relative aspect-4/5 w-full">
              {plant.photo ? (
                <Image
                  src={`/images/plants/${plant.photo.file}`}
                  alt={plant.name.kk}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <PlantPlaceholder slug={plant.slug} className="h-full w-full" />
              )}
            </div>
            {plant.photo && (
              <figcaption className="border-t border-line px-4 py-3 text-2xs text-graphite-400">
                Фото: {plant.photo.author} · {plant.photo.license} ·{" "}
                <a
                  href={plant.photo.url}
                  className="underline underline-offset-2 hover:text-forest-700"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  дереккөз
                </a>
              </figcaption>
            )}
          </figure>

          <div className="mt-6 print:hidden">
            <QrBlock slug={plant.slug} name={plant.name.kk} />
          </div>
        </div>

        <div>
          <header>
            <p className="eyebrow">
              {plant.family.kk} · <span className="latin">{plant.family.la}</span>
            </p>
            <h1 className="mt-3 text-3xl text-forest-900">{plant.name.kk}</h1>
            <p className="latin mt-2 text-xl text-graphite-600">{plant.name.la}</p>
            <p className="mt-1 text-sm text-graphite-400">{plant.name.ru}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {plant.status.redBookKz && <RedBookBadge category={plant.status.redBookKz} />}
              {plant.status.iucn && <IucnBadge category={plant.status.iucn} />}
              {plant.status.endemic && <EndemicBadge type={plant.status.endemic} />}
              {plant.bioIndicator.isIndicator && <IndicatorBadge />}
            </div>

            <p className="mt-6 max-w-measure text-lg text-graphite-900">
              {plant.description.summary}
            </p>
          </header>

          <div className="mt-10">
            <DataBlock title="Қорғау мәртебесі">
              <ul className="space-y-1.5 text-sm">
                <li>
                  ҚР Қызыл кітабы:{" "}
                  <strong className="font-semibold text-graphite-900">
                    {plant.status.redBookKz
                      ? `${redBookLabels[plant.status.redBookKz].short} — ${redBookLabels[plant.status.redBookKz].full}`
                      : "тізімге енбеген"}
                  </strong>
                </li>
                <li>
                  IUCN Red List:{" "}
                  <strong className="font-semibold text-graphite-900">
                    {plant.status.iucn ? iucnLabels[plant.status.iucn] : "бағаланбаған (NE)"}
                  </strong>
                  {/*
                    Пустая строка читалась как пробел в нашей базе, хотя это
                    свойство вида: IUCN оценила лишь часть флоры региона,
                    и «не оценён» — такой же факт, как категория.
                  */}
                  {!plant.status.iucn && (
                    <span className="block text-xs text-graphite-400">
                      Түр IUCN жаһандық тізімінде әлі бағаланбаған — бұл сирек емес дегенді
                      білдірмейді, аймақтық мәртебесі ҚР Қызыл кітабы бойынша беріледі.
                    </span>
                  )}
                </li>
                <li>
                  Кездесуі:{" "}
                  <strong className="font-semibold text-graphite-900">{plant.status.rarity}</strong>
                </li>
              </ul>
            </DataBlock>

            <DataBlock title="Сыртқы белгілері">{plant.description.morphology}</DataBlock>

            <DataBlock title="Далалық белгілері">
              <FieldTraits traits={plant.traits} />
            </DataBlock>

            <DataBlock title="Мекені">
              <p>{plant.description.habitat}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {plant.habitat.map((h) => (
                  <li
                    key={h}
                    className="rounded-badge border border-line bg-paper-dim px-2 py-1 text-xs text-graphite-600"
                  >
                    {habitatLabels[h]}
                  </li>
                ))}
              </ul>
            </DataBlock>

            <DataBlock title="Даму кезеңдері">{plant.description.phenology}</DataBlock>
            <DataBlock title="Маңызы мен пайдаланылуы">{plant.description.uses}</DataBlock>
            <DataBlock title="Қауіп факторлары">{plant.description.threats}</DataBlock>

            {plant.bioIndicator.isIndicator && (
              <DataBlock title="Индикаторлық қасиеттері">
                <p>{plant.bioIndicator.note}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {plant.bioIndicator.indicates.map((factor) => (
                    <li
                      key={factor}
                      className="rounded-badge border border-sage-300 bg-sage-100 px-2 py-1 text-xs text-forest-800"
                    >
                      {indicatorFactorLabels[factor]}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <IndicatorScale
                    label={scoreLabels.moisture.label}
                    value={scores.moisture}
                    low={scoreLabels.moisture.low}
                    high={scoreLabels.moisture.high}
                  />
                  <IndicatorScale
                    label={scoreLabels.salinity.label}
                    value={scores.salinity}
                    low={scoreLabels.salinity.low}
                    high={scoreLabels.salinity.high}
                  />
                  <IndicatorScale
                    label={scoreLabels.grazing.label}
                    value={scores.grazing}
                    low={scoreLabels.grazing.low}
                    high={scoreLabels.grazing.high}
                  />
                  <IndicatorScale
                    label={scoreLabels.pollutionTolerance.label}
                    value={scores.pollutionTolerance}
                    low={scoreLabels.pollutionTolerance.low}
                    high={scoreLabels.pollutionTolerance.high}
                  />
                </div>
                <p className="mt-5 text-sm text-graphite-400">
                  Топырақ реакциясы: pH ≈ {scores.soilPh.toFixed(1)}
                </p>
              </DataBlock>
            )}

            <DataBlock title="Таралуы">
              <div className="isolate h-[280px] overflow-hidden rounded-card border border-line sm:h-[320px]">
                <MiniMapLoader locations={plant.locations} zones={zones} color={color} />
              </div>
              <ul className="mt-4 space-y-3">
                {plant.locations.map((location) => {
                  const zone = getZoneById(location.zoneId);
                  const precision = precisionLabels[location.precision];
                  return (
                    <li key={`${location.lat}-${location.lon}`} className="flex gap-3 text-sm">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-sage-600" />
                      <div>
                        <p className="font-semibold text-graphite-900">{location.label}</p>
                        <p className="text-xs text-graphite-400">
                          {zone?.name.kk} · {location.lat.toFixed(4)}, {location.lon.toFixed(4)} ·{" "}
                          <span title={precision.hint}>{precision.label}</span>
                        </p>
                        <p className="mt-1 text-xs text-graphite-400">
                          Дереккөз: {location.source}
                          {location.sourceUrl && (
                            <>
                              {" "}
                              <a
                                href={location.sourceUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-forest-700"
                              >
                                сілтеме
                                <ExternalLink size={11} />
                              </a>
                            </>
                          )}
                        </p>
                        <OpenInMaps
                          lat={location.lat}
                          lon={location.lon}
                          label={location.label}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </DataBlock>

            <DataBlock title="Дереккөздер">
              <ul className="space-y-2 text-sm">
                {plant.sources.map((source) => (
                  <li key={source.title}>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-forest-700"
                      >
                        {source.title}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      source.title
                    )}
                  </li>
                ))}
              </ul>
            </DataBlock>
          </div>
        </div>
      </div>
    </article>
  );
}
