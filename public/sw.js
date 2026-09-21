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
 *   плитка карты   — не кэшируется: это чужой сервер и тысячи файлов.
 */

const VERSION = "v1";
const SHELL_CACHE = `greenmap-shell-${VERSION}`;
const RUNTIME_CACHE = `greenmap-runtime-${VERSION}`;

/** Разделы, без которых сайт офлайн бесполезен. Кэшируются при установке. */
const SHELL = ["/", "/map", "/identify", "/red-book", "/bioindicator", "/qr", "/about"];

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
          .filter((key) => key.startsWith("greenmap-") && !key.endsWith(VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isMapTile(url) {
  return url.hostname.endsWith("tile.openstreetmap.org");
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
  if (isMapTile(url)) return;
  if (url.origin !== self.location.origin) return;

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
  const cache = await caches.open(RUNTIME_CACHE);
  let done = 0;

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "reload" });
      if (response.ok) await cache.put(url, response.clone());
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
