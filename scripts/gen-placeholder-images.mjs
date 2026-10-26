// Generates illustrated SVG placeholder "photos" used by the dummy data.
// Replace with real operator photos (Firebase Storage) later.
import { writeFileSync, mkdirSync } from "node:fs";
const out = new URL("../public/img/vehicles/", import.meta.url);
mkdirSync(out, { recursive: true });

const types = {
  "tempo-traveller": { len: 300, h: 130, roof: 38, windows: 5 },
  urbania: { len: 310, h: 128, roof: 30, windows: 5 },
  "mini-bus": { len: 360, h: 140, roof: 20, windows: 6 },
  "tourist-coach": { len: 420, h: 150, roof: 14, windows: 7 },
  "tourist-bus": { len: 460, h: 160, roof: 10, windows: 8 },
};
const palettes = [
  { body: "#FFFFFF", stripe: "#1769AA", sky1: "#CFE4F6", sky2: "#F6F8FA", ground: "#9DBF8E" },
  { body: "#F2F4F7", stripe: "#F47A20", sky1: "#FBD9B8", sky2: "#FFF4EA", ground: "#B7A27A" },
  { body: "#0B2744", stripe: "#F47A20", sky1: "#B9D7EC", sky2: "#E9F2F9", ground: "#8DB38A" },
  { body: "#E8EEF4", stripe: "#2E7D32", sky1: "#D4ECD5", sky2: "#F3FAF3", ground: "#7FA87A" },
];

function exterior(type, p, i) {
  const t = types[type];
  const W = 640, H = 400;
  const x0 = (W - t.len) / 2, y0 = 300 - t.h;
  const win = [];
  const ww = (t.len - 90) / t.windows;
  for (let k = 0; k < t.windows; k++) {
    win.push(`<rect x="${x0 + 70 + k * ww}" y="${y0 + 20}" width="${ww - 8}" height="${t.h * 0.32}" rx="5" fill="#2B4A66" opacity=".85"/>`);
  }
  const hills = i % 2 === 0
    ? `<path d="M0 270 Q120 190 240 250 T480 230 T640 250 V400 H0Z" fill="${p.ground}" opacity=".55"/>`
    : `<path d="M0 260 L110 180 L200 250 L330 160 L460 245 L560 200 L640 240 V400 H0Z" fill="${p.ground}" opacity=".5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky1}"/><stop offset="1" stop-color="${p.sky2}"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#s)"/>
<circle cx="${520 - i * 40}" cy="80" r="34" fill="#FFF7D6" opacity=".9"/>
${hills}
<rect x="0" y="300" width="${W}" height="100" fill="#5B6670"/>
<rect x="0" y="345" width="${W}" height="6" fill="#E6E9ED" opacity=".7" stroke-dasharray="30 20"/>
<g>
<path d="M${x0} ${y0 + t.h} V${y0 + t.roof * 0.4} Q${x0} ${y0} ${x0 + 30} ${y0} H${x0 + t.len - t.roof} Q${x0 + t.len - 6} ${y0 + 4} ${x0 + t.len} ${y0 + t.roof + 30} V${y0 + t.h} Z" fill="${p.body}" stroke="#1F2937" stroke-opacity=".25" stroke-width="2"/>
${win.join("")}
<path d="M${x0 + t.len - t.roof - 8} ${y0 + 20} H${x0 + t.len - 18} L${x0 + t.len - 6} ${y0 + t.roof + 34} H${x0 + t.len - t.roof - 8} Z" fill="#2B4A66" opacity=".8"/>
<rect x="${x0}" y="${y0 + t.h * 0.62}" width="${t.len}" height="10" fill="${p.stripe}"/>
<rect x="${x0}" y="${y0 + t.h * 0.62 + 14}" width="${t.len}" height="4" fill="${p.stripe}" opacity=".6"/>
<rect x="${x0 + t.len - 10}" y="${y0 + t.h - 34}" width="10" height="12" rx="2" fill="#FFE08A"/>
<rect x="${x0}" y="${y0 + t.h - 34}" width="8" height="12" rx="2" fill="#E5484D"/>
</g>
${[x0 + 70, x0 + t.len - 80].map((cx) => `<circle cx="${cx}" cy="${y0 + t.h}" r="28" fill="#1F2937"/><circle cx="${cx}" cy="${y0 + t.h}" r="12" fill="#C9CED6"/>`).join("")}
</svg>`;
}

function interior(p, i) {
  const rows = [];
  for (let r = 0; r < 5; r++) {
    const y = 120 + r * 50, s = 1 - r * 0.12, w = 120 * s, cx = 320;
    for (const side of [-1, 1]) {
      const x = cx + side * (40 + r * 4) + (side < 0 ? -w : 0);
      rows.push(`<rect x="${x}" y="${y}" width="${w}" height="${44 * s}" rx="10" fill="${p.stripe}" opacity="${0.95 - r * 0.12}"/>`);
      rows.push(`<rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${14 * s}" rx="5" fill="#FFFFFF" opacity=".35"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
<rect width="640" height="400" fill="#E9EDF2"/>
<path d="M0 0 H640 L520 110 H120 Z" fill="#D5DCE4"/>
<rect x="150" y="20" width="340" height="14" rx="7" fill="#FFF6D8"/>
<path d="M0 400 L200 110 H440 L640 400 Z" fill="#C8CFD8"/>
<rect x="20" y="60" width="90" height="160" rx="10" fill="#9EC3E3" opacity=".8"/>
<rect x="530" y="60" width="90" height="160" rx="10" fill="#9EC3E3" opacity=".8"/>
${rows.reverse().join("")}
<text x="620" y="388" text-anchor="end" font-family="sans-serif" font-size="12" fill="#6B7280">Interior · sample ${i + 1}</text>
</svg>`;
}

let count = 0;
for (const type of Object.keys(types)) {
  palettes.forEach((p, i) => {
    writeFileSync(new URL(`${type}-${i + 1}.svg`, out), exterior(type, p, i));
    count++;
  });
}
palettes.forEach((p, i) => { writeFileSync(new URL(`interior-${i + 1}.svg`, out), interior(p, i)); count++; });
console.log(`generated ${count} images`);
