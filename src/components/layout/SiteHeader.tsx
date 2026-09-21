"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { nav } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-[500] border-b border-line bg-paper/92 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex h-16 max-w-[84rem] items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="font-display text-base font-bold tracking-tight text-forest-800">
            Zhetysu GreenMap
          </span>
          <span className="hidden text-2xs tracking-wide text-graphite-400 uppercase sm:block">
            Smart Green Book
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-badge px-3 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-sage-100 font-semibold text-forest-800"
                  : "text-graphite-600 hover:bg-paper-dim hover:text-forest-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Мәзірді жабу" : "Мәзірді ашу"}
          className="rounded-badge border border-line p-2 text-graphite-600 transition-colors hover:bg-paper-dim md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-paper px-6 py-3 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`flex items-baseline justify-between border-b border-line py-3 text-base last:border-0 ${
                isActive(item.href) ? "font-semibold text-forest-800" : "text-graphite-600"
              }`}
            >
              {item.label}
              <span className="text-2xs tracking-wide text-graphite-400 uppercase">{item.en}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
