import type { MetadataRoute } from "next";

import { getAllPlants } from "@/lib/plants";
import { nav, SITE_URL } from "@/lib/site";

/**
 * Карта сайта: разделы из общего меню плюс паспорт каждого вида.
 *
 * Список разделов берётся из `nav`, а не дублируется здесь, — иначе новый
 * модуль появлялся бы в шапке и молча выпадал из карты сайта.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const sections = ["/", ...nav.map((item) => item.href)].map((href) => ({
    url: `${SITE_URL}${href === "/" ? "" : href}`,
    changeFrequency: "monthly" as const,
    priority: href === "/" ? 1 : 0.8,
  }));

  const passports = getAllPlants().map((plant) => ({
    url: `${SITE_URL}/plant/${plant.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...sections, ...passports];
}
