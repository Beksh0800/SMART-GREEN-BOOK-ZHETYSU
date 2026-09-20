import type { Metadata } from "next";

import { precisionLabels, redBookLabels, scoreLabels } from "@/lib/labels";
import { getStats } from "@/lib/plants";
import { RED_BOOK_CATEGORIES } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Әдістеме және дереккөздер",
  description:
    "Zhetysu GreenMap жобасының деректер жинау әдістемесі, биоиндикация индексінің формуласы, координаттардың дәлдігі және пайдаланылған дереккөздер.",
};

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-10 first:border-t-0 first:pt-0">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 font-display text-xl text-forest-900">{title}</h2>
      <div className="mt-4 max-w-measure space-y-4 text-base text-graphite-600">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  const stats = getStats();

  return (
    <div className="mx-auto max-w-[84rem] px-6 py-12">
      <header className="pb-10">
        <p className="eyebrow">Әдістеме</p>
        <h1 className="mt-3 text-3xl text-forest-900">Деректер қалай жиналды және есептелді</h1>
        <p className="mt-4 max-w-measure text-lg text-graphite-600">
          Жобаның барлық сандары мен нүктелерін қайта тексеруге болады: әр түрдің дереккөзі
          көрсетілген, индекс формуласы ашық, координаттардың дәлдік деңгейі бөлек белгіленген.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <Section title="Жоба туралы" eyebrow="Smart Green Book — Zhetysu">
            <p>
              Zhetysu GreenMap — Жетісу өңірінің сирек кездесетін, эндемик және индикатор
              өсімдіктерінің цифрлық базасы. Жоба төрт модульден тұрады: интерактивті карта
              (PlantMap), әр түрдің QR-паспорты, өсімдік-индикаторлар арқылы аймақтарды салыстыру
              (BioIndicator) және Қызыл кітап пен эндемиктердің жеке базасы.
            </p>
            <p>
              Деректер статикалық түрде жобаның репозиторийінде сақталады: сайт сыртқы серверге
              тәуелді емес, сондықтан көрсетілім кезінде дерекқордың қолжетімсіздігі сияқты тәуекел
              жоқ.
            </p>
          </Section>

          <Section title="Түрлерді іріктеу">
            <p>
              Негізгі тізім «Қазақстан Республикасының Қызыл кітабы» (2-том, өсімдіктер) басылымынан
              Жетісу өңірінде кездесетін түрлер бойынша алынды. Тізім эндемиктермен және аймақтың
              экологиялық жағдайын көрсететін индикатор түрлермен толықтырылды — соңғылары
              BioIndicator модулінің негізін құрайды.
            </p>
            <p>
              Әр түр үшін дереккөз көрсетілген; расталмаған мәлімет базаға енгізілмейді.
            </p>
          </Section>

          <Section title="Координаттардың дәлдігі">
            <p>
              Нүктенің дәлдігі — жобаның маңызды өрісі. Әр орналасу үш деңгейдің бірімен белгіленеді
              және картада әртүрлі көрсетіледі:
            </p>
            <ul className="space-y-2">
              {Object.entries(precisionLabels).map(([key, value]) => (
                <li key={key} className="flex gap-3">
                  <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-sage-500" />
                  <span>
                    <strong className="font-semibold text-graphite-900">{value.label}</strong> —{" "}
                    {value.hint}.
                  </span>
                </li>
              ))}
            </ul>
            <p>
              Дәл координаты жоқ нүктелер картада үзік сызықты шеңбермен беріледі: бұл нақты табылу
              орны емес, аймақ шегі екенін білдіреді. Қазіргі базада {stats.locations} нүктенің{" "}
              {stats.exactLocations} нақты координатпен расталған.
            </p>
          </Section>

          <Section title="Биоиндикация индексі" eyebrow="Формула">
            <p>
              Әр индикатор түрге бес көрсеткіш бойынша балл берілген:{" "}
              {Object.values(scoreLabels)
                .map((s) => s.label.toLowerCase())
                .join(", ")}
              . Төрт көрсеткіш 1-ден 5-ке дейінгі шкалада, топырақ реакциясы pH бірлігімен
              өлшенеді.
            </p>
            <p>Аймақтың сақталу индексі мына формула бойынша есептеледі:</p>
            <div className="rounded-card border border-line bg-paper-bright p-5 font-mono text-sm text-graphite-900">
              индекс = 50 × сезімтал_үлес + 20 × қорғалатын_үлес + 30 × (1 − (орташа_жайылым − 1) / 4)
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <strong className="font-semibold text-graphite-900">сезімтал_үлес</strong> — жайылым
                немесе ластану бойынша баллы 2-ден аспайтын түрлердің үлесі.
              </li>
              <li>
                <strong className="font-semibold text-graphite-900">қорғалатын_үлес</strong> — Қызыл
                кітапқа енген және эндемик түрлердің үлесі.
              </li>
              <li>
                <strong className="font-semibold text-graphite-900">орташа_жайылым</strong> — аймақ
                индикаторларының жайылымға төзімділігінің орташа мәні: мәні неғұрлым жоғары болса,
                нәзік түрлер соғұрлым көп ығыстырылған.
              </li>
            </ul>
            <p>
              Нәтиже 0–100 аралығында: 70-тен жоғары — салыстырмалы сақталған, 45–70 — орташа
              өзгерген, 45-тен төмен — қатты өзгерген аймақ. Индекс абсолютті өлшем емес, аймақтарды
              бір-бірімен салыстыруға арналған салыстырмалы көрсеткіш.
            </p>
          </Section>

          <Section title="Қызыл кітап санаттары">
            <ul className="space-y-2">
              {RED_BOOK_CATEGORIES.map((category) => (
                <li key={category} className="flex gap-3">
                  <span
                    className="mt-2 block size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: redBookLabels[category].token }}
                  />
                  <span>
                    <strong className="font-semibold text-graphite-900">
                      {redBookLabels[category].short}
                    </strong>{" "}
                    — {redBookLabels[category].full}.
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Фотосуреттер мен авторлық құқық">
            <p>
              Базада тек еркін лицензиямен (CC0, CC BY, CC BY-SA) таратылатын суреттер
              пайдаланылады; әр суреттің авторы мен лицензиясы түр бетінде көрсетілген. Еркін
              суреті жоқ түрлер үшін ботаникалық сұлба қолданылады.
            </p>
          </Section>

          <Section title="QR-кодтар қалай жұмыс істейді">
            <p>
              Әр түрдің QR-коды жоба репозиторийінде дайын файл ретінде сақталады және сол түрдің
              парақшасына сілтейді. Код сыртқы QR-сервиске тәуелді емес, сондықтан көрсетілім күні
              жұмыс істемей қалу қаупі жоқ. Барлық кодтарды «QR-кодтар» бетінен A4 форматында басып
              шығаруға болады.
            </p>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-paper-bright p-5">
            <p className="eyebrow">Базаның ағымдағы жағдайы</p>
            <dl className="mt-4 space-y-3">
              {[
                { label: "Түр", value: stats.total },
                { label: "Қызыл кітапта", value: stats.redBook },
                { label: "Эндемик", value: stats.endemic },
                { label: "Индикатор", value: stats.indicators },
                { label: "Аймақ", value: stats.zones },
                { label: "Нүкте", value: stats.locations },
                { label: "Нақты координат", value: stats.exactLocations },
                { label: "Фотосуретпен", value: stats.withPhoto },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-graphite-600">{item.label}</dt>
                  <dd className="font-display text-base font-semibold text-forest-800">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6 rounded-card border border-line bg-paper-bright p-5">
            <p className="eyebrow">Дереккөздер</p>
            <ul className="mt-4 space-y-3 text-sm text-graphite-600">
              <li>Қазақстан Республикасының Қызыл кітабы. 2-том: Өсімдіктер. Алматы, 2014</li>
              <li>Қазақстан флорасы (көп томдық), Алматы: Ғылым</li>
              <li>
                <a
                  href="https://www.gbif.org/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-2 hover:text-forest-700"
                >
                  GBIF
                </a>{" "}
                — координаттар мен табылу деректері
              </li>
              <li>
                <a
                  href="https://powo.science.kew.org/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-2 hover:text-forest-700"
                >
                  Plants of the World Online
                </a>{" "}
                — таксономия
              </li>
              <li>
                <a
                  href="https://www.iucnredlist.org/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-2 hover:text-forest-700"
                >
                  IUCN Red List
                </a>{" "}
                — халықаралық мәртебе
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
