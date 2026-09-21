import type { Metadata } from "next";

import { BloomCalendar } from "@/components/identify/BloomCalendar";
import { IdentifyWizard } from "@/components/identify/IdentifyWizard";
import { getAllPlants } from "@/lib/plants";

export const metadata: Metadata = {
  title: "Анықтағыш",
  description:
    "Жетісу өсімдіктерін далалық белгілері бойынша анықтау: тіршілік формасы, мекені, гүл түсі, биіктігі және гүлдеу айы.",
};

export default function IdentifyPage() {
  const plants = getAllPlants();

  return (
    <div className="mx-auto max-w-[84rem] px-6 py-12">
      <header className="border-b border-line pb-10">
        <p className="eyebrow">Анықтағыш · Identification key</p>
        <h1 className="mt-3 text-3xl text-forest-900">Өсімдікті белгілері бойынша анықтау</h1>
        <p className="mt-4 max-w-measure text-base text-graphite-600">
          Көрген өсімдігіңіздің белгілерін таңдаңыз — базадағы {plants.length} түрдің ішінен
          сәйкес келетіндері іріктеледі. Барлық сұраққа жауап беру міндетті емес: белгісіз
          белгіні өткізіп жіберуге болады, әр жауап тізімді тарылта түседі.
        </p>
      </header>

      <div className="mt-10">
        <IdentifyWizard plants={plants} />
      </div>

      <section className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-xl text-forest-900">Гүлдеу күнтізбесі</h2>
        <p className="mt-2 max-w-measure text-sm text-graphite-600">
          Базадағы барлық түрдің гүлдеу мерзімі бір кестеде. Көктемде гүлдеу айы түрді анықтауға
          көп көмектеседі, ал шілде–тамызда гүлдейтін түрлер аз болғандықтан бұл белгі әлсірейді.
        </p>
        <div className="mt-6">
          <BloomCalendar plants={plants} />
        </div>
      </section>

      <p className="mt-14 max-w-measure border-t border-line pt-6 text-xs text-graphite-400">
        Анықтағыштың белгілері әр түрдің паспортындағы морфология мен фенология сипаттамасынан
        алынған. Нәтиже — болжам, соңғы шешім түрдің толық паспортындағы айырым белгілері бойынша
        қабылданады.
      </p>
    </div>
  );
}
