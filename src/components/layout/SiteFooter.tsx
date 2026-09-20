import Link from "next/link";

import { nav, SITE_TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-dim print:hidden">
      <div className="mx-auto grid max-w-[84rem] gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-base font-bold text-forest-800">Zhetysu GreenMap</p>
          <p className="mt-2 max-w-measure text-sm text-graphite-600">{SITE_TAGLINE}</p>
          <p className="mt-4 text-xs text-graphite-400">
            Өсімдік-индикаторлар негізіндегі оқу-зерттеу жобасы. Деректер ашық ғылыми дереккөздерден
            алынған, әр түрдің бетінде сілтемесі көрсетілген.
          </p>
        </div>

        <div>
          <p className="eyebrow">Бөлімдер</p>
          <ul className="mt-3 space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-graphite-600 transition-colors hover:text-forest-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Дереккөздер</p>
          <ul className="mt-3 space-y-2 text-sm text-graphite-600">
            <li>ҚР Қызыл кітабы, 2-том (2014)</li>
            <li>GBIF — ғаламдық биоалуантүрлілік деректері</li>
            <li>Plants of the World Online (Kew)</li>
            <li>IUCN Red List</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
