// Generates every SVG in assets/ from scripts/profile.ts, in a dark and a light variant.
// Run with plain Node (22.18+ strips the TypeScript types natively): node scripts/build.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { profile, type Project } from "./profile.ts";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");

interface Theme {
  name: "dark" | "light";
  skyTop: string;
  skyBottom: string;
  border: string;
  termBg: string;
  termBar: string;
  text: string;
  muted: string;
  prompt: string;
  accent: string;
  accent2: string;
  star: string;
  moon: string;
  cardBg: string;
  pillBg: string;
}

const themes: Theme[] = [
  {
    name: "dark",
    skyTop: "#0b1020",
    skyBottom: "#1a1640",
    border: "#30363d",
    termBg: "#0d1117",
    termBar: "#161b22",
    text: "#e6edf3",
    muted: "#8b949e",
    prompt: "#7ee787",
    accent: "#f5c451",
    accent2: "#a78bfa",
    star: "#ffffff",
    moon: "#f5d98b",
    cardBg: "#0d1117",
    pillBg: "#161b22",
  },
  {
    name: "light",
    skyTop: "#fdf2e3",
    skyBottom: "#e8e4ff",
    border: "#d0d7de",
    termBg: "#ffffff",
    termBar: "#f6f8fa",
    text: "#1f2328",
    muted: "#59636e",
    prompt: "#1a7f37",
    accent: "#bf8700",
    accent2: "#6639ba",
    star: "#8c7ae6",
    moon: "#e3b341",
    cardBg: "#ffffff",
    pillBg: "#f6f8fa",
  },
];

const languageColors: Record<Project["language"], string> = {
  "C#": "#178600",
  Rust: "#dea584",
  TypeScript: "#3178c6",
};

const mono = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const r1 = (n: number) => Math.round(n * 10) / 10;

// Deterministic pseudo-random so rebuilding without profile changes yields identical files.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// ---------------------------------------------------------------- header

function header(t: Theme): string {
  const W = 900;
  const H = 280;
  const fontSize = 14;
  const charW = fontSize * 0.6;
  const typeSpeed = 0.055; // seconds per character
  const termX = 32;
  const termY = 36;
  const termW = 540;
  const termH = 208;
  const textX = termX + 22;
  const prompt = "~ ❯ ";

  // Everything is fully visible by default, so renderers that don't animate (or show the
  // first frame of a static capture) still get the finished terminal. The animations all start
  // at t=0 and hide content until its moment in one shared timeline of length `total`.
  const steps: { kind: "type" | "show"; at: number; i: number; widths?: number[]; step?: number }[] = [];
  let clock = 0.6;
  profile.terminal.forEach((entry, i) => {
    const widths = Array.from({ length: entry.cmd.length + 1 }, (_, k) => r1((prompt.length + k) * charW + 2));
    steps.push({ kind: "type", at: clock, i, widths, step: typeSpeed });
    clock += entry.cmd.length * typeSpeed + 0.35;
    steps.push({ kind: "show", at: clock, i });
    clock += 0.6;
  });
  const cursorAt = clock;
  const total = r1(clock + 0.1);
  const kt = (sec: number) => (Math.round((sec / total) * 10000) / 10000).toString();
  const reveal = (at: number) =>
    `<animate attributeName="opacity" values="0;1" keyTimes="0;${kt(at)}" calcMode="discrete" dur="${total}s" fill="freeze"/>`;

  let y = termY + 68;
  const lines: string[] = [];
  const clips: string[] = [];

  profile.terminal.forEach((entry, i) => {
    const type = steps.find((s) => s.kind === "type" && s.i === i)!;
    const show = steps.find((s) => s.kind === "show" && s.i === i)!;
    const values = ["0", ...type.widths!.map(String)].join(";");
    const times = ["0", ...type.widths!.map((_, k) => kt(type.at + k * type.step!))].join(";");
    clips.push(
      `<clipPath id="type${i}"><rect x="${textX}" y="${y - 16}" height="22" width="${termW}">` +
        `<animate attributeName="width" values="${values}" keyTimes="${times}" calcMode="discrete" dur="${total}s" fill="freeze"/>` +
        `</rect></clipPath>`,
    );
    lines.push(
      `<g clip-path="url(#type${i})"><text x="${textX}" y="${y}" class="m">` +
        `<tspan fill="${t.prompt}">${esc(prompt)}</tspan><tspan fill="${t.text}">${esc(entry.cmd)}</tspan></text></g>`,
    );
    lines.push(`<text x="${textX}" y="${y + 22}" class="m" fill="${t.muted}">${esc(entry.out)}${reveal(show.at)}</text>`);
    y += 54;
  });

  const cursorX = textX + prompt.length * charW;
  lines.push(
    `<g>${reveal(cursorAt)}` +
      `<text x="${textX}" y="${y}" class="m" fill="${t.prompt}">${esc(prompt)}</text>` +
      `<rect x="${r1(cursorX)}" y="${y - 13}" width="8" height="16" fill="${t.accent}">` +
      `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/></rect></g>`,
  );

  const rand = rng(42);
  const stars: string[] = [];
  for (let i = 0; i < 46; i++) {
    const sx = r1(termX + termW + 30 + rand() * (W - termX - termW - 50));
    const sy = r1(16 + rand() * (H - 32));
    const sr = r1(0.6 + rand() * 1.3);
    const dur = r1(2 + rand() * 4);
    const delay = r1(rand() * 4);
    stars.push(
      `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${t.star}" opacity="0.35">` +
        `<animate attributeName="opacity" values="0.15;0.95;0.15" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></circle>`,
    );
  }

  const skyCx = (termX + termW + W) / 2 + 6;
  const moonX = skyCx;
  const moonY = 92;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
<title id="title">${esc(profile.name)}: ${esc(profile.terminal.map((l) => l.out).join(". "))}</title>
<style>
  .m { font: ${fontSize}px ${mono}; white-space: pre; }
  .name { font: 700 26px ${sans}; }
  .handle { font: 500 15px ${mono}; }
  .float { animation: float 6s ease-in-out infinite; }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @media (prefers-reduced-motion: reduce) { .float { animation: none; } }
</style>
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${t.skyTop}"/><stop offset="1" stop-color="${t.skyBottom}"/>
  </linearGradient>
  <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/>
  </linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="${t.moon}" stop-opacity="0.45"/><stop offset="1" stop-color="${t.moon}" stop-opacity="0"/></radialGradient>
  <mask id="crescent"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${moonX + 16}" cy="${moonY - 10}" r="32" fill="#000"/></mask>
  ${clips.join("\n  ")}
</defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#sky)" stroke="${t.border}"/>
${stars.join("\n")}
<g class="float">
  <circle cx="${moonX}" cy="${moonY}" r="70" fill="url(#glow)"/>
  <circle cx="${moonX}" cy="${moonY}" r="34" fill="${t.moon}" mask="url(#crescent)"/>
</g>
<text x="${skyCx}" y="${H - 82}" text-anchor="middle" class="name" fill="${t.text}">${esc(profile.name)}</text>
<rect x="${skyCx - 60}" y="${H - 70}" width="120" height="3" rx="1.5" fill="url(#accent)"/>
<text x="${skyCx}" y="${H - 42}" text-anchor="middle" class="handle" fill="${t.muted}">@${esc(profile.handle)}</text>
<g>
  <rect x="${termX}" y="${termY}" width="${termW}" height="${termH}" rx="10" fill="${t.termBg}" stroke="${t.border}"/>
  <path d="M${termX} ${termY + 10}a10 10 0 0 1 10-10h${termW - 20}a10 10 0 0 1 10 10v20h-${termW}z" fill="${t.termBar}"/>
  <line x1="${termX}" y1="${termY + 30}" x2="${termX + termW}" y2="${termY + 30}" stroke="${t.border}"/>
  <circle cx="${termX + 18}" cy="${termY + 15}" r="5.5" fill="#ff5f57"/>
  <circle cx="${termX + 36}" cy="${termY + 15}" r="5.5" fill="#febc2e"/>
  <circle cx="${termX + 54}" cy="${termY + 15}" r="5.5" fill="#28c840"/>
  <text x="${termX + termW / 2}" y="${termY + 19.5}" text-anchor="middle" font-family="${esc(mono)}" font-size="12" fill="${t.muted}">${esc(profile.handle)} — zsh</text>
  ${lines.join("\n  ")}
</g>
</svg>
`;
}

// ---------------------------------------------------------------- project cards

const icons: Record<Project["icon"], (c: string) => string> = {
  moon: (c) => `<path d="M30 14a12 12 0 1 0 6 18 10 10 0 0 1-6-18z" fill="${c}"/>`,
  sliders: (c) =>
    `<g stroke="${c}" stroke-width="2.4" stroke-linecap="round"><path d="M13 16h22M13 24h22M13 32h22"/></g>` +
    `<g fill="${c}"><circle cx="19" cy="16" r="3.6"/><circle cx="29" cy="24" r="3.6"/><circle cx="22" cy="32" r="3.6"/></g>`,
  bolt: (c) => `<path d="M27 11 15 27h8l-2 10 12-16h-8z" fill="${c}"/>`,
  nodes: (c) =>
    `<g stroke="${c}" stroke-width="2"><path d="M24 14 14 32h20z" fill="none"/></g>` +
    `<g fill="${c}"><circle cx="24" cy="14" r="4"/><circle cx="14" cy="32" r="4"/><circle cx="34" cy="32" r="4"/></g>`,
};

function wrap(text: string, maxChars: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > maxChars) {
      out.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out;
}

function card(p: Project, t: Theme): string {
  const W = 440;
  const H = 150;
  const lines = wrap(p.tagline, 50).slice(0, 3);
  const langColor = languageColors[p.language];
  const nameWidth = p.name.length * 10.4;
  const status = p.status
    ? `<rect x="${r1(96 + nameWidth)}" y="22" width="${p.status.length * 7.5 + 16}" height="20" rx="10" fill="none" stroke="${t.border}"/>` +
      `<text x="${r1(104 + nameWidth)}" y="36" font-family="${esc(mono)}" font-size="11" fill="${t.muted}">${esc(p.status)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
<title id="title">${esc(p.name)}: ${esc(p.tagline)}</title>
<defs>
  <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${t.accent}" stop-opacity="0.22"/><stop offset="1" stop-color="${t.accent2}" stop-opacity="0.22"/>
  </linearGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/>
  </linearGradient>
  <clipPath id="shape"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12"/></clipPath>
</defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.cardBg}" stroke="${t.border}"/>
<rect width="${W}" height="3" fill="url(#edge)" clip-path="url(#shape)"/>
<g transform="translate(24 20)"><rect width="48" height="48" rx="12" fill="url(#tile)"/>${icons[p.icon](t.accent)}</g>
<text x="88" y="38" font-family="${esc(sans)}" font-size="18" font-weight="700" fill="${t.text}">${esc(p.name)}</text>
${status}
${lines.map((l, i) => `<text x="88" y="${64 + i * 19}" font-family="${esc(sans)}" font-size="13" fill="${t.muted}">${esc(l)}</text>`).join("\n")}
<circle cx="94" cy="${H - 22}" r="6" fill="${langColor}"/>
<text x="106" y="${H - 17.5}" font-family="${esc(sans)}" font-size="12.5" fill="${t.muted}">${esc(p.language)}</text>
</svg>
`;
}

// ---------------------------------------------------------------- stack pills

function stack(t: Theme): string {
  const W = 900;
  const charW = 13 * 0.6;
  const gap = 10;
  const pills = profile.stack.map((s) => ({ label: s, w: r1(s.length * charW + 30) }));

  const rows: (typeof pills)[] = [[]];
  let rowW = 0;
  for (const p of pills) {
    if (rowW + p.w > W && rows.at(-1)!.length) {
      rows.push([]);
      rowW = 0;
    }
    rows.at(-1)!.push(p);
    rowW += p.w + gap;
  }

  const H = rows.length * 46 - 10 + 2;
  let i = 0;
  const parts = rows.flatMap((row, r) => {
    const total = row.reduce((a, p) => a + p.w, 0) + gap * (row.length - 1);
    let x = (W - total) / 2;
    return row.map((p) => {
      const g =
        `<g>` +
        `<rect x="${r1(x)}" y="${r * 46 + 1}" width="${p.w}" height="34" rx="17" fill="${t.pillBg}" stroke="${t.border}"/>` +
        `<circle cx="${r1(x + 14)}" cy="${r * 46 + 18}" r="3" fill="${i % 2 ? t.accent2 : t.accent}"/>` +
        `<text x="${r1(x + 22)}" y="${r * 46 + 22.5}" font-family="${esc(mono)}" font-size="13" fill="${t.text}">${esc(p.label)}</text></g>`;
      x += p.w + gap;
      i++;
      return g;
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
<title id="title">Stack: ${esc(profile.stack.join(", "))}</title>
${parts.join("\n")}
</svg>
`;
}

// ---------------------------------------------------------------- write

mkdirSync(outDir, { recursive: true });
const written: string[] = [];
const emit = (file: string, svg: string) => {
  writeFileSync(join(outDir, file), svg);
  written.push(file);
};

for (const t of themes) {
  emit(`header-${t.name}.svg`, header(t));
  emit(`stack-${t.name}.svg`, stack(t));
  for (const p of profile.projects) emit(`card-${p.name}-${t.name}.svg`, card(p, t));
}
console.log(`Wrote ${written.length} files to assets/`);
