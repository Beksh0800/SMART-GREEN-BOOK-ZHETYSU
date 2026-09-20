/**
 * Пятибалльная шкала экологического показателя вида.
 * Подписи краёв обязательны: «3 балла» само по себе ничего не говорит.
 */
export function IndicatorScale({
  label,
  value,
  low,
  high,
}: {
  label: string;
  value: number;
  low: string;
  high: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-graphite-900">{label}</span>
        <span className="text-xs text-graphite-400">{value} / 5</span>
      </div>
      <div className="mt-2 flex gap-1" role="img" aria-label={`${label}: ${value} из 5`}>
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={`h-1.5 flex-1 rounded-badge ${
              step <= value ? "bg-forest-600" : "bg-line"
            }`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-2xs text-graphite-400">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
