// Generates tasteful, clearly-labelled PLACEHOLDER images into public/images.
// Replace them with real photography (same file names = zero code changes).
//   npm run images
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const OUT = "public/images";
mkdirSync(OUT, { recursive: true });

const L = { w: 1600, h: 1067 };
const P = { w: 1200, h: 1500 };
// The homepage hero is shown full-bleed at up to 2560px wide.
const H = { w: 2560, h: 1440 };

const themes = {
  amber: ["#2a1a0e", "#0f0a07", "#e09a4f", "#f3c98b"],
  emerald: ["#123128", "#070d0b", "#5fa987", "#d7c28e"],
  burgundy: ["#3a111c", "#0d0708", "#c2566b", "#e8b0a0"],
  brass: ["#2b2414", "#0c0b08", "#cda85e", "#f4ecde"],
  dusk: ["#1d1a2e", "#0a0a10", "#e0a86a", "#f0d7a8"],
};

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function bokeh(w, h, color, count, maxR) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const r = 8 + rand() * maxR;
    s += `<circle cx="${(rand() * w).toFixed(0)}" cy="${(rand() * h * 0.7).toFixed(0)}" r="${r.toFixed(0)}" fill="${color}" opacity="${(0.08 + rand() * 0.28).toFixed(2)}" filter="url(#blur)"/>`;
  }
  return s;
}

const motifs = {
  plate: (w, h, t) => {
    const cx = w * 0.56, cy = h * 0.52, r = Math.min(w, h) * 0.34;
    return `
      <ellipse cx="${cx + 18}" cy="${cy + 26}" rx="${r}" ry="${r}" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#efe6d6"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="#f8f2e8"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="none" stroke="#d9ccb6" stroke-width="3"/>
      <path d="M${cx - r * 0.5} ${cy + r * 0.05} Q ${cx - r * 0.1} ${cy - r * 0.45} ${cx + r * 0.42} ${cy - r * 0.08} Q ${cx + r * 0.1} ${cy + r * 0.3} ${cx - r * 0.5} ${cy + r * 0.05} Z" fill="${t[0]}" opacity="0.35" filter="url(#tiny)"/>
      ${[[-0.28, -0.02, 0.12], [0.0, -0.14, 0.13], [0.26, -0.04, 0.12]].map(([dx, dy, rr]) => `
        <circle cx="${cx + r * dx}" cy="${cy + r * dy}" r="${r * rr}" fill="${t[3]}"/>
        <circle cx="${cx + r * dx}" cy="${cy + r * dy}" r="${r * rr * 0.72}" fill="${t[2]}" opacity="0.75"/>`).join("")}
      ${Array.from({ length: 9 }, (_, i) => `<circle cx="${cx + r * (-0.36 + i * 0.09)}" cy="${cy + r * (0.14 + (i % 3) * 0.035)}" r="${5 + (i % 2) * 3}" fill="#5d8a55" opacity="0.85"/>`).join("")}`;
  },
  room: (w, h, t) => `
      ${bokeh(w, h, t[3], 36, 46)}
      <rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="#000" opacity="0.35"/>
      ${[0.18, 0.5, 0.82].map((x) => `
        <ellipse cx="${w * x}" cy="${h * 0.74}" rx="${w * 0.12}" ry="${h * 0.035}" fill="${t[0]}" stroke="${t[2]}" stroke-opacity="0.35"/>
        <rect x="${w * x - 4}" y="${h * 0.74}" width="8" height="${h * 0.16}" fill="${t[0]}"/>
        <ellipse cx="${w * x}" cy="${h * 0.7}" rx="14" ry="22" fill="${t[3]}" opacity="0.9" filter="url(#glow)"/>`).join("")}`,
  bar: (w, h, t) => `
      ${[0.28, 0.44, 0.6].map((y) => `<rect x="${w * 0.08}" y="${h * y}" width="${w * 0.84}" height="6" fill="${t[2]}" opacity="0.55"/>`).join("")}
      ${Array.from({ length: 30 }, (_, i) => {
        const row = i % 3, x = w * 0.1 + ((i % 10) * w * 0.08), y = h * [0.28, 0.44, 0.6][row];
        const bh = 60 + rand() * 70;
        return `<rect x="${x}" y="${y - bh}" width="${22 + rand() * 12}" height="${bh}" rx="8" fill="${[t[2], t[3], "#6d8f7c", "#9a3b4e"][i % 4]}" opacity="${0.35 + rand() * 0.4}"/>`;
      }).join("")}
      <rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="${t[0]}"/>
      <rect x="0" y="${h * 0.72}" width="${w}" height="8" fill="${t[2]}" opacity="0.8"/>
      ${bokeh(w, h, t[3], 14, 30)}`,
  glass: (w, h, t) => {
    const cx = w / 2, top = h * 0.3;
    return `
      ${bokeh(w, h, t[3], 24, 50)}
      <path d="M${cx - 190} ${top} L${cx + 190} ${top} Q ${cx + 170} ${top + 190} ${cx} ${top + 230} Q ${cx - 170} ${top + 190} ${cx - 190} ${top} Z" fill="${t[2]}" opacity="0.75"/>
      <path d="M${cx - 190} ${top} L${cx + 190} ${top}" stroke="${t[3]}" stroke-width="4" opacity="0.8"/>
      <rect x="${cx - 7}" y="${top + 228}" width="14" height="${h * 0.3}" fill="${t[3]}" opacity="0.55"/>
      <ellipse cx="${cx}" cy="${top + 228 + h * 0.3}" rx="120" ry="18" fill="${t[3]}" opacity="0.55"/>
      <circle cx="${cx + 120}" cy="${top - 10}" r="26" fill="#d9a441" opacity="0.9"/>`;
  },
  portrait: (w, h, t) => `
      ${bokeh(w, h, t[3], 18, 40)}
      <circle cx="${w / 2}" cy="${h * 0.38}" r="${w * 0.14}" fill="${t[0]}" stroke="${t[2]}" stroke-opacity="0.4" stroke-width="3"/>
      <path d="M${w * 0.18} ${h} Q ${w * 0.2} ${h * 0.58} ${w / 2} ${h * 0.56} Q ${w * 0.8} ${h * 0.58} ${w * 0.82} ${h} Z" fill="#efe6d6" opacity="0.92"/>
      <path d="M${w * 0.44} ${h * 0.6} L${w / 2} ${h * 0.72} L${w * 0.56} ${h * 0.6}" stroke="${t[0]}" stroke-width="6" fill="none" opacity="0.6"/>`,
  // Cinematic, text-free room used full-bleed behind the homepage headline:
  // a dark candle-lit dining room receding into warm light, with the lower-left
  // kept deliberately dark so the headline stays legible over it.
  hero: (w, h, t) => {
    const horizon = h * 0.6;
    const tables = [
      [0.1, 0.84, 1.3],
      [0.35, 0.755, 0.95],
      [0.63, 0.72, 0.78],
      [0.87, 0.8, 1.15],
      [0.49, 0.672, 0.52],
      [0.75, 0.663, 0.45],
    ];
    return `
      <!-- Warm key light through the room, so the frame has exposure to work with -->
      <rect width="${w}" height="${h}" fill="url(#heroWash)"/>
      <rect x="0" y="${horizon}" width="${w}" height="${h - horizon}" fill="#171009"/>
      <!-- Soft transition instead of a hard floor/wall seam -->
      <rect x="0" y="${horizon - h * 0.16}" width="${w}" height="${h * 0.32}" fill="url(#horizon)"/>
      <ellipse cx="${w * 0.63}" cy="${horizon}" rx="${w * 0.42}" ry="${h * 0.1}" fill="${t[2]}" opacity="0.1" filter="url(#soft)"/>
      ${bokeh(w, h, "#ffd9a0", 58, 62)}
      ${[0.22, 0.44, 0.66, 0.88]
        .map(
          (x, i) => `
        <ellipse cx="${w * x}" cy="${h * (0.1 + (i % 2) * 0.05)}" rx="${26 - i * 3}" ry="${34 - i * 3}" fill="${t[3]}" opacity="0.75" filter="url(#glow)"/>
        <path d="M${w * x - 46} ${h * 0.12} L${w * x + 46} ${h * 0.12} L${w * x + 112} ${horizon} L${w * x - 112} ${horizon} Z" fill="${t[2]}" opacity="0.06" filter="url(#soft)"/>`,
        )
        .join("")}
      ${tables
        .map(([x, y, sc]) => {
          const cx = w * x;
          const cy = h * y;
          const rx = w * 0.072 * sc;
          const ry = h * 0.019 * sc;
          return `
        <ellipse cx="${cx}" cy="${cy + ry * 0.9}" rx="${rx * 1.05}" ry="${ry * 1.1}" fill="#000" opacity="0.5" filter="url(#soft)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${t[0]}" stroke="${t[2]}" stroke-opacity="0.3" stroke-width="2"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.62}" ry="${ry * 0.58}" fill="${t[2]}" opacity="0.07"/>
        <ellipse cx="${cx}" cy="${cy - 26 * sc}" rx="${74 * sc}" ry="${60 * sc}" fill="#ff9d42" opacity="0.42" filter="url(#glow)"/>
        <ellipse cx="${cx}" cy="${cy + ry * 0.2}" rx="${rx * 0.78}" ry="${ry * 0.7}" fill="#ffb15e" opacity="0.16" filter="url(#soft)"/>
        <rect x="${cx - 5 * sc}" y="${cy - 34 * sc}" width="${10 * sc}" height="${34 * sc}" rx="${3 * sc}" fill="#f6e2bb" opacity="0.72"/>
        <ellipse cx="${cx}" cy="${cy - 42 * sc}" rx="${16 * sc}" ry="${24 * sc}" fill="#ffca7a" opacity="0.95" filter="url(#glow)"/>
        <ellipse cx="${cx}" cy="${cy - 40 * sc}" rx="${4.5 * sc}" ry="${9 * sc}" fill="#fff6e2"/>`;
        })
        .join("")}`;
  },
  kitchen: (w, h, t) => `
      <rect x="${w * 0.3}" y="${h * 0.25}" width="${w * 0.4}" height="${h * 0.4}" rx="18" fill="#000" opacity="0.5"/>
      <ellipse cx="${w / 2}" cy="${h * 0.55}" rx="${w * 0.16}" ry="${h * 0.12}" fill="#f08a3c" opacity="0.85" filter="url(#glow)"/>
      <ellipse cx="${w / 2}" cy="${h * 0.57}" rx="${w * 0.09}" ry="${h * 0.06}" fill="#ffd28a" opacity="0.9" filter="url(#glow)"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="${w * 0.33 + i * w * 0.042}" y="${h * 0.5}" width="${w * 0.03}" height="6" fill="#222"/>`).join("")}
      <rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="${t[0]}"/>
      ${bokeh(w, h, "#ffb86b", 20, 22)}`,
};

const images = [
  ["hero-dining-room", H, "amber", "hero", "Dining room at service"],
  ["interior-dining-room", L, "amber", "room", "Dining room"],
  ["terrace-evening", L, "dusk", "room", "Terrace at dusk"],
  ["private-dining", L, "burgundy", "room", "Private dining room"],
  ["table-setting", P, "brass", "room", "Table setting"],
  ["dish-scallops", L, "amber", "plate", "Seared scallops"],
  ["dish-lamb", L, "burgundy", "plate", "Wood-fired lamb"],
  ["dish-dessert", L, "brass", "plate", "Burnt honey tart"],
  ["dish-risotto", L, "emerald", "plate", "Mushroom risotto"],
  ["bar-counter", P, "brass", "bar", "Cocktail bar"],
  ["wine-cellar", P, "burgundy", "bar", "Wine wall"],
  ["cocktail-signature", P, "emerald", "glass", "Signature cocktail"],
  ["open-kitchen", L, "amber", "kitchen", "Open kitchen"],
  ["chef-portrait", P, "emerald", "portrait", "Head chef"],
];

for (const [name, size, themeName, motif, label] of images) {
  const t = themes[themeName];
  const { w, h } = size;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="bg" cx="35%" cy="30%" r="90%"><stop offset="0" stop-color="${t[0]}"/><stop offset="1" stop-color="${t[1]}"/></radialGradient>
    <radialGradient id="warm" cx="75%" cy="20%" r="60%"><stop offset="0" stop-color="${t[2]}" stop-opacity="0.35"/><stop offset="1" stop-color="${t[2]}" stop-opacity="0"/></radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></linearGradient>
    <!-- Filter regions are widened: the default (-10%/120%) clips a large blur on a
         small shape into a visible square. -->
    <filter id="blur" x="-75%" y="-75%" width="250%" height="250%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="soft" x="-75%" y="-75%" width="250%" height="250%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="tiny" x="-75%" y="-75%" width="250%" height="250%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="16"/></filter>
    <linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0a06" stop-opacity="0"/><stop offset="0.5" stop-color="#0d0a06" stop-opacity="0.8"/><stop offset="1" stop-color="#0d0a06" stop-opacity="1"/></linearGradient>
    <!-- Kept light: the page grades the hero in CSS, so the file stays a plausible photograph -->
    <radialGradient id="vignette" cx="58%" cy="42%" r="78%"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></radialGradient>
    <linearGradient id="scrim" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0d0c0b" stop-opacity="0.4"/><stop offset="0.5" stop-color="#0d0c0b" stop-opacity="0.08"/><stop offset="1" stop-color="#0d0c0b" stop-opacity="0"/></linearGradient>
    <radialGradient id="heroWash" cx="62%" cy="32%" r="78%"><stop offset="0" stop-color="#c98d45" stop-opacity="0.95"/><stop offset="0.45" stop-color="#8a5a2a" stop-opacity="0.75"/><stop offset="1" stop-color="#3a2513" stop-opacity="0.25"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#warm)"/>
  ${motifs[motif](w, h, t)}
  ${motif === "hero" ? "" : `<rect width="${w}" height="${h}" fill="url(#fade)"/>`}
  ${
    motif === "hero"
      ? // The hero is displayed full-bleed behind live text, so it carries no centred
        // label — just a discreet corner marker, and extra darkening where the
        // headline sits so the placeholder reads like a real art-directed frame.
        `<rect width="${w}" height="${h}" fill="url(#vignette)"/>
  <rect width="${w}" height="${h}" fill="url(#scrim)"/>
  <text x="${w - 48}" y="${h - 44}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="4" fill="#cda85e" opacity="0.45">PLACEHOLDER PHOTO</text>`
      : `<!-- Labels are centred so they survive any object-fit crop -->
  <g font-family="Helvetica, Arial, sans-serif">
    <rect x="${w / 2 - 190}" y="${h * 0.12}" rx="24" width="380" height="48" fill="#0d0c0b" opacity="0.75"/>
    <text x="${w / 2}" y="${h * 0.12 + 31}" text-anchor="middle" font-size="20" letter-spacing="4" fill="#cda85e">PLACEHOLDER PHOTO</text>
  </g>
  <text x="${w / 2}" y="${h * 0.86}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(Math.min(w, h) / 14)}" fill="#f4ecde" opacity="0.92">${label}</text>`
  }
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 78, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
  console.log(`✓ ${OUT}/${name}.jpg`);
}

// ─── Homepage hero plates ───────────────────────────────────────────────────
// Top-down signature plates on TRANSPARENT backgrounds. The hero floats them
// over the dark room like product shots and slowly cycles through them, so the
// real replacements should be the same kind of file: a top-down photo of one
// dish, cut out to a transparent PNG (or WebP), square, at least 1600px, the
// plate filling the frame. Shadows and lighting are drawn by the page.
const S = 1600;
const c = S / 2;
const R = S * 0.47; // plate radius

const plateDefs = `
    <radialGradient id="ivoryRim" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#f6efe3"/><stop offset="0.7" stop-color="#e3d8c6"/><stop offset="1" stop-color="#b9ab94"/></radialGradient>
    <radialGradient id="ivoryWell" cx="44%" cy="38%" r="68%"><stop offset="0" stop-color="#fbf7f0"/><stop offset="0.8" stop-color="#ece3d4"/><stop offset="1" stop-color="#d8ccb8"/></radialGradient>
    <radialGradient id="slateRim" cx="40%" cy="34%" r="72%"><stop offset="0" stop-color="#4a4541"/><stop offset="0.7" stop-color="#2f2c29"/><stop offset="1" stop-color="#1c1a18"/></radialGradient>
    <radialGradient id="slateWell" cx="44%" cy="38%" r="70%"><stop offset="0" stop-color="#3d3935"/><stop offset="1" stop-color="#262321"/></radialGradient>
    <radialGradient id="bowlWell" cx="46%" cy="40%" r="60%"><stop offset="0" stop-color="#f3ece0"/><stop offset="0.75" stop-color="#ddd2bf"/><stop offset="1" stop-color="#b7aa93"/></radialGradient>
    <radialGradient id="sear" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#e7b57a"/><stop offset="0.55" stop-color="#c7853f"/><stop offset="1" stop-color="#8e5423"/></radialGradient>
    <radialGradient id="flesh" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#fbf0dc"/><stop offset="1" stop-color="#e5cfa8"/></radialGradient>
    <radialGradient id="butter" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#c98a3c" stop-opacity="0.75"/><stop offset="1" stop-color="#b8782f" stop-opacity="0"/></radialGradient>
    <radialGradient id="lamb" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#d9786b"/><stop offset="0.6" stop-color="#b3544a"/><stop offset="1" stop-color="#6e3226"/></radialGradient>
    <radialGradient id="jus" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#5a2615" stop-opacity="0.9"/><stop offset="1" stop-color="#3a180d" stop-opacity="0"/></radialGradient>
    <radialGradient id="risotto" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#efdcae"/><stop offset="1" stop-color="#cdb17a"/></radialGradient>
    <linearGradient id="tartTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6e3412"/><stop offset="0.5" stop-color="#9c5220"/><stop offset="1" stop-color="#c7802f"/></linearGradient>
    <radialGradient id="quenelle" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#e8dccb"/></radialGradient>
    <linearGradient id="light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.3"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.18"/></linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="tiny" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>`;

const leaves = (n, cx, cy, spreadX, spreadY, colors, min = 7, max = 18) =>
  Array.from({ length: n }, (_, i) => {
    const x = cx + (rand() - 0.5) * spreadX;
    const y = cy + (rand() - 0.5) * spreadY;
    const sz = min + rand() * (max - min);
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${sz.toFixed(1)}" ry="${(sz * 0.45).toFixed(1)}" transform="rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${colors[i % colors.length]}" opacity="0.92"/>`;
  }).join("");

const shadowOf = (svgShape) => `<g transform="translate(14 20)" opacity="0.3" filter="url(#blur)">${svgShape}</g>`;

const ivoryPlate = `
  <circle cx="${c}" cy="${c}" r="${R}" fill="url(#ivoryRim)"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.985}" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="3"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.66}" fill="url(#ivoryWell)"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.66}" fill="none" stroke="#c9bba3" stroke-opacity="0.6" stroke-width="4" filter="url(#tiny)"/>`;

const plates = {
  "hero-plate": () => {
    const scallops = [[-0.2, -0.06, 0.125], [0.02, -0.17, 0.132], [0.22, -0.02, 0.122]];
    const oil = Array.from({ length: 14 }, (_, i) => {
      const x = c + R * (-0.42 + i * 0.065);
      const y = c + R * (0.3 + Math.sin(i * 1.3) * 0.05);
      return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(5 + (i % 3) * 3).toFixed(0)}" fill="#7da24a" opacity="0.85"/>`;
    }).join("");
    return `${ivoryPlate}
  <ellipse cx="${c + R * 0.02}" cy="${c + R * 0.02}" rx="${R * 0.46}" ry="${R * 0.3}" fill="url(#butter)" filter="url(#blur)"/>
  <path d="M${c - R * 0.44} ${c + R * 0.12} C ${c - R * 0.2} ${c - R * 0.34}, ${c + R * 0.34} ${c - R * 0.32}, ${c + R * 0.46} ${c + R * 0.04} C ${c + R * 0.2} ${c + R * 0.2}, ${c - R * 0.12} ${c + R * 0.26}, ${c - R * 0.44} ${c + R * 0.12} Z" fill="#e9dcc0" opacity="0.9" filter="url(#tiny)"/>
  ${scallops.map(([dx, dy, rr]) => {
    const x = c + R * dx, y = c + R * dy, r = R * rr;
    return `
  <circle cx="${x + r * 0.12}" cy="${y + r * 0.16}" r="${r * 1.04}" fill="#000" opacity="0.28" filter="url(#blur)"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="url(#flesh)"/>
  <circle cx="${x}" cy="${y}" r="${r * 0.84}" fill="url(#sear)"/>
  <circle cx="${x - r * 0.22}" cy="${y - r * 0.26}" r="${r * 0.28}" fill="#fff" opacity="0.2" filter="url(#tiny)"/>`;
  }).join("")}
  ${oil}
  ${leaves(26, c + R * 0.05, c + R * 0.12, R * 0.8, R * 0.35, ["#4f7a3f", "#6b9450", "#3d6531"])}
  ${[[-0.33, 0.2], [0.36, 0.18]].map(([dx, dy]) => `<path d="M${c + R * dx} ${c + R * dy} q 22 -30 46 0 q -22 14 -46 0 Z" fill="#f2c14e" opacity="0.9"/>`).join("")}`;
  },

  // Charcoal stoneware: the lamb reads warmer against a dark plate
  "hero-plate-lamb": () => {
    const cutlets = [[-0.16, 0.04, -24], [0.02, -0.04, -8], [0.2, 0.06, 10]];
    const cutlet = (x, y, rot) => {
      const w = R * 0.19, h = R * 0.3;
      const shape = `<g transform="rotate(${rot} ${x} ${y})">
        <rect x="${x - w / 2}" y="${y - h * 0.15}" width="${w}" height="${h}" rx="${w * 0.48}" fill="#4f6b33"/>
        <rect x="${x - w / 2 + 12}" y="${y - h * 0.15 + 12}" width="${w - 24}" height="${h - 24}" rx="${w * 0.4}" fill="url(#lamb)"/>
        <rect x="${x - 9}" y="${y - h * 0.62}" width="18" height="${h * 0.52}" rx="9" fill="#efe3cc"/>
      </g>`;
      return shadowOf(shape) + shape;
    };
    return `
  <circle cx="${c}" cy="${c}" r="${R}" fill="url(#slateRim)"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.985}" fill="none" stroke="#6d665e" stroke-opacity="0.6" stroke-width="3"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.7}" fill="url(#slateWell)"/>
  <ellipse cx="${c}" cy="${c + R * 0.08}" rx="${R * 0.44}" ry="${R * 0.26}" fill="url(#jus)" filter="url(#blur)"/>
  <path d="M${c - R * 0.42} ${c + R * 0.2} C ${c - R * 0.1} ${c - R * 0.1}, ${c + R * 0.3} ${c - R * 0.02}, ${c + R * 0.44} ${c + R * 0.22} C ${c + R * 0.1} ${c + R * 0.34}, ${c - R * 0.2} ${c + R * 0.34}, ${c - R * 0.42} ${c + R * 0.2} Z" fill="#b99a74" opacity="0.95" filter="url(#tiny)"/>
  ${cutlets.map(([dx, dy, rot]) => cutlet(c + R * dx, c + R * dy, rot)).join("")}
  ${Array.from({ length: 12 }, (_, i) => `<circle cx="${(c + R * (-0.38 + i * 0.07)).toFixed(0)}" cy="${(c + R * (0.36 + Math.sin(i) * 0.04)).toFixed(0)}" r="${7 + (i % 3) * 3}" fill="#6f9a45" opacity="0.9"/>`).join("")}
  ${leaves(14, c + R * 0.02, c + R * 0.3, R * 0.7, R * 0.12, ["#86ad58", "#5f8a3c"], 6, 12)}
  <circle cx="${c}" cy="${c}" r="${R}" fill="url(#light)" opacity="0.6"/>`;
  },

  // Shallow bowl: a wider, deeper well so it reads as a different vessel
  "hero-plate-risotto": () => {
    const grains = Array.from({ length: 220 }, () => {
      const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * R * 0.4;
      const x = c + Math.cos(a) * d, y = c + Math.sin(a) * d;
      return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="7" ry="3.5" transform="rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="#f6ead0" opacity="0.8"/>`;
    }).join("");
    const mushrooms = [[-0.18, -0.12, 20], [0.12, -0.2, -30], [0.2, 0.08, 60], [-0.06, 0.16, -10], [-0.24, 0.1, 80]].map(([dx, dy, rot]) => {
      const x = c + R * dx, y = c + R * dy;
      return `<g transform="rotate(${rot} ${x} ${y})">
        <path d="M${x - 44} ${y} a 44 34 0 0 1 88 0 z" fill="#7a5433"/>
        <path d="M${x - 36} ${y - 2} a 36 26 0 0 1 72 0 z" fill="#a57a52"/>
        <rect x="${x - 10}" y="${y - 2}" width="20" height="40" rx="8" fill="#c9a77f"/>
      </g>`;
    }).join("");
    const shavings = Array.from({ length: 7 }, (_, i) => {
      const x = c + R * (-0.2 + rand() * 0.4), y = c + R * (-0.2 + rand() * 0.4);
      return `<path d="M${x} ${y} q 30 -18 62 -4 q -30 4 -62 4 z" fill="#f7efd9" opacity="0.95"/>`;
    }).join("");
    return `
  <circle cx="${c}" cy="${c}" r="${R}" fill="url(#ivoryRim)"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.985}" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="3"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.78}" fill="url(#bowlWell)"/>
  <circle cx="${c + 10}" cy="${c + 16}" r="${R * 0.46}" fill="#000" opacity="0.2" filter="url(#blur)"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.45}" fill="url(#risotto)"/>
  ${grains}
  ${mushrooms}
  ${shavings}
  ${leaves(30, c, c, R * 0.7, R * 0.7, ["#5d7f3e", "#789b52"], 5, 10)}
  <circle cx="${c}" cy="${c}" r="${R}" fill="url(#light)"/>`;
  },

  // Dessert: a wide-rimmed plate, so the slice has air around it
  "hero-plate-tart": () => {
    const pr = R;
    const tip = [c + R * 0.26, c + R * 0.2];
    const wedge = `M${c - R * 0.34} ${c - R * 0.14} A ${R * 0.62} ${R * 0.62} 0 0 1 ${c - R * 0.02} ${c - R * 0.4} L ${tip[0]} ${tip[1]} Z`;
    return `
  <circle cx="${c}" cy="${c}" r="${pr}" fill="url(#ivoryRim)"/>
  <circle cx="${c}" cy="${c}" r="${pr * 0.985}" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="3"/>
  <circle cx="${c}" cy="${c}" r="${pr * 0.58}" fill="url(#ivoryWell)"/>
  ${shadowOf(`<path d="${wedge}" fill="#000"/>`)}
  <path d="${wedge}" fill="#c8904f"/>
  <path d="${wedge}" fill="url(#tartTop)" transform="translate(${R * 0.03} ${R * 0.03}) scale(0.94)" transform-origin="${c - R * 0.03} ${c - R * 0.11}"/>
  <path d="M${c - R * 0.3} ${c - R * 0.16} A ${R * 0.58} ${R * 0.58} 0 0 1 ${c - R * 0.04} ${c - R * 0.36}" stroke="#e0b070" stroke-width="10" fill="none" opacity="0.6"/>
  ${shadowOf(`<ellipse cx="${c + R * 0.22}" cy="${c - R * 0.16}" rx="${R * 0.14}" ry="${R * 0.09}" fill="#000"/>`)}
  <ellipse cx="${c + R * 0.22}" cy="${c - R * 0.16}" rx="${R * 0.14}" ry="${R * 0.09}" transform="rotate(-30 ${c + R * 0.22} ${c - R * 0.16})" fill="url(#quenelle)"/>
  <path d="M${c + R * 0.12} ${c - R * 0.12} q ${R * 0.1} ${-R * 0.08} ${R * 0.2} ${-R * 0.06}" stroke="#fff" stroke-width="5" fill="none" opacity="0.7"/>
  ${Array.from({ length: 18 }, () => `<circle cx="${(c + R * (0.02 + rand() * 0.4)).toFixed(0)}" cy="${(c + R * (-0.34 + rand() * 0.4)).toFixed(0)}" r="${(3 + rand() * 4).toFixed(1)}" fill="#e8b53a" opacity="0.9"/>`).join("")}
  <path d="M${c - R * 0.36} ${c + R * 0.26} C ${c - R * 0.1} ${c + R * 0.12}, ${c + R * 0.12} ${c + R * 0.36}, ${c + R * 0.36} ${c + R * 0.22}" stroke="#b06a24" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.75"/>
  <circle cx="${c}" cy="${c}" r="${pr}" fill="url(#light)"/>`;
  },
};

for (const [name, draw] of Object.entries(plates)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${plateDefs}</defs>${draw()}</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
  console.log(`✓ ${OUT}/${name}.png`);
}
