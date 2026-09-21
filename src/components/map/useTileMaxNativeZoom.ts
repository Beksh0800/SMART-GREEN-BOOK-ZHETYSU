"use client";

import { useSyncExternalStore } from "react";

import { OFFLINE_MAX_ZOOM } from "@/lib/tiles";

const subscribeOnline = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

/**
 * Предел «родного» зума подложки для текущего состояния сети.
 *
 * Без сети плитки есть только до OFFLINE_MAX_ZOOM — дальше их никто не качал.
 * maxNativeZoom заставляет Leaflet растягивать последний сохранённый зум
 * вместо запроса отсутствующих плиток: подложка размывается, но карта
 * остаётся картой. Онлайн ограничение снимается, иначе приближение всегда
 * было бы мыльным.
 *
 * Хук общий для обзорной карты и мини-карты в паспорте вида: офлайн должен
 * вести себя одинаково везде, где есть подложка.
 */
export function useTileMaxNativeZoom(): number | undefined {
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  return online ? undefined : OFFLINE_MAX_ZOOM;
}
