"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Счётчик, добегающий до значения в момент появления блока на экране.
 *
 * Начальное состояние — само число, а не ноль: если скрипт не отработал
 * (печать, отключённый JS, снимок страницы целиком), посетитель увидит
 * верное значение, а не «0». Обнуление происходит только в тот кадр,
 * когда блок действительно появился и анимация точно запускается.
 */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return <span ref={ref}>{shown}</span>;
}
