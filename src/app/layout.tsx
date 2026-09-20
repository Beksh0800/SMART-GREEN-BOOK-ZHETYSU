import type { Metadata } from "next";
import { Inter, Spectral } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

import "./globals.css";

/**
 * Заголовки — Spectral (антиква), текст — Inter.
 *
 * Оба берутся с подмножеством cyrillic-ext: там лежат казахские литеры
 * ә, ғ, қ, ң, ө, ұ, ү, һ, і. Это не формальность — Manrope, стоявший здесь
 * раньше, их не содержит, и браузер подставлял системный шрифт прямо
 * внутри слова («өңірінің» набиралось двумя разными гарнитурами).
 */
const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Жетісу өңірінің сирек кездесетін, эндемик және индикатор өсімдіктерінің интерактивті картасы, цифрлық паспорттары және QR-кодтары.",
  openGraph: {
    type: "website",
    locale: "kk_KZ",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Жетісу өңірінің сирек кездесетін өсімдіктерінің цифрлық ботаникалық картасы: PlantMap, QR-паспорт, биоиндикация және Қызыл кітап базасы.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className={`${inter.variable} ${spectral.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
