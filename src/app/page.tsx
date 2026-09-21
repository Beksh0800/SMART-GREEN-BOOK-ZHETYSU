import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ZoneRanking } from "@/components/bio/ZoneRanking";
import { BloomBands } from "@/components/home/BloomBands";
import { CountUp } from "@/components/home/CountUp";
import { MapPreview } from "@/components/home/MapPreview";
import { ModuleSection } from "@/components/home/ModuleSection";
import { PlantCard } from "@/components/plant/PlantCard";
import { computeAllZoneMetrics } from "@/lib/bioindicator";
import {
  getAllPlants,
  getAllZones,
  getProtectedPlants,
  getStats,
} from "@/lib/plants";
import { plantUrl, SITE_TAGLINE } from "@/lib/site";

export default function Home() {
  const plants = getAllPlants();
  const zones = getAllZones();
  const stats = getStats();
  const metrics = computeAllZoneMetrics(zones, plants).slice(0, 5);
  const featured = getProtectedPlants()
    .filter((p) => p.photo)
    .slice(0, 2);
  const qrSample = plants.find((p) => p.status.redBookKz) ?? plants[0];

  return (
    <div>
      {/* Hero: ландшафт Жетісу во весь экран */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden border-b border-line">
        <Image
          src="/images/hero/zhetysu.webp"
          alt="Жетісу өңірінің табиғаты"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,39,31,0.15) 0%, rgba(18,39,31,0.55) 55%, rgba(18,39,31,0.88) 100%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[84rem] px-6 pt-28 pb-14">
          <div className="flex items-center gap-3">
            <span aria-hidden className="block h-px w-10 bg-ochre-500" />
            <p className="text-2xs font-semibold tracking-[0.18em] text-ochre-200 uppercase">
              Smart Green Book — Zhetysu
            </p>
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.03] font-semibold text-paper md:text-5xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-5 max-w-measure text-lg text-paper/85">
            Өсімдік-индикаторлар негізінде жасалған сирек кездесетін, эндемик және Қызыл кітапқа
            енген түрлердің интерактивті картасы мен цифрлық паспорттары.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-badge bg-paper px-5 py-3 text-sm font-semibold text-forest-900 transition-colors hover:bg-ochre-100"
            >
              Картаны ашу
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 rounded-badge border border-paper/40 px-5 py-3 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10"
            >
              Барлық түрлер
            </Link>
            <Link
              href="/red-book"
              className="inline-flex items-center gap-2 rounded-badge border border-paper/40 px-5 py-3 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10"
            >
              Қызыл кітап базасы
            </Link>
          </div>
        </div>

        <p className="absolute right-4 bottom-3 text-2xs text-paper/50">
          Шарын шатқалы · фото: Bgag, CC0 / Wikimedia Commons
        </p>
      </section>

      {/* Состояние базы крупными цифрами */}
      <section className="border-b border-line bg-paper-bright">
        <dl className="mx-auto grid max-w-[84rem] grid-cols-2 gap-x-8 gap-y-8 px-6 py-12 md:grid-cols-4 lg:grid-cols-6">
          {[
            { label: "Өсімдік түрі", value: stats.total },
            { label: "Қызыл кітапта", value: stats.redBook },
            { label: "Эндемик", value: stats.endemic },
            { label: "Биоиндикатор", value: stats.indicators },
            { label: "Зерттелген аймақ", value: stats.zones },
            { label: "Картадағы нүкте", value: stats.locations },
          ].map((item) => (
            <div key={item.label}>
              <dd className="font-display text-3xl leading-none font-bold text-forest-800">
                <CountUp value={item.value} />
              </dd>
              <dt className="mt-2 text-xs text-graphite-600">{item.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-[84rem] px-6">
        <ModuleSection
          index="01"
          eyebrow="PlantMap"
          title="Жетісу өсімдіктерінің интерактивті картасы"
          description="Әр түрдің табылу орындары картада белгіленген. Нүктенің дәлдік деңгейі бөлек көрсетіледі: нақты координат — толық нүкте, аймақтық дерек — үзік сызықты шеңбер."
          points={[
            `${stats.locations} нүкте, оның ${stats.exactLocations}-і нақты координатпен расталған`,
            "Қорғау мәртебесі, аймақ, мекен түрі және индикаторлық фактор бойынша сүзгілер",
            "Нүктені басқанда түрдің қысқа паспорты ашылады",
          ]}
          href="/map"
          cta="Картаға өту"
          preview={<MapPreview plants={plants} zones={zones} />}
        />

        <ModuleSection
          index="02"
          eyebrow="Анықтағыш"
          title="Далада көрген өсімдікті белгілері бойынша анықтау"
          description="Тіршілік формасы, мекені, гүл түсі, биіктігі және гүлдеу айы — бес белгі бойынша база түрлері сұрыпталады. Далада қателесу оңай, сондықтан бір белгісі сәйкес келмейтін түрлер де тізімде қалады: қай белгі сәйкес келмегені әр жолда көрсетіледі."
          points={[
            "Барлық сұраққа жауап беру міндетті емес — екі-үш белгінің өзі жеткілікті",
            "Әр жауаптан кейін тізім бірден жаңарады",
            `${stats.total} түрдің гүлдеу күнтізбесі бір кестеде`,
          ]}
          href="/identify"
          cta="Анықтағышты ашу"
          flip
          preview={
            <div className="rounded-card border border-line bg-paper-bright p-6">
              <p className="eyebrow">Гүлдеу күнтізбесі</p>
              <div className="mt-4">
                <BloomBands plants={plants} />
              </div>
            </div>
          }
        />

        <ModuleSection
          index="03"
          eyebrow="QR Plant Passport"
          title="Әр өсімдіктің QR-паспорты"
          description="Кодты сканерлеген адам сол түрдің толық цифрлық паспортын телефонынан ашады: сипаттамасы, мекені, қорғау мәртебесі, индикаторлық қасиеттері және дереккөздері."
          points={[
            `${stats.total} түрдің әрқайсысына жеке QR-код дайындалған`,
            "Кодтар жоба ішінде сақталады — сыртқы QR-сервиске тәуелді емес",
            "Барлық кодты A4 парағына басып шығарып, стендке қоюға болады",
            "Базаны телефонға жүктеп қойса, кодтар интернетсіз де ашылады",
          ]}
          href="/qr"
          cta="QR-кодтар парағын көру"
          preview={
            <div className="rounded-card border border-line bg-paper-bright p-8">
              <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                <Image
                  src={`/qr/${qrSample.slug}.svg`}
                  alt={`${qrSample.name.kk} — QR`}
                  width={180}
                  height={180}
                  className="size-[180px] border border-line bg-white p-2"
                  unoptimized
                />
                <p className="mt-5 font-display text-base font-semibold text-forest-900">
                  {qrSample.name.kk}
                </p>
                <p className="latin mt-0.5 text-sm text-graphite-600">{qrSample.name.la}</p>
                <p className="mt-3 text-2xs break-all text-graphite-400">
                  {plantUrl(qrSample.slug).replace(/^https?:\/\//, "")}
                </p>
              </div>
            </div>
          }
        />

        <ModuleSection
          index="04"
          eyebrow="BioIndicator"
          title="Өсімдіктер арқылы экологиялық жағдайды салыстыру"
          description="Аймақтың жағдайы онда өсетін индикатор түрлердің құрамы бойынша бағаланады. Әр түрге ылғалдылық, тұздану, жайылым және ластану бойынша балл берілген, олардан аймақтың сақталу индексі есептеледі."
          points={[
            "Формула ашық көрсетілген — кез келген көрсеткішті қайта есептеуге болады",
            "Екі аймақты бір шкалада қатар қоюға болады",
            "Өз учаскеңізде көрген түрлерді белгілеп, сол формула бойынша баға алуға болады",
          ]}
          href="/bioindicator"
          cta="Салыстыруға өту"
          flip
          preview={
            <div className="rounded-card border border-line bg-paper-bright p-6">
              <p className="eyebrow">Аймақтардың сақталу индексі</p>
              <div className="mt-4">
                <ZoneRanking metrics={metrics} />
              </div>
            </div>
          }
        />

        <ModuleSection
          index="05"
          eyebrow="Red & Endemic Book"
          title="Қызыл кітап және эндемиктер базасы"
          description="Жетісуда кездесетін қорғалатын және тек осы аймаққа тән түрлердің жеке базасы: санаты, мекені, қауіп факторлары және дереккөздері."
          points={[
            `${stats.redBook} түр ҚР Қызыл кітабында, ${stats.endemic} түр эндемик`,
            "Санат, аймақ және мекен түрі бойынша сүзгілер",
            "Әр карточкадан толық паспортқа өтуге болады",
          ]}
          href="/red-book"
          cta="Базаны ашу"
          preview={
            <ul className="grid gap-5 sm:grid-cols-2">
              {featured.map((plant) => (
                <li key={plant.slug}>
                  <PlantCard plant={plant} />
                </li>
              ))}
            </ul>
          }
        />
      </div>

      {/* Источники */}
      <section className="border-t border-line bg-paper-bright">
        <div className="mx-auto max-w-[84rem] px-6 py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div>
              <p className="eyebrow">Деректердің негізі</p>
              <h2 className="mt-3 font-display text-xl text-forest-900">
                Әр сан мен нүктені қайта тексеруге болады
              </h2>
            </div>
            <div>
              <p className="max-w-measure text-base text-graphite-600">
                Түрлердің тізімі ҚР Қызыл кітабы мен Қазақстан флорасы басылымдарына, координаттар —
                GBIF-тің ашық кездесу деректеріне, таксономия Plants of the World Online дереккөзіне
                негізделген. Әр түрдің бетінде нақты сілтеме көрсетілген.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 border-b border-forest-700 pb-1 text-sm font-semibold text-forest-800 transition-colors hover:border-ochre-500 hover:text-ochre-700"
              >
                Әдістемені толық оқу
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
