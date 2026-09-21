"use client";

import { CheckCircle2, CloudDownload, WifiOff } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Регистрация service worker и явная загрузка базы в офлайн-кэш.
 *
 * Регистрация происходит на любой странице, где стоит компонент; загрузка —
 * только по кнопке. Кнопка живёт на странице QR-кодов, потому что офлайн
 * нужен ровно в том сценарии, ради которого сделаны сами коды: человек в поле
 * или у стенда сканирует код, а сети нет.
 */

type State = "idle" | "working" | "done" | "unsupported";

/** Пустая подписка: поддержка service worker за время жизни страницы не меняется. */
const noSubscribe = () => () => {};

const subscribeOnline = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

export function OfflineMode({ urls }: { urls: string[] }) {
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);

  /**
   * Наличие service worker и состояние сети — свойства браузера, а не React.
   * На сервере их нет, поэтому серверный снимок говорит «не поддерживается»:
   * блок не попадает в HTML и появляется уже в браузере, без расхождения
   * разметки при гидратации.
   */
  const supported = useSyncExternalStore(
    noSubscribe,
    () => "serviceWorker" in navigator,
    () => false,
  );
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  useEffect(() => {
    if (!supported) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Регистрация падает на http и в приватных окнах — сайт при этом
      // работает как обычно, просто без офлайна. Ломать страницу незачем.
      setState("unsupported");
    });

    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "PRECACHE_PROGRESS") {
        setProgress(Math.round((data.done / data.total) * 100));
      }
      if (data?.type === "PRECACHE_DONE") {
        setProgress(100);
        setState("done");
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [supported]);

  const download = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) return;
    setState("working");
    setProgress(0);
    registration.active.postMessage({ type: "PRECACHE_ALL", urls });
  }, [urls]);

  if (!supported || state === "unsupported") return null;

  return (
    <div className="rounded-card border border-line bg-paper-bright p-5 print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-measure">
          <p className="eyebrow inline-flex items-center gap-2">
            <WifiOff size={13} aria-hidden />
            Далалық режим
          </p>
          <h2 className="mt-2 font-display text-base font-semibold text-forest-900">
            Барлық паспортты телефонға сақтау
          </h2>
          <p className="mt-2 text-sm text-graphite-600">
            Түрлер өсетін жерде байланыс жиі болмайды. Бір рет жүктеп алсаңыз, QR-кодтар
            интернетсіз де ашылады: {urls.length} бет пен сурет браузердің жадына сақталады.
          </p>
        </div>

        <div className="shrink-0">
          {state === "done" ? (
            <p className="inline-flex items-center gap-2 rounded-badge border border-forest-400 px-4 py-2.5 text-sm font-semibold text-forest-800">
              <CheckCircle2 size={15} aria-hidden />
              Офлайн дайын
            </p>
          ) : (
            <button
              type="button"
              onClick={download}
              disabled={state === "working" || !online}
              className="inline-flex items-center gap-2 rounded-badge bg-forest-800 px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CloudDownload size={15} aria-hidden />
              {state === "working" ? `Жүктелуде… ${progress}%` : "Офлайн жүктеу"}
            </button>
          )}
        </div>
      </div>

      {state === "working" && (
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-badge bg-paper-dim"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Офлайн жүктеу барысы"
        >
          <div
            className="h-full rounded-badge bg-forest-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {!online && state !== "done" && (
        <p className="mt-3 text-xs text-ochre-700">
          Қазір байланыс жоқ — жүктеу үшін интернетке қосылу қажет.
        </p>
      )}
    </div>
  );
}
