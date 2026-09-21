import type { Metadata } from "next";

import { PlantCatalog } from "@/components/plant/PlantCatalog";
import { redBookLabels } from "@/lib/labels";
import { getAllZones, getProtectedPlants } from "@/lib/plants";
import { RED_BOOK_CATEGORIES } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Қызыл кітап және эндемиктер",
  description:
    "Жетісу өңірінің ҚР Қызыл кітабына енген және эндемик өсімдіктерінің цифрлық базасы: санаттар, мекені, қауіп факторлары.",
};

export default function RedBookPage() {
  const plants = getProtectedPlants();
  const zones = getAllZones();

  const byCategory = RED_BOOK_CATEGORIES.map((category) => ({
    category,
    count: plants.filter((p) => p.status.redBookKz === category).length,
  })).filter((item) => item.count > 0);

  const endemicCount = plants.filter((p) => p.status.endemic).length;

  return (
    <div className="mx-auto max-w-[84rem] px-6 py-12">
      <header className="border-b border-line pb-10">
        <p className="eyebrow">Red &amp; Endemic Book</p>
        <h1 className="mt-3 text-3xl text-forest-900">Қызыл кітап және эндемик өсімдіктер</h1>
        <p className="mt-4 max-w-measure text-base text-graphite-600">
          Жетісу өңірінде кездесетін, Қазақстан Республикасының Қызыл кітабына енген және тек осы
          аймаққа тән түрлердің тізімі. Әр түрдің санаты, мекені мен қауіп факторлары цифрлық
          паспортында көрсетілген.
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
          <div>
            <dt className="eyebrow">Барлығы</dt>
            <dd className="mt-1 font-display text-2xl text-forest-800">{plants.length}</dd>
          </div>
          <div>
            <dt className="eyebrow">Эндемик</dt>
            <dd className="mt-1 font-display text-2xl text-forest-800">{endemicCount}</dd>
          </div>
          {byCategory.map(({ category, count }) => (
            <div key={category}>
              <dt className="eyebrow" style={{ color: redBookLabels[category].token }}>
                {redBookLabels[category].short}
              </dt>
              <dd className="mt-1 font-display text-2xl text-forest-800">{count}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-10">
        <PlantCatalog plants={plants} zones={zones} />
      </div>
    </div>
  );
}
