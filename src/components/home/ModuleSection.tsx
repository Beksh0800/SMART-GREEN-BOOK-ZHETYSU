import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";

/**
 * Разворот одного модуля на главной: текст слева, живое превью справа
 * (или наоборот). Превью — настоящие компоненты сайта с настоящими данными,
 * а не картинки-скриншоты.
 */
export function ModuleSection({
  index,
  eyebrow,
  title,
  description,
  points,
  href,
  cta,
  preview,
  flip = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  href: string;
  cta: string;
  preview: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="border-t border-line py-16 md:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={flip ? "lg:order-2" : undefined}>
          <div className="flex items-center gap-4">
            <span className="font-display text-3xl leading-none text-ochre-500">{index}</span>
            <span aria-hidden className="block h-px flex-1 bg-line-strong" />
            <span className="eyebrow">{eyebrow}</span>
          </div>
          <h2 className="mt-6 text-2xl text-forest-900">{title}</h2>
          <p className="mt-4 max-w-measure text-base text-graphite-600">{description}</p>

          <ul className="mt-6 space-y-2.5">
            {points.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-graphite-600">
                <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-sage-500" />
                {point}
              </li>
            ))}
          </ul>

          <Link
            href={href}
            className="mt-8 inline-flex items-center gap-2 border-b border-forest-700 pb-1 text-sm font-semibold text-forest-800 transition-colors hover:border-ochre-500 hover:text-ochre-700"
          >
            {cta}
            <ArrowRight size={15} />
          </Link>
        </Reveal>

        <Reveal delay={0.12} className={flip ? "lg:order-1" : undefined}>
          {preview}
        </Reveal>
      </div>
    </section>
  );
}
