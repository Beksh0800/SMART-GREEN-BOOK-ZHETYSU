/**
 * Подбор фотографий видов с Wikimedia Commons.
 *
 * Правила жёсткие намеренно: поиск по названию вида легко приносит
 * почтовые марки, книжные ботанические таблицы XIX века и снимки
 * соседних видов. Кандидат принимается, только если это растровая
 * фотография, в имени файла есть и род, и видовой эпитет, лицензия
 * свободная, а в названии нет признаков рисунка/марки/гербария.
 *
 * Запуск:
 *   node scripts/fetch-photos.mjs           # только виды без фото
 *   node scripts/fetch-photos.mjs --force   # пересобрать все
 *   node scripts/fetch-photos.mjs --only tulipa-iliensis,stipa-capillata
 *
 * Скрипт правит поле `photo` в src/data/plants/*.json и кладёт файлы
 * в public/images/plants. Автор и лицензия сохраняются обязательно —
 * без них снимок использовать нельзя.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PLANTS = path.join(ROOT, "src", "data", "plants");
const IMAGES = path.join(ROOT, "public", "images", "plants");
const UA = "ZhetysuGreenMapBot/1.0 (educational project; Wikimedia API)";

const FREE_LICENSE = /^(cc0|cc-by|cc by|pd|public domain)/i;

/** Признаки того, что файл — не полевая фотография живого растения. */
const NOT_A_PHOTO =
  /stamp|postage|philatel|coin|banknote|gartenflora|curtis|botanical magazine|illustration|drawing|painting|watercolo|engraving|lithograph|plate|herbar|specimen|sheet|label|scan|diagram|logo|poster|seeds|flora of|flora_of|phytokeys|zookeys|pensoft|pdca|figure|fig |fig.|plantae/i;

/**
 * Под какими ещё названиями вид лежит в Commons и iNaturalist.
 * Без этого списка саксаул и чий остаются без фото: снимки подписаны
 * синонимами, а поиск по принятому названию их не находит.
 */
const SYNONYMS = {
  "Haloxylon aphyllum": ["Haloxylon ammodendron"],
  "Achnatherum splendens": ["Stipa splendens", "Lasiagrostis splendens"],
  "Armeniaca vulgaris": ["Prunus armeniaca"],
  "Populus diversifolia": ["Populus euphratica"],
  "Salix songarica": ["Salix wilhelmsiana"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams(params);
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      await sleep(4000 * (attempt + 1));
    }
  }
  throw new Error("Commons API жауап бермеді");
}

const normalize = (s) => s.toLowerCase().replace(/[_\-.,()]/g, " ");

function isRightSpecies(title, latin) {
  const [genus, epithet] = latin.toLowerCase().split(/\s+/);
  const t = normalize(title);
  // и род, и видовой эпитет должны стоять в имени файла: иначе легко
  // получить соседний вид того же рода
  return t.includes(genus) && Boolean(epithet) && t.includes(epithet);
}

async function findPhoto(latin) {
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${latin}`,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "1400",
    format: "json",
  });

  const pages = Object.values(data?.query?.pages ?? {}).sort(
    (a, b) => (a.index ?? 99) - (b.index ?? 99),
  );

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    if (!/\.(jpe?g|png)$/i.test(page.title)) continue;
    if (NOT_A_PHOTO.test(page.title)) continue;
    if (!isRightSpecies(page.title, latin)) continue;
    if (info.width < 800) continue;

    const meta = info.extmetadata ?? {};
    const license = (meta.LicenseShortName?.value ?? "").replace(/<[^>]+>/g, "").trim();
    if (!FREE_LICENSE.test(license)) continue;

    const author =
      (meta.Artist?.value ?? "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim() || "Wikimedia Commons авторы";

    return {
      src: (info.thumburl ?? info.url).split("?")[0],
      page: info.descriptionurl,
      license,
      author: author.slice(0, 120),
      title: page.title,
    };
  }
  return null;
}

const INAT_OK_LICENSE = new Set(["cc0", "cc-by", "cc-by-sa", "cc-by-nc", "cc-by-nc-sa"]);

const INAT_LICENSE_LABEL = {
  cc0: "CC0",
  "cc-by": "CC BY 4.0",
  "cc-by-sa": "CC BY-SA 4.0",
  "cc-by-nc": "CC BY-NC 4.0",
  "cc-by-nc-sa": "CC BY-NC-SA 4.0",
};

/** Запасной поиск, когда в Commons нет пригодного снимка вида. */
async function findPhotoInat(latin) {
  const taxaRes = await fetch(
    `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(latin)}&rank=species&per_page=1`,
    { headers: { "User-Agent": UA } },
  );
  const taxa = await taxaRes.json();
  const taxon = taxa?.results?.[0];
  if (!taxon || taxon.name.toLowerCase() !== latin.toLowerCase()) return null;

  await sleep(1500);
  const obsRes = await fetch(
    `https://api.inaturalist.org/v1/observations?taxon_id=${taxon.id}&photos=true&quality_grade=research&order_by=votes&per_page=30`,
    { headers: { "User-Agent": UA } },
  );
  const obs = await obsRes.json();

  for (const observation of obs?.results ?? []) {
    for (const photo of observation.photos ?? []) {
      const license = (photo.license_code ?? "").toLowerCase();
      if (!INAT_OK_LICENSE.has(license)) continue;
      return {
        src: photo.url.replace("/square.", "/large."),
        page: `https://www.inaturalist.org/photos/${photo.id}`,
        license: INAT_LICENSE_LABEL[license] ?? license.toUpperCase(),
        author: (photo.attribution ?? "iNaturalist авторы")
          .replace(/^(c)s*/i, "")
          .split(",")[0]
          .trim()
          .slice(0, 120),
        title: `iNaturalist photo ${photo.id}`,
      };
    }
  }
  return null;
}

async function download(src) {
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(2500);
    const res = await fetch(src, {
      headers: { "User-Agent": UA, Referer: "https://commons.wikimedia.org/" },
    });
    if (res.ok && (res.headers.get("content-type") ?? "").startsWith("image/")) {
      return Buffer.from(await res.arrayBuffer());
    }
    await sleep(6000 * (attempt + 1));
  }
  return null;
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.indexOf("--only");
const only = onlyArg !== -1 ? new Set(args[onlyArg + 1]?.split(",") ?? []) : null;

fs.mkdirSync(IMAGES, { recursive: true });

let updated = 0;
let skipped = 0;
const missing = [];

for (const file of fs.readdirSync(PLANTS).filter((f) => f.endsWith(".json"))) {
  const jsonPath = path.join(PLANTS, file);
  const plant = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  if (only && !only.has(plant.slug)) continue;
  if (!only && !force && plant.photo) {
    skipped += 1;
    continue;
  }

  try {
    const names = [plant.name.la, ...(SYNONYMS[plant.name.la] ?? [])];
    let found = null;
    for (const name of names) {
      found = (await findPhoto(name)) ?? (await findPhotoInat(name));
      if (found) break;
    }
    if (!found) {
      missing.push(plant.slug);
      console.log(`- ${plant.slug}: жарамды сурет табылмады`);
      continue;
    }

    const buf = await download(found.src);
    if (!buf) {
      missing.push(plant.slug);
      console.log(`! ${plant.slug}: жүктелмеді`);
      continue;
    }

    await sharp(buf)
      .resize(1200, 1500, { fit: "cover", position: "attention" })
      .webp({ quality: 80 })
      .toFile(path.join(IMAGES, `${plant.slug}.webp`));

    plant.photo = {
      file: `${plant.slug}.webp`,
      author: found.author,
      license: found.license,
      url: found.page,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(plant, null, 2) + "\n");

    updated += 1;
    console.log(`+ ${plant.slug}: ${found.title.replace("File:", "").slice(0, 60)}`);
  } catch (error) {
    console.log(`! ${plant.slug}: ${error.message}`);
  }
}

console.log(`\nЖаңартылды: ${updated} · өзгеріссіз: ${skipped} · суретсіз: ${missing.length}`);
if (missing.length) console.log(`Суретсіз түрлер: ${missing.join(", ")}`);
