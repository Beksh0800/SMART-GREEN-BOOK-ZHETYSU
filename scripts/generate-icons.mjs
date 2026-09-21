/**
 * Иконки приложения: src/app/icon.svg -> public/icons/*.png
 *
 * Манифест PWA требует растровые иконки 192 и 512, плюс maskable-вариант
 * с полями (Android обрезает иконку по своей маске — без запаса по краям
 * срезается верхушка растения).
 *
 * Иконки генерируются из того же SVG, что и фавиконка, и коммитятся
 * в репозиторий: на Vercel сборка не должна зависеть от sharp в рантайме.
 *
 * Запуск: npm run icons
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "src", "app", "icon.svg");
const OUT_DIR = path.join(ROOT, "public", "icons");

/** Цвет подложки — тот же paper, что и background_color в манифесте. */
const PAPER = "#f7f5ef";

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Бастапқы белгіше табылмады: ${SOURCE}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const svg = fs.readFileSync(SOURCE);

  for (const size of [192, 512]) {
    await sharp(svg, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(path.join(OUT_DIR, `icon-${size}.png`));
  }

  // Maskable: рисунок занимает 60% полотна, остальное — поля под обрезку.
  const inner = Math.round(512 * 0.6);
  const pad = Math.round((512 - inner) / 2);
  await sharp(svg, { density: 384 })
    .resize(inner, inner)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: PAPER,
    })
    .flatten({ background: PAPER })
    .png()
    .toFile(path.join(OUT_DIR, "icon-maskable-512.png"));

  console.log(`  Белгішелер дайын: ${path.relative(ROOT, OUT_DIR)} (3 файл)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
