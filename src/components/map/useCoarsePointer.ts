"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: none)";

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

/**
 * Управление пальцем, а не курсором.
 *
 * Различать их нужно на карте: подсказка при наведении для сенсорного
 * экрана бессмысленна — наведения там не существует, а по тапу она только
 * перекрывает собой карточку вида. Попадание пальцем тоже требует большей
 * мишени, чем точка в пять пикселей.
 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
