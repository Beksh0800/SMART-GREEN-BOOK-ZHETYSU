"use client";

import { Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { monthLabels } from "@/lib/labels";
import type { Plant } from "@/lib/schema";

/**
 * Шкала фенологии над картой: выбор месяца оставляет на карте только виды,
 * цветущие в это время.
 *
 * Высота столбика — сколько видов базы цветёт в этом месяце. Так шкала
 * работает и как фильтр, и как график: видно, что в апреле-мае цветёт
 * почти половина базы, а к августу остаются полынь и галофиты.
 */

const CYCLE_MS = 900;

export function BloomTimeline({
  plants,
  month,
  onChange,
}: {
  plants: Plant[];
  month: number | null;
  onChange: (month: number | null) => void;
}) {
  const [playing, setPlaying] = useState(false);
  // onChange меняется на каждом рендере родителя; держим его в ref,
  // чтобы пересоздание обработчика не перезапускало таймер.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const counts = monthLabels.map(
    (_, i) => plants.filter((p) => p.traits.bloomMonths.includes(i + 1)).length,
  );
  const peak = Math.max(...counts, 1);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      onChangeRef.current(month === null || month === 12 ? 1 : month + 1);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [playing, month]);

  /** Проигрывание — только по явному нажатию: непрошеная анимация на карте мешает читать. */
  const togglePlay = () => {
    if (!playing && month === null) onChange(1);
    setPlaying((v) => !v);
  };

  return (
    <div className="rounded-card border border-line bg-paper/95 p-3 shadow-raised backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Гүлдеу маусымы</p>
        <div className="flex items-center gap-1.5">
          {month !== null && (
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                onChange(null);
              }}
              className="inline-flex items-center gap-1 rounded-badge px-1.5 py-1 text-2xs text-graphite-600 transition-colors hover:text-ochre-700"
            >
              <X size={12} aria-hidden />
              Жыл бойы
            </button>
          )}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Тоқтату" : "Жыл бойы айналдыру"}
            aria-pressed={playing}
            className="inline-flex size-7 items-center justify-center rounded-badge border border-line bg-paper-bright text-forest-800 transition-colors hover:border-forest-400 hover:bg-sage-100"
          >
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex items-end gap-[3px]">
        {monthLabels.map((m, i) => {
          const value = i + 1;
          const active = month === value;
          return (
            <button
              key={m.full}
              type="button"
              onClick={() => {
                setPlaying(false);
                onChange(active ? null : value);
              }}
              aria-pressed={active}
              title={`${m.full} — ${counts[i]} түр гүлдейді`}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              <span
                aria-hidden
                className={`w-full rounded-t-[2px] transition-colors ${
                  active ? "bg-ochre-600" : "bg-sage-300 group-hover:bg-sage-500"
                }`}
                /* Минимум 3px: месяц без цветения должен остаться кликабельным
                   и читаться как «ноль», а не как пропуск в шкале. */
                style={{ height: `${Math.max((counts[i] / peak) * 34, 3)}px` }}
              />
              <span
                className={`text-2xs ${
                  active ? "font-semibold text-ochre-700" : "text-graphite-400"
                }`}
              >
                {m.short}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 border-t border-line pt-2 text-2xs text-graphite-400">
        {month === null
          ? "Ай таңдаңыз — картада сол кезде гүлдейтін түрлер қалады"
          : `${monthLabels[month - 1].full}: ${counts[month - 1]} түр гүлдейді`}
      </p>
    </div>
  );
}
