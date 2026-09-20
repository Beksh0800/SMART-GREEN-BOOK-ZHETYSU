import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ZoneCompare } from "@/components/bio/ZoneCompare";
import { ZoneRanking } from "@/components/bio/ZoneRanking";
import { computeAllZoneMetrics, indexLabel, splitByDataAvailability } from "@/lib/bioindicator";
import { habitatLabels, indicatorFactorLabels } from "@/lib/labels";
import { getAllPlants, getAllZones, getIndicatorPlants } from "@/lib/plants";

export const metadata: Metadata = {
  title: "BioIndicator — аймақтарды салыстыру",
  description:
    "Өсімдік-индикаторлардың құрамы бойынша Жетісу аймақтарының экологиялық жағдайын салыстыру: ылғалдылық, тұздану, жайылым қысымы, ластану.",
};

export default function BioIndicatorPage() {
  const plants = getAllPlants();
  const zones = getAllZones();
  const metrics = computeAllZoneMetrics(zones, plants);
  const { rated, noData } = splitByDataAvailability(metrics);
  const indicators = getIndicatorPlants();

  const avgIndex = Math.round(rated.reduce((s, m) => s + m.index, 0) / (rated.length || 1));

  return (
    <div className="mx-auto max-w-[84rem] px-6 py-12">
      <header className="border-b border-line pb-10">
        <p className="eyebrow">BioIndicator</p>
        <h1 className="mt-3 text-3xl text-forest-900">
          Өсімдік-индикаторлар арқылы аймақтарды салыстыру
        </h1>
        <p className="mt-4 max-w-measure text-base text-graphite-600">
          Аймақтың жағдайы аспаппен емес, сонда өсетін өсімдіктердің құрамы арқылы бағаланады.
          Әр индикатор түрге бес көрсеткіш бойынша балл берілген; аймақ бойынша олардың орташа мәні
          мен сезімтал түрлердің үлесі сақталу индексін құрайды.
        </p>
        <Link
          href="/about"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 underline-offset-4 hover:underline"
        >
          Есептеу әдістемесімен танысу
          <ArrowRight size={15} />
        </Link>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
          {[
            { label: "Бағаланған аймақ", value: rated.length },
            { label: "Индикатор түр", value: indicators.length },
            { label: "Орташа индекс", value: avgIndex },
            { label: "Ең жоғары индекс", value: rated[0]?.index ?? 0 },
          ].map((item) => (
            <div key={item.label} className="bg-paper-bright px-5 py-5">
              <dt className="eyebrow">{item.label}</dt>
              <dd className="mt-1.5 font-display text-2xl text-forest-800">{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="border-b border-line py-10">
        <h2 className="font-display text-xl text-forest-900">Аймақтардың сақталу индексі</h2>
        <p className="mt-2 max-w-measure text-sm text-graphite-600">
          Индекс 0-ден 100-ге дейін: неғұрлым жоғары болса, аймақтағы өсімдік жамылғысы соғұрлым аз
          бұзылған. Есептеу формуласы «Әдістеме» бетінде ашық көрсетілген.
        </p>
        <div className="mt-6 max-w-3xl">
          <ZoneRanking metrics={rated} />
        </div>

        {noData.length > 0 && (
          <p className="mt-6 max-w-measure rounded-card border border-line bg-paper-bright p-4 text-sm text-graphite-600">
            <strong className="font-semibold text-graphite-900">Деректер жеткіліксіз:</strong>{" "}
            {noData.map((m) => m.zone.name.kk).join(", ")} — бұл аймақтар бойынша базаға индикатор
            түрлер әлі енгізілмеген, сондықтан индекс есептелмейді.
          </p>
        )}
      </section>

      <section className="border-b border-line py-10">
        <h2 className="font-display text-xl text-forest-900">Екі аймақты салыстыру</h2>
        <p className="mt-2 max-w-measure text-sm text-graphite-600">
          Аймақтарды таңдаңыз — көрсеткіштер бірдей шкалада қатар қойылады.
        </p>
        <div className="mt-6">
          <ZoneCompare metrics={rated} />
        </div>
      </section>

      <section className="py-10">
        <h2 className="font-display text-xl text-forest-900">Аймақтар бойынша қорытынды</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rated.map((m) => {
            const level = indexLabel(m.index);
            return (
              <article
                key={m.zone.id}
                id={m.zone.id}
                className="scroll-mt-24 rounded-card border border-line bg-paper-bright p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-forest-900">
                    {m.zone.name.kk}
                  </h3>
                  <span className="font-display text-lg" style={{ color: level.token }}>
                    {m.index}
                  </span>
                </div>
                <p className="mt-1 text-2xs text-graphite-400">
                  {m.zone.elevationM[0]}–{m.zone.elevationM[1]} м ·{" "}
                  {m.zone.habitat.map((h) => habitatLabels[h]).join(", ")}
                </p>
                <p className="mt-3 text-sm text-graphite-600">{m.zone.description.kk}</p>
                <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs text-graphite-600">
                  {m.interpretation.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {m.indicatorCount > 0 && (
                  <p className="mt-3 text-2xs text-graphite-400">
                    Негізгі факторлар:{" "}
                    {[
                      ...new Set(
                        plants
                          .filter((p) => p.locations.some((l) => l.zoneId === m.zone.id))
                          .flatMap((p) => p.bioIndicator.indicates),
                      ),
                    ]
                      .map((f) => indicatorFactorLabels[f])
                      .join(" · ")}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
