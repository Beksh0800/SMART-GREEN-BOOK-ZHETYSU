# Zhetysu GreenMap — Smart Green Book

Жетісу өңірінің цифрлық ботаникалық картасы. Статический сайт на Next.js: данные о видах
лежат в репозитории в виде JSON, внешних сервисов и базы данных нет.

## Модули

| Раздел | Путь | Что делает |
|---|---|---|
| PlantMap | `/map` | Интерактивная карта находок, фильтры по статусу, зоне, местообитанию, индикаторному фактору |
| QR Plant Passport | `/plant/[slug]`, `/qr` | Паспорт вида + QR-код каждого вида и печатный лист всех кодов (A4) |
| BioIndicator | `/bioindicator` | Сравнение зон по составу растений-индикаторов, индекс сохранности |
| Red & Endemic Book | `/red-book` | Каталог краснокнижных и эндемичных видов |
| Әдістеме | `/about` | Методика, формула индекса, источники |

## Команды

```bash
npm run dev        # локальная разработка (http://localhost:3000)
npm run validate   # проверка всех JSON по zod-схеме + отчёт о заполненности
npm run qr         # перегенерация QR-кодов в public/qr
npm run build      # validate + qr + production-сборка
npm run start      # запуск production-сборки
```

`npm run build` сначала прогоняет валидацию и генерацию QR — битые данные не попадут в сборку.

## Данные

- `src/data/plants/<slug>.json` — один файл на вид. Схема: `src/lib/schema.ts`.
- `src/data/zones.json` — зоны Жетісу (центр, радиус, высоты, типы местообитаний).
- Весь доступ к данным идёт через `src/lib/plants.ts` — если понадобится вынести базу
  в облако, меняется только этот модуль.

### Как добавить вид

1. Создать `src/data/plants/<slug>.json` (имя файла = `slug`).
2. Координаты брать из GBIF: `https://api.gbif.org/v1/occurrence/search?scientificName=...&country=KZ&hasCoordinate=true`.
   В `source` записать `GBIF occurrence <key>`, в `sourceUrl` — ссылку на запись.
3. Поле `precision`: `exact` — подтверждённая находка, `locality` — центр описанного
   местонахождения, `zone` — известна только зона.
4. Фото — только со свободной лицензией (CC0 / CC BY / CC BY-SA / PD), файл в
   `public/images/plants/<slug>.webp`, автор и лицензия обязательны в JSON.
   Без фото карточка показывает ботанический силуэт — это нормально.
5. `npm run validate && npm run qr`.

## Деплой на Vercel

1. Залить репозиторий на GitHub.
2. На vercel.com: New Project → импорт репозитория. Framework определится автоматически.
3. В Environment Variables задать `NEXT_PUBLIC_SITE_URL` = адрес проекта
   (например `https://smart-green-book-zhetysu.vercel.app`) — этот адрес зашивается в QR-коды.
4. После первого деплоя выполнить локально `npm run qr` с тем же `NEXT_PUBLIC_SITE_URL`,
   закоммитить обновлённые `public/qr/*.svg` и задеплоить снова — иначе коды будут
   указывать на адрес по умолчанию.

Бесплатного тарифа Vercel и домена `*.vercel.app` достаточно: сайт полностью статический.

## Дизайн

Токены (палитра, типографика, радиусы, тени) — в `@theme` в `src/app/globals.css`.
Хардкод-цветов в компонентах нет, кроме `src/components/map/mapStyle.ts`: Leaflet рисует
точки SVG-атрибутами, которые не понимают CSS-переменные, — там те же цвета продублированы
литералами с пометкой.
