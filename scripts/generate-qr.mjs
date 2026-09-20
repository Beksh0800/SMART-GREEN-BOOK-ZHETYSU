/**
 * Генерация QR-кодов для всех видов: src/data/plants/*.json -> public/qr/<slug>.svg
 *
 * QR делаются офлайн и коммитятся в репозиторий. Никаких сторонних
 * QR-сервисов в рантайме — код на распечатанном листе не должен зависеть
 * от чужого сайта, который может отвалиться в день показа.
 *
 * Запуск: npm run qr
 */
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const ROOT = process.cwd();
const PLANTS_DIR = path.join(ROOT, "src", "data", "plants");
const OUT_DIR = path.join(ROOT, "public", "qr");

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://smart-green-book-zhetysu.vercel.app"
).replace(/\/$/, "");

const QR_OPTIONS = {
  type: "svg",
  // Уровень коррекции Q: код читается даже при печати на матовой бумаге
  // и частичном загрязнении — лист на стенде живёт несколько дней.
  errorCorrectionLevel: "Q",
  margin: 2,
  color: { dark: "#1b3a2f", light: "#ffffff" },
};

async function main() {
  if (!fs.existsSync(PLANTS_DIR)) {
    console.error(`Деректер қалтасы табылмады: ${PLANTS_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(PLANTS_DIR).filter((f) => f.endsWith(".json"));
  const slugs = new Set();

  for (const file of files) {
    const plant = JSON.parse(fs.readFileSync(path.join(PLANTS_DIR, file), "utf8"));
    const slug = plant.slug;
    const url = `${SITE_URL}/plant/${slug}`;
    const svg = await QRCode.toString(url, QR_OPTIONS);

    fs.writeFileSync(path.join(OUT_DIR, `${slug}.svg`), svg, "utf8");
    slugs.add(slug);
  }

  // Убираем коды видов, которые удалили из базы
  let removed = 0;
  for (const existing of fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".svg"))) {
    if (!slugs.has(existing.replace(/\.svg$/, ""))) {
      fs.unlinkSync(path.join(OUT_DIR, existing));
      removed += 1;
    }
  }

  console.log(`QR-кодтар жасалды: ${slugs.size} дана → public/qr`);
  console.log(`Базалық мекенжай: ${SITE_URL}`);
  if (removed > 0) console.log(`Артық ${removed} файл жойылды.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
