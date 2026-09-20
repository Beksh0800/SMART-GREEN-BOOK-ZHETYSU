import type { ReactNode } from "react";

import { endemicLabels, iucnLabels, redBookLabels } from "@/lib/labels";
import type { EndemicType, IucnCategory, RedBookCategory } from "@/lib/schema";

type BadgeProps = {
  children: ReactNode;
  /** Цвет рамки и текста — токен из палитры, не произвольный цвет */
  tone?: string;
  title?: string;
};

/**
 * Бейдж научной нотации: тонкая рамка, лёгкая заливка, радиус 4px.
 * Никаких «пилюль» и цветных теней.
 */
export function Badge({ children, tone = "var(--color-graphite-600)", title }: BadgeProps) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 rounded-badge border px-2 py-0.5 text-2xs font-semibold tracking-wide uppercase"
      style={{
        color: tone,
        borderColor: `color-mix(in srgb, ${tone} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${tone} 8%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

export function RedBookBadge({ category }: { category: RedBookCategory }) {
  const { short, full, token } = redBookLabels[category];
  return (
    <Badge tone={token} title={`ҚР Қызыл кітабы — ${full}`}>
      <span
        aria-hidden
        className="block size-1.5 rounded-full"
        style={{ backgroundColor: token }}
      />
      Қызыл кітап · {short}
    </Badge>
  );
}

export function EndemicBadge({ type }: { type: EndemicType }) {
  return (
    <Badge tone="var(--color-forest-700)" title="Тек осы аймаққа тән түр">
      {endemicLabels[type]}
    </Badge>
  );
}

export function IucnBadge({ category }: { category: IucnCategory }) {
  return (
    <Badge tone="var(--color-ochre-700)" title={`IUCN Red List — ${iucnLabels[category]}`}>
      IUCN · {category}
    </Badge>
  );
}

export function IndicatorBadge() {
  return (
    <Badge tone="var(--color-sage-600)" title="Экологиялық жағдайдың индикаторы">
      Биоиндикатор
    </Badge>
  );
}
