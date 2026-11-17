// Vẽ lại logo KIET dạng vector để xuất PNG sắc nét ở mọi kích thước.
const sharp = require("sharp");
const fs = require("fs");
const NAVY = "#171b61", RED = "#e3141c";
const art = `
  <polygon fill="${NAVY}" points="205,460 262,460 262,520 318,460 388,460 307,545 392,632 326,632 262,556 262,632 205,632"/>
  <rect fill="${RED}" x="408" y="460" width="55" height="172"/>
  <circle fill="${RED}" cx="435.5" cy="414" r="29"/>
  <path d="M422 414 L432 424 L450 402" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill="${NAVY}" d="M503 460 H650 V504 H561 V524 H636 V566 H561 V588 H650 V632 H503 Z"/>
  <path fill="${NAVY}" d="M668 460 H826 V506 H774 V632 H718 V506 H668 Z"/>`;
const cx = 515.5, cy = 510, w = 621;
function svg(size, frac) {
  const s = (size * frac) / w;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="#fff"/><g transform="translate(${size / 2} ${size / 2}) scale(${s}) translate(${-cx} ${-cy})">${art}</g></svg>`;
}
(async () => {
  const out = "public/";
  const jobs = [["avatar-kiet-beta.png", 1024, 0.8], ["avatar-256.png", 256, 0.8], ["icon-192.png", 192, 0.66], ["icon-512.png", 512, 0.66], ["icon-maskable.png", 512, 0.5]];
  for (const [name, size, frac] of jobs) await sharp(Buffer.from(svg(size, frac)), { density: 300 }).resize(size, size).png().toFile(out + name);
  fs.writeFileSync(out + "logo-kiet.svg", svg(1024, 0.8));
  console.log("done");
})();
