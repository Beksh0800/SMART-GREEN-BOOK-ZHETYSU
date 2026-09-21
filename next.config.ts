import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Service worker лежит в public/ и отдаётся как обычный статический
        // файл — с долгим кэшем браузер месяцами держал бы старую версию
        // и офлайн-кэш нельзя было бы обновить.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          {
            // Политика ограничивает сам worker, а он ходит за плиткой карты
            // на сервер OSM: без явного разрешения запрос падает и подложка
            // подменяется заглушкой — и офлайн, и при живом интернете.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "connect-src 'self' https://tile.openstreetmap.org",
              "img-src 'self' data: https://tile.openstreetmap.org",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
