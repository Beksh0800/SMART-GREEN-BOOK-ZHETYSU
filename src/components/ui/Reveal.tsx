import type { ReactNode } from "react";

/**
 * Появление блока при прокрутке.
 *
 * Реализовано на CSS scroll-timeline, а не на JS-наблюдателе: содержимое
 * не должно зависеть от скрипта, иначе оно исчезает при печати и у всех,
 * у кого наблюдатель не отработал. Там, где `animation-timeline` не
 * поддерживается (Safari, Firefox), блок просто виден сразу.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Небольшая задержка, чтобы соседние блоки появлялись друг за другом */
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`reveal ${className}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
