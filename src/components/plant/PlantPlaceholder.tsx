/**
 * Заглушка вместо фотографии. Виды без свободной лицензии на фото
 * получают стилизованный ботанический силуэт на бумажном фоне —
 * карточка не должна выглядеть сломанной или «пустым серым прямоугольником».
 * Рисунок детерминированно варьируется по slug, чтобы сетка карточек не рябила одинаковыми.
 */
export function PlantPlaceholder({
  slug,
  className = "",
  label = "Фотосурет әзірге қолжетімді емес",
}: {
  slug: string;
  className?: string;
  label?: string;
}) {
  const variant = [...slug].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 3;
  const tilt = [-6, 0, 5][variant];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-paper-dim ${className}`}
      role="img"
      aria-label={label}
    >
      {/* Сетка гербарного листа */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <svg
        viewBox="0 0 120 160"
        aria-hidden
        className="relative h-3/5 w-auto text-sage-300"
        style={{ transform: `rotate(${tilt}deg)` }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {/* стебель */}
        <path d="M60 152V44" />
        {/* листья */}
        <path d="M60 120c-22-2-34-14-36-34 20 2 33 13 36 34Z" />
        <path d="M60 98c22-3 33-16 34-36-20 3-31 15-34 36Z" />
        <path d="M60 76c-18-2-28-12-30-28 17 2 27 11 30 28Z" />
        {/* соцветие */}
        <path d="M60 44c-9-4-14-12-14-22 0-9 5-16 14-19 9 3 14 10 14 19 0 10-5 18-14 22Z" />
        <path d="M60 3v41" />
        {variant === 1 && <path d="M46 26c9 5 19 5 28 0" />}
        {variant === 2 && <circle cx="60" cy="24" r="4" />}
      </svg>
      <span className="absolute bottom-3 left-0 right-0 text-center text-2xs text-graphite-400">
        {label}
      </span>
    </div>
  );
}
