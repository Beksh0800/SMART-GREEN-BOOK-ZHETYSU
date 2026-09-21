"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { PlantPlaceholder } from "@/components/plant/PlantPlaceholder";
import { EndemicBadge, RedBookBadge } from "@/components/ui/Badge";
import {
  answeredCount,
  criterionLabels,
  emptyAnswers,
  identify,
  mostUsefulNext,
  splitMatches,
  type IdentifyAnswers,
  type IdentifyMatch,
} from "@/lib/identify";
import {
  flowerColorLabels,
  habitatLabels,
  heightSteps,
  lifeFormLabels,
  monthLabels,
} from "@/lib/labels";
import { FLOWER_COLORS, HABITAT_TYPES, LIFE_FORMS, type Plant } from "@/lib/schema";

/**
 * Модуль «Анықтағыш».
 *
 * Выдача пересчитывается на каждом ответе и лежит рядом с вопросами, а не за
 * кнопкой «Показать результат»: так видно, как ответ сужает круг видов, —
 * это и есть содержание определения, ради него модуль и нужен.
 */

function Option({
  active,
  onClick,
  label,
  hint,
  swatch,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-badge border px-3 py-2 text-left text-xs transition-colors ${
        active
          ? "border-forest-700 bg-forest-700 font-semibold text-paper-bright"
          : "border-line bg-paper-bright text-graphite-600 hover:border-line-strong hover:bg-paper-dim"
      }`}
    >
      {swatch && (
        <span
          aria-hidden
          className="block size-3.5 shrink-0 rounded-full border border-line-strong"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span>
        {label}
        {hint && (
          <span className={`block text-2xs ${active ? "text-paper/70" : "text-graphite-400"}`}>
            {hint}
          </span>
        )}
      </span>
    </button>
  );
}

function Question({
  step,
  title,
  hint,
  answered,
  suggested,
  onClear,
  children,
}: {
  step: number;
  title: string;
  hint: string;
  answered: boolean;
  suggested: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">
          {String(step).padStart(2, "0")} · {title}
        </p>
        {answered ? (
          <button
            type="button"
            onClick={onClear}
            className="text-2xs text-graphite-400 underline-offset-2 hover:text-ochre-700 hover:underline"
          >
            тазалау
          </button>
        ) : (
          suggested && (
            <span className="text-2xs font-semibold text-ochre-700">келесі сұрақ</span>
          )
        )}
      </div>
      <p className="mt-1 text-xs text-graphite-400">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{children}</div>
    </section>
  );
}

/** Строка выдачи: снимок, название, статус и то, какой признак не сошёлся. */
function MatchRow({ match }: { match: IdentifyMatch }) {
  const { plant, missed } = match;

  return (
    <li>
      <Link
        href={`/plant/${plant.slug}`}
        className="group flex gap-4 rounded-card border border-line bg-paper-bright p-3 transition-colors hover:border-line-strong hover:bg-paper-dim"
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-badge border border-line">
          {plant.photo ? (
            <Image
              src={`/images/plants/${plant.photo.file}`}
              alt={plant.name.kk}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <PlantPlaceholder slug={plant.slug} className="h-full w-full" label="" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base leading-tight font-semibold text-forest-900">
              {plant.name.kk}
            </h3>
            {plant.status.redBookKz && <RedBookBadge category={plant.status.redBookKz} />}
            {!plant.status.redBookKz && plant.status.endemic && (
              <EndemicBadge type={plant.status.endemic} />
            )}
          </div>
          <p className="latin mt-0.5 text-sm text-graphite-600">{plant.name.la}</p>
          <p className="mt-1.5 line-clamp-2 text-xs text-graphite-600">
            {plant.description.summary}
          </p>

          {missed.length > 0 && (
            <p className="mt-2 text-2xs text-ochre-700">
              Сәйкес келмейді: {missed.map((c) => criterionLabels[c]).join(", ")}
            </p>
          )}
        </div>

        <ArrowRight
          size={16}
          aria-hidden
          className="mt-1 shrink-0 text-graphite-400 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

export function IdentifyWizard({ plants }: { plants: Plant[] }) {
  const [answers, setAnswers] = useState<IdentifyAnswers>(emptyAnswers);

  const matches = useMemo(() => identify(plants, answers), [plants, answers]);
  const { exact, partial } = useMemo(() => splitMatches(matches), [matches]);
  const suggestion = useMemo(() => mostUsefulNext(matches, answers), [matches, answers]);

  const asked = answeredCount(answers);
  const set = (patch: Partial<IdentifyAnswers>) => setAnswers({ ...answers, ...patch });

  /** Повторный клик по выбранному ответу снимает его — отдельной кнопки «назад» не нужно. */
  const pick = <K extends keyof IdentifyAnswers>(key: K, value: IdentifyAnswers[K]) =>
    set({ [key]: answers[key] === value ? null : value } as Partial<IdentifyAnswers>);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-14">
      {/* Вопросы */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-graphite-600">
            Жауап берілген белгі: <strong className="text-forest-800">{asked}</strong> / 5
          </p>
          {asked > 0 && (
            <button
              type="button"
              onClick={() => setAnswers(emptyAnswers)}
              className="inline-flex items-center gap-1.5 text-xs text-graphite-600 transition-colors hover:text-ochre-700"
            >
              <RotateCcw size={13} aria-hidden />
              Қайтадан бастау
            </button>
          )}
        </div>

        <Question
          step={1}
          title="Тіршілік формасы"
          hint="Өсімдіктің жалпы пішіні — алыстан көрінетін белгі"
          answered={answers.lifeForm !== null}
          suggested={suggestion === "lifeForm"}
          onClear={() => set({ lifeForm: null })}
        >
          {LIFE_FORMS.map((form) => (
            <Option
              key={form}
              active={answers.lifeForm === form}
              onClick={() => pick("lifeForm", form)}
              label={lifeFormLabels[form].label}
              hint={lifeFormLabels[form].hint}
            />
          ))}
        </Question>

        <Question
          step={2}
          title="Қай жерде кездестірдіңіз"
          hint="Айналадағы жер бедері мен өсімдік жамылғысы"
          answered={answers.habitat !== null}
          suggested={suggestion === "habitat"}
          onClear={() => set({ habitat: null })}
        >
          {HABITAT_TYPES.map((h) => (
            <Option
              key={h}
              active={answers.habitat === h}
              onClick={() => pick("habitat", h)}
              label={habitatLabels[h]}
            />
          ))}
        </Question>

        <Question
          step={3}
          title="Гүлінің түсі"
          hint="Гүлі болмаса, бұл сұрақты өткізіп жіберіңіз"
          answered={answers.flowerColor !== null}
          suggested={suggestion === "flowerColor"}
          onClear={() => set({ flowerColor: null })}
        >
          {FLOWER_COLORS.map((c) => (
            <Option
              key={c}
              active={answers.flowerColor === c}
              onClick={() => pick("flowerColor", c)}
              label={flowerColorLabels[c].label}
              swatch={flowerColorLabels[c].swatch}
            />
          ))}
        </Question>

        <Question
          step={4}
          title="Биіктігі"
          hint="Өз бойыңызбен шамалап салыстырыңыз"
          answered={answers.height !== null}
          suggested={suggestion === "height"}
          onClear={() => set({ height: null })}
        >
          {heightSteps.map((s) => (
            <Option
              key={s.id}
              active={answers.height === s.id}
              onClick={() => pick("height", s.id)}
              label={s.label}
              hint={s.hint}
            />
          ))}
        </Question>

        <Question
          step={5}
          title="Гүлдеген айы"
          hint="Өсімдікті гүлдеп тұрған кезде көрген болсаңыз"
          answered={answers.month !== null}
          suggested={suggestion === "month"}
          onClear={() => set({ month: null })}
        >
          {monthLabels.map((m, i) => (
            <Option
              key={m.full}
              active={answers.month === i + 1}
              onClick={() => pick("month", i + 1)}
              label={m.short}
            />
          ))}
        </Question>
      </div>

      {/* Выдача */}
      <div>
        {asked === 0 ? (
          <div className="rounded-card border border-dashed border-line-strong bg-paper-bright p-10 text-center">
            <p className="font-display text-lg text-forest-900">
              Кем дегенде бір белгіні таңдаңыз
            </p>
            <p className="mx-auto mt-2 max-w-measure text-sm text-graphite-600">
              Анықтағыш базадағы 50 түрді таңдалған белгілер бойынша сұрыптайды. Барлық сұраққа
              жауап беру міндетті емес — екі-үш белгінің өзі көп жағдайда жеткілікті.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
              <p className="font-display text-lg text-forest-900">
                {exact.length > 0
                  ? `Толық сәйкес келетін түр: ${exact.length}`
                  : "Толық сәйкес келетін түр табылмады"}
              </p>
              <p className="text-xs text-graphite-400">
                {partial.length > 0 && `Бір белгісі бойынша жақын: ${partial.length}`}
              </p>
            </div>

            {exact.length > 0 && (
              <ul className="mt-5 grid gap-3">
                {exact.map((m) => (
                  <MatchRow key={m.plant.slug} match={m} />
                ))}
              </ul>
            )}

            {partial.length > 0 && (
              <>
                <p className="eyebrow mt-10">Жақын нұсқалар</p>
                <p className="mt-1 max-w-measure text-xs text-graphite-600">
                  Бұл түрлер бір белгі бойынша ғана ерекшеленеді. Далада қателесу оңай, сондықтан
                  олар тізімнен алынып тасталмайды — қай белгі сәйкес келмегені әр жолда
                  көрсетілген.
                </p>
                <ul className="mt-4 grid gap-3">
                  {partial.map((m) => (
                    <MatchRow key={m.plant.slug} match={m} />
                  ))}
                </ul>
              </>
            )}

            {matches.length === 0 && (
              <div className="mt-5 rounded-card border border-dashed border-line-strong bg-paper-bright p-8 text-center">
                <p className="text-sm text-graphite-600">
                  Бұл белгілер тіркесімі базадағы бірде-бір түрге сәйкес келмеді. Бір белгіні алып
                  тастап көріңіз — мүмкін, түрі базада әлі жоқ шығар.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
