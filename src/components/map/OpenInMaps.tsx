"use client";

import { Navigation } from "lucide-react";
import { useSyncExternalStore } from "react";

/**
 * Кнопка «открыть точку в навигаторе».
 *
 * Зачем отдельно от карты в паспорте: та показывает, где вид растёт, но
 * довести до места не может — маршрутов и GPS у нас нет и не будет.
 * Нативное приложение это умеет, а у человека в поле оно уже установлено
 * и, как правило, с загруженным регионом.
 *
 * Схема `geo:` — стандарт Android, её понимают Google Maps, 2ГИС и Яндекс,
 * поэтому система сама предлагает выбор. Safari `geo:` не открывает, для
 * него подставляется схема Apple Maps.
 */

/** Платформа за время жизни страницы не меняется — подписка пустая. */
const noSubscribe = () => () => {};

export function OpenInMaps({ lat, lon, label }: { lat: number; lon: number; label: string }) {
  const coords = `${lat},${lon}`;

  /**
   * На сервере платформа неизвестна, поэтому серверный снимок — «не iOS»:
   * в HTML уходит общая схема geo:, а на айфоне React сразу после гидратации
   * подменяет её на схему Apple Maps.
   */
  const apple = useSyncExternalStore(
    noSubscribe,
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    () => false,
  );

  const href = apple
    ? `maps://?ll=${coords}&q=${encodeURIComponent(label)}`
    : `geo:${coords}?q=${coords}(${encodeURIComponent(label)})`;

  return (
    <a
      href={href}
      className="mt-1.5 inline-flex items-center gap-1.5 rounded-badge border border-line px-2.5 py-1 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-400 hover:text-forest-700"
    >
      <Navigation size={11} aria-hidden />
      Навигаторда ашу
    </a>
  );
}
