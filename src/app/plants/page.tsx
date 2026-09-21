import type { Metadata } from "next";

import { PlantCatalog } from "@/components/plant/PlantCatalog";
import { getAllPlants, getAllZones } from "@/lib/plants";

export const metadata: Metadata = {
  title: "Түрлер базасы",
  description:
    "Жетісу өңірінің барлық зерттелген өсімдік түрлері: атауы бойынша іздеу, аймақ, мекен және биоиндикация сүзгілері, әрқайсысының цифрлық паспорты.",
};

/**
 * Общий список всех видов базы.
 *
 * Появился потому, что до него добраться до половины видов было нечем:
 * /red-book показывает только охраняемые и эндемики, а остальные жили
 * лишь точками на карте — их нельзя было ни найти по названию, ни
 * просто пролистать. Это единственная страница, откуда видна вся база.
 */
export default function PlantsPage() {
  const plants = getAllPlants();
  const zones = getAllZones();

  const redBook = plants.filter((p) => p.status.redBookKz).length;
  const endemic = plants.filter((p) => p.status.endemic).length;
  const indicator = plants.filter((p) => p.bioIndicator.isIndicator).length;

  return (
    <div className="mx-auto max-w-[84rem] px-6 py-12">
      <header className="border-b border-line pb-10">
        <p className="eyebrow">Plant Database</p>
        <h1 className="mt-3 text-3xl text-forest-900">Түрлер базасы</h1>
        <p className="mt-4 max-w-measure text-base text-graphite-600">
          Жетісу өңірі бойынша жиналған барлық түрлер бір тізімде. Атауын қазақша, латынша немесе
          орысша теріп іздеуге, аймағы мен мекені бойынша сүзуге және әрқайсысының цифрлық
          паспортын ашуға болады.
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
          <div>
            <dt className="eyebrow">Барлығы</dt>
            <dd className="mt-1 font-display text-2xl text-forest-800">{plants.length}</dd>
          </div>
          <div>
            <dt className="eyebrow">Қызыл кітапта</dt>
            <dd className="mt-1 font-display text-2xl text-forest-800">{redBook}</dd>
          </div>
          <div>
            <dt className="eyebrow">Эндемик</dt>
            <dd className="mt-1 font-display text-2xl text-forest-800">{endemic}</dd>
          </div>
          <div>
            <dt className="eyebrow">Биоиндикатор</dt>
            <dd className="mt-1 font-display text-2xl text-forest-800">{indicator}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-10">
        <PlantCatalog plants={plants} zones={zones} />
      </div>
    </div>
  );
}
