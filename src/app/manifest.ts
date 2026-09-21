import type { MetadataRoute } from "next";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/**
 * Манифест приложения: сайт ставится на домашний экран и открывается
 * без адресной строки. Нужен не ради «мобильного приложения», а ради
 * полевой работы — там, где растут эти виды, сети обычно нет,
 * и страница, открытая по QR, должна подниматься из кэша.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description:
      "Жетісу өңірінің сирек кездесетін өсімдіктерінің картасы, QR-паспорттары және анықтағышы.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "kk",
    background_color: "#f7f5ef",
    theme_color: "#1b3a2f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
