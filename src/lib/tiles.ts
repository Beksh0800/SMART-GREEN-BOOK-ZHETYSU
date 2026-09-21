import { MAP_BOUNDS, TILE_URL } from "@/components/map/mapStyle";

/**
 * Максимальный зум, который сохраняется для офлайна.
 *
 * Каждый следующий зум в четыре раза тяжелее предыдущего: 6–9 по рамке
 * Жетісу — это 230 плиток (~6 МБ), а один только десятый добавил бы ещё
 * 648. Столько качать с бесплатных серверов OSM некорректно, да и трафик
 * человека не бесконечен. На масштабах крупнее карта офлайн показывает
 * растянутый девятый зум — подложка размытая, но она есть.
 */
export const OFFLINE_MAX_ZOOM = 9;
export const OFFLINE_MIN_ZOOM = 6;

/** Номер плитки по координате — стандартная схема Slippy Map. */
function tileIndex(lat: number, lon: number, zoom: number): [number, number] {
  const n = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * n);
  const rad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2) * n);
  return [x, y];
}

/**
 * Адреса плиток подложки, покрывающих Жетісу на офлайн-зумах.
 *
 * Список считается на клиенте и уходит в service worker: держать его
 * в самом worker'е нельзя — рамка региона живёт в mapStyle и меняется
 * вместе с картой.
 */
export function offlineTileUrls(): string[] {
  const [[south, west], [north, east]] = MAP_BOUNDS;
  const urls: string[] = [];

  for (let z = OFFLINE_MIN_ZOOM; z <= OFFLINE_MAX_ZOOM; z += 1) {
    const [minX, minY] = tileIndex(north, west, z);
    const [maxX, maxY] = tileIndex(south, east, z);

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        urls.push(
          TILE_URL.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y)),
        );
      }
    }
  }

  return urls;
}
