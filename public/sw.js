/**
 * Service worker проекта Zhetysu GreenMap.
 *
 * Зачем: виды из этой базы растут там, где связи нет. Человек сканирует QR
 * на стенде или в поле — и страница должна открыться из кэша, а не показать
 * «нет соединения». То же для жюри: показ не должен зависеть от wi-fi в зале.
 *
 * Написан вручную, без workbox: логика здесь на сотню строк, а лишняя
 * зависимость в сборке дороже, чем эти сто строк.
 *
 * Стратегии:
 *   HTML-страницы  — сеть вперёд, кэш как запасной вариант (данные свежие,
 *                    но офлайн страница всё равно открывается);
 *   статика и фото — кэш вперёд (эти файлы у Next неизменяемы по имени);
 *   плитка карты   — кэш вперёд, но только обзорные зумы по рамке Жетісу
 *                    (см. lib/tiles.ts). Глубокие зумы офлайн подменяются
 *                    заглушкой: пустая подложка лучше битых картинок.
 */

const VERSION = "v2";
const SHELL_CACHE = `greenmap-shell-${VERSION}`;
const RUNTIME_CACHE = `greenmap-runtime-${VERSION}`;
/**
 * Плитки лежат отдельно от остального: их сотни, они с чужого домена
 * и переживают смену версии кэша — перекачивать 6 МБ подложки из-за
 * правки вёрстки незачем.
 */
const TILE_CACHE = "greenmap-tiles";

/** Дальше этого зума подложка офлайн не сохраняется. Синхронно с lib/tiles.ts. */
const TILE_MAX_ZOOM = 9;

/** Разделы, без которых сайт офлайн бесполезен. Кэшируются при установке. */
const SHELL = [
  "/",
  "/map",
  "/plants",
  "/identify",
  "/red-book",
  "/bioindicator",
  "/qr",
  "/about",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Каждый адрес добавляется отдельно: один недоступный раздел
      // не должен срывать установку целиком, как это делает addAll.
      await Promise.all(
        SHELL.map((url) => cache.add(url).catch(() => undefined)),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          // TILE_CACHE версии не имеет и чистке не подлежит.
          .filter(
            (key) =>
              key.startsWith("greenmap-") && key !== TILE_CACHE && !key.endsWith(VERSION),
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isMapTile(url) {
  return url.hostname.endsWith("tile.openstreetmap.org");
}

/** Зум плитки — первое число в пути вида /{z}/{x}/{y}.png. */
function tileZoom(url) {
  const zoom = Number(url.pathname.split("/")[1]);
  return Number.isFinite(zoom) ? zoom : null;
}

/**
 * Заглушка вместо плитки, которой нет в кэше и негде взять.
 * Leaflet рисует тайлы обычными <img>, поэтому SVG подходит: сетка
 * читается как «здесь карта, но подложка не загружена», и это лучше,
 * чем иконки битых изображений по всему экрану.
 */
function tilePlaceholder() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">' +
    '<rect width="256" height="256" fill="#efece4"/>' +
    '<path d="M0 128h256M128 0v256" stroke="#e2ddd1" stroke-width="1"/>' +
    '</svg>';
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}

/**
 * Плитка: сначала кэш, затем сеть. Сохраняются только обзорные зумы —
 * иначе прогулка по карте на максимальном приближении незаметно набьёт
 * в память сотни мегабайт чужой подложки.
 */
async function tileStrategy(request, url) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && (tileZoom(url) ?? 99) <= TILE_MAX_ZOOM) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return tilePlaceholder();
  }
}

/**
 * Оптимизатор картинок Next. Компонент <Image> никогда не просит файл
 * напрямую: он запрашивает /_next/image?url=...&w=...&q=..., подбирая
 * ширину под экран. Поэтому сохранённый оригинал сам по себе офлайн
 * не показывается — нужна подмена, см. imageStrategy.
 */
function isOptimizedImage(url) {
  return url.pathname === "/_next/image";
}

async function imageStrategy(request, url) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Сети нет и этот размер не просили раньше — отдаём оригинал,
    // сохранённый кнопкой офлайн-режима. Он тяжелее подобранного
    // по экрану, но лежит в памяти и выглядит точно так же.
    const original = url.searchParams.get("url");
    const fallback = original ? await caches.match(original) : null;
    if (fallback) return fallback;
    throw error;
  }
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/qr/") ||
    url.pathname.startsWith("/icons/")
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Главная лежит в shell-кэше и объясняет, что делать без сети,
    // — лучше, чем системная страница браузера об ошибке.
    const fallback = await caches.match("/");
    if (fallback) return fallback;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (isMapTile(url)) {
    event.respondWith(tileStrategy(request, url));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (isOptimizedImage(url)) {
    event.respondWith(imageStrategy(request, url));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request));
  }
});

/**
 * Явная загрузка всей базы в кэш — по кнопке «Далаға дайындау».
 * Сознательно не делается автоматически при установке: это несколько
 * мегабайт, и решение тратить мобильный трафик принимает человек,
 * а не сайт за него. О ходе загрузки сообщаем странице сообщениями.
 */
async function precacheAll(urls, client) {
  const runtime = await caches.open(RUNTIME_CACHE);
  const tiles = await caches.open(TILE_CACHE);
  let done = 0;

  for (const url of urls) {
    try {
      const external = isMapTile(new URL(url, self.location.origin));
      // Плитку просим без no-cors: нужен читаемый ответ, а OSM отдаёт CORS.
      const response = await fetch(url, { cache: "reload" });
      if (response.ok) await (external ? tiles : runtime).put(url, response.clone());
    } catch {
      // Недоступный адрес пропускаем: остальная база всё равно сохранится.
    }
    done += 1;
    client?.postMessage({ type: "PRECACHE_PROGRESS", done, total: urls.length });
  }

  client?.postMessage({ type: "PRECACHE_DONE", total: urls.length });
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data?.type === "PRECACHE_ALL" && Array.isArray(data.urls)) {
    event.waitUntil(precacheAll(data.urls, event.source));
  }
});
