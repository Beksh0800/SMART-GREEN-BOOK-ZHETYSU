import Image from "next/image";

import { plantUrl } from "@/lib/site";

/**
 * QR-код страницы вида. SVG берётся из public/qr — он сгенерирован
 * офлайн-скриптом `npm run qr` и лежит в репозитории.
 */
export function QrBlock({ slug, name }: { slug: string; name: string }) {
  const url = plantUrl(slug);

  return (
    <div className="rounded-card border border-line bg-paper-bright p-5">
      <p className="eyebrow">QR-паспорт</p>
      <div className="mt-4 flex items-start gap-5">
        <Image
          src={`/qr/${slug}.svg`}
          alt={`${name} — QR-код`}
          width={120}
          height={120}
          className="size-[120px] shrink-0 border border-line bg-white p-1.5"
          unoptimized
        />
        <div className="min-w-0">
          <p className="text-sm text-graphite-600">
            Кодты сканерлеп, осы өсімдіктің цифрлық паспортын телефоннан ашуға болады.
          </p>
          <p className="mt-3 text-2xs break-all text-graphite-400">{url}</p>
        </div>
      </div>
    </div>
  );
}
