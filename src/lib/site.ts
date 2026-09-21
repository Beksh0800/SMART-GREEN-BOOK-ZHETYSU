/**
 * Базовый адрес сайта. Нужен для QR-кодов и OG-превью:
 * QR генерируются офлайн-скриптом, поэтому адрес должен быть
 * одинаковым и в скрипте, и в рантайме.
 *
 * На Vercel NEXT_PUBLIC_SITE_URL задаётся в настройках проекта,
 * локально подхватывается значение по умолчанию.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://smart-green-book-zhetysu.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Zhetysu GreenMap";
export const SITE_TAGLINE = "Жетісу өңірінің цифрлық ботаникалық картасы";

export function plantUrl(slug: string): string {
  return `${SITE_URL}/plant/${slug}`;
}

export const nav = [
  { href: "/map", label: "Карта", en: "PlantMap" },
  { href: "/identify", label: "Анықтағыш", en: "Identification key" },
  { href: "/red-book", label: "Қызыл кітап", en: "Red & Endemic Book" },
  { href: "/bioindicator", label: "Биоиндикация", en: "BioIndicator" },
  { href: "/qr", label: "QR-кодтар", en: "QR Passport" },
  { href: "/about", label: "Әдістеме", en: "About" },
] as const;
