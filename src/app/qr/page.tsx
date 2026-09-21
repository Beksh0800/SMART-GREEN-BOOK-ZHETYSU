import type { Metadata } from "next";
import Image from "next/image";
import { Printer } from "lucide-react";

import { OfflineMode } from "@/components/pwa/OfflineMode";
import { getAllPlants } from "@/lib/plants";
import { plantUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "QR-кодтар — басып шығаруға арналған парақ",
  description:
    "Барлық түрлердің QR-кодтары бір параққа жинақталған: A4 форматында басып шығарып, көрме стендіне қоюға болады.",
};

/**
 * Печатный лист всех QR-кодов. Экранная версия объясняет, что это,
 * печатная — только сетка кодов с подписями, без интерфейса.
 */
export default function QrSheetPage() {
  const plants = getAllPlants();

  /**
   * Что кладётся в офлайн-кэш: страница каждого вида, её QR и снимок.
   * Список собирается здесь, на сервере, из тех же данных, что и лист кодов, —
   * иначе офлайн-набор и напечатанные коды могли бы разойтись.
   */
  const offlineUrls = [
    ...plants.map((p) => `/plant/${p.slug}`),
    ...plants.map((p) => `/qr/${p.slug}.svg`),
    ...plants.filter((p) => p.photo).map((p) => `/images/plants/${p.photo!.file}`),
    // Снимок на главной: она лежит в офлайн-оболочке и без него выглядит битой.
    "/images/hero/zhetysu.webp",
  ];

  return (
    <div className="mx-auto max-w-[84rem] px-6 py-12 print:max-w-none print:px-0 print:py-0">
      <header className="print:hidden">
        <p className="eyebrow">QR Plant Passport</p>
        <h1 className="mt-3 text-3xl text-forest-900">QR-кодтар парағы</h1>
        <p className="mt-4 max-w-measure text-base text-graphite-600">
          Әр кодты сканерлегенде сол өсімдіктің цифрлық паспорты ашылады. Парақты A4 форматында
          басып шығарып, көрме стендіне немесе гербарий қасына қоюға болады.
        </p>
        <div className="mt-6">
          <OfflineMode urls={offlineUrls} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href="#sheet"
            className="inline-flex items-center gap-2 rounded-badge bg-forest-800 px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-700"
          >
            <Printer size={16} />
            Басып шығару парағына өту
          </a>
          <p className="text-xs text-graphite-400">
            Барлығы {plants.length} код
          </p>
        </div>
      </header>

      <section
        id="sheet"
        className="mt-10 grid grid-cols-2 overflow-hidden rounded-card border border-line sm:grid-cols-3 lg:grid-cols-4 print:mt-0 print:grid-cols-3 print:rounded-none print:border-0"
      >
        {plants.map((plant) => (
          <article
            key={plant.slug}
            className="flex break-inside-avoid flex-col items-center gap-3 border-r border-b border-line bg-paper-bright p-5 text-center"
          >
            {/*
              loading="eager" здесь обязателен: при печати браузер не
              прокручивает страницу, и ленивые изображения остаются
              незагруженными — лист выходит наполовину пустым.
            */}
            <Image
              src={`/qr/${plant.slug}.svg`}
              alt={`${plant.name.kk} — QR`}
              width={140}
              height={140}
              className="size-[140px] print:size-[120px]"
              loading="eager"
              unoptimized
            />
            <div>
              <p className="font-display text-sm font-semibold text-forest-900">{plant.name.kk}</p>
              <p className="latin mt-0.5 text-xs text-graphite-600">{plant.name.la}</p>
              <p className="mt-2 text-2xs break-all text-graphite-400 print:text-graphite-600">
                {plantUrl(plant.slug).replace(/^https?:\/\//, "")}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
