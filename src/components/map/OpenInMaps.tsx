"use client";

import { ExternalLink, Navigation } from "lucide-react";
import { useSyncExternalStore } from "react";

/**
 * Кнопка «открыть точку в картах».
 *
 * Зачем отдельно от карты в паспорте: та показывает, где вид растёт, но
 * довести до места не может — маршрутов и GPS у нас нет и не будет.
 *
 * Куда ведёт, зависит от устройства, потому что единой ссылки не существует:
 *   Android — схема `geo:`, её понимают Google Maps, 2ГИС и Яндекс, поэтому
 *             систему просят показать выбор установленных приложений;
 *   iOS     — Safari `geo:` игнорирует молча, нужна схема Apple Maps;
 *   десктоп — обе схемы там бесполезны, открывается веб-карта в новой вкладке.
 */

type Platform = "ios" | "android" | "web";

/** Платформа за время жизни страницы не меняется — подписка пустая. */
const noSubscribe = () => () => {};

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS с версии 13 представляется Macintosh, и отличить планшет от
  // настольного компьютера можно только по наличию сенсорного ввода.
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/.test(ua) || iPadOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "web";
}

export function OpenInMaps({ lat, lon, label }: { lat: number; lon: number; label: string }) {
  const coords = `${lat},${lon}`;

  /**
   * Серверный снимок — «десктоп»: это единственный вариант, который работает
   * везде, поэтому в HTML уходит безопасная веб-ссылка, а на телефоне React
   * сразу после гидратации подменяет её нативной схемой.
   */
  const platform = useSyncExternalStore(noSubscribe, detectPlatform, (): Platform => "web");

  const href =
    platform === "ios"
      ? `maps://?ll=${coords}&q=${encodeURIComponent(label)}`
      : platform === "android"
        ? `geo:${coords}?q=${coords}(${encodeURIComponent(label)})`
        : `https://www.google.com/maps/search/?api=1&query=${coords}`;

  const web = platform === "web";

  return (
    <a
      href={href}
      // Нативную схему открывает система, и новая вкладка ей только мешает:
      // на телефоне остался бы пустой таб поверх паспорта вида.
      target={web ? "_blank" : undefined}
      rel={web ? "noreferrer noopener" : undefined}
      className="mt-1.5 inline-flex items-center gap-1.5 rounded-badge border border-line px-2.5 py-1 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-400 hover:text-forest-700"
    >
      <Navigation size={11} aria-hidden />
      {web ? "Картада ашу" : "Навигаторда ашу"}
      {web && <ExternalLink size={10} aria-hidden />}
    </a>
  );
}
