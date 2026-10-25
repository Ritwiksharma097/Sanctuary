"use client";
import { useEffect, useRef, useState } from "react";

// A letter on paper that can be set alight. Until it is lit it is just a page to
// read (it grows to fit the letter). When `armed` (a lit match is in hand) and the
// pointer touches the paper, it catches at that spot: a noise-based burn map
// spreads out from there. Ahead of the front the paper scorches, at the front it
// glows and chars, and behind it the paper is gone. Flames, sparks, ash and smoke
// are particles emitted from the burning edge.

const PAPER_W = 320;
const MIN_PAPER_H = 300;
const MAX_PAPER_H = 760;
const PAD_X = 50;      // room either side for flames to lick outward
const PAD_TOP = 150;   // room above for flames, smoke and ash to rise
const PAD_BOTTOM = 20;
const CANVAS_W = PAPER_W + PAD_X * 2;
const DURATION = 7000;

const MARGIN = 26;
const LINE_H = 22;
const PHOTO_H = 110;
const FONT = (scale: number) => `italic ${17 * scale}px 'Cormorant Garamond', Georgia, serif`;

// Bands of the burn front, in burn-map units
const SCORCH = 0.09;
const CHAR = 0.025;
const EMBER = 0.012;

type Particle = {
  kind: "flame" | "spark" | "ash" | "smoke";
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; spin: number;
};

// Small value-noise + fbm, enough for an organic burn edge
function makeNoise(seed: number) {
  const perm = new Uint8Array(512);
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const vals = Array.from({ length: 256 }, () => rand());
  const fade = (t: number) => t * t * (3 - 2 * t);
  const v = (x: number, y: number) => vals[perm[(x & 255) + perm[y & 255]]];
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = fade(x - xi), yf = fade(y - yi);
    const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (x: number, y: number) => {
    let sum = 0, amp = 0.5, f = 1;
    for (let o = 0; o < 5; o++) { sum += amp * noise(x * f, y * f); amp *= 0.5; f *= 2.1; }
    return sum;
  };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    }
    lines.push(line);
  }
  return lines;
}

function letterText(letter: string, name: string) {
  return (name ? `Dear ${name},\n\n` : "") + letter;
}

/** Paper height (CSS px) that fits the whole letter, within limits. */
function measurePaperHeight(letter: string, name: string, photo: string | null) {
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = FONT(1);
  const lines = wrapText(ctx, letterText(letter, name), PAPER_W - MARGIN * 2).length;
  const h = MARGIN * 2 + lines * LINE_H + (photo ? PHOTO_H : 0);
  return Math.max(MIN_PAPER_H, Math.min(MAX_PAPER_H, Math.ceil(h)));
}

async function drawPaper(ctx: CanvasRenderingContext2D, scale: number, paperH: number, letter: string, name: string, photo: string | null) {
  const w = PAPER_W * scale, h = paperH * scale;
  // Parchment base with darker, browner edges
  const g = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.15, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
  g.addColorStop(0, "#f3e6c6");
  g.addColorStop(0.7, "#e6d2a4");
  g.addColorStop(1, "#c9ad75");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Fibres and blotches
  const noise = makeNoise(7);
  const img = ctx.getImageData(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = noise(x / (40 * scale), y / (40 * scale)) - 0.5;
      const fibre = Math.sin((x * 0.9 + y * 0.12) / scale + n * 6) * 1.5;
      const i = (y * w + x) * 4;
      const d = n * 34 + fibre;
      img.data[i] += d; img.data[i + 1] += d; img.data[i + 2] += d * 0.8;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Handwriting-ish text
  await document.fonts?.ready;
  ctx.fillStyle = "rgba(40,28,18,0.88)";
  ctx.font = FONT(scale);
  ctx.textBaseline = "top";
  const margin = MARGIN * scale;
  let y = margin;
  const lines = wrapText(ctx, letterText(letter, name), w - margin * 2);
  const maxY = photo ? h - PHOTO_H * scale : h - margin;
  for (const line of lines) {
    if (y + 20 * scale > maxY) { ctx.fillText("…", margin, y); break; }
    ctx.fillText(line, margin, y);
    y += LINE_H * scale;
  }
  if (photo) {
    const im = new Image();
    im.src = photo;
    await im.decode().catch(() => {});
    const ph = 80 * scale, pw = 80 * scale;
    ctx.save();
    ctx.translate(margin + pw / 2, h - margin - ph / 2);
    ctx.rotate(-0.05);
    ctx.fillStyle = "#fbf7ee";
    ctx.fillRect(-pw / 2 - 5 * scale, -ph / 2 - 5 * scale, pw + 10 * scale, ph + 10 * scale);
    const r = Math.min(im.width / pw, im.height / ph) || 1;
    ctx.drawImage(im, (im.width - pw * r) / 2, (im.height - ph * r) / 2, pw * r, ph * r, -pw / 2, -ph / 2, pw, ph);
    ctx.restore();
  }
}

export default function BurningLetter({ letter, name, photo, armed = false, onIgnite, onProgress, onDone }: {
  letter: string;
  name: string;
  photo: string | null;
  /** A lit match is in hand: touching the paper sets it alight */
  armed?: boolean;
  onIgnite?: () => void;
  onProgress?: (p: number) => void;
  onDone?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paperH, setPaperH] = useState(MIN_PAPER_H);
  const cbs = useRef({ onIgnite, onProgress, onDone });
  cbs.current = { onIgnite, onProgress, onDone };
  const ignite = useRef<((x: number, y: number) => void) | null>(null);
  const lit = useRef(false);

  const canvasH = paperH + PAD_TOP + PAD_BOTTOM;

  useEffect(() => {
    setPaperH(measurePaperHeight(letter, name, photo));
  }, [letter, name, photo]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_W * scale;
    canvas.height = canvasH * scale;
    const ctx = canvas.getContext("2d")!;
    const pw = PAPER_W * scale, ph = paperH * scale;
    const px = PAD_X * scale, py = PAD_TOP * scale;

    let raf = 0;
    let cancelled = false;
    lit.current = false;

    (async () => {
      // Paper on an offscreen canvas, read back once
      const paperCanvas = document.createElement("canvas");
      paperCanvas.width = pw; paperCanvas.height = ph;
      const pctx = paperCanvas.getContext("2d", { willReadFrequently: true })!;
      await drawPaper(pctx, scale, paperH, letter, name, photo);
      if (cancelled) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(paperCanvas, px, py);
      const paper = pctx.getImageData(0, 0, pw, ph);
      const out = pctx.createImageData(pw, ph);

      ignite.current = (fx: number, fy: number) => {
        if (lit.current) return;
        lit.current = true;
        cbs.current.onIgnite?.();
        burn(fx * pw, fy * ph);
      };

      function burn(ix: number, iy: number) {
        // Burn map: distance from where the match touched, roughened by noise
        const noise = makeNoise(Math.floor(Math.random() * 1e6) + 1);
        const map = new Float32Array(pw * ph);
        const diag = Math.hypot(pw, ph);
        let maxV = 0;
        for (let y = 0; y < ph; y++) {
          for (let x = 0; x < pw; x++) {
            const d = Math.hypot(x - ix, (y - iy) * 1.1) / diag;
            const v = d * 0.9 + noise(x / (55 * scale), y / (55 * scale)) * 0.42;
            map[y * pw + x] = v;
            if (v > maxV) maxV = v;
          }
        }
        let minV = Infinity;
        for (let i = 0; i < map.length; i++) { map[i] /= maxV; if (map[i] < minV) minV = map[i]; }
        // Shift so the touched spot is the first to go
        for (let i = 0; i < map.length; i++) map[i] = (map[i] - minV) / (1 - minV);

        const particles: Particle[] = [];
        const start = performance.now();
        let lastReport = -1;
        let finishedAt = 0;

        const emit = (kind: Particle["kind"], x: number, y: number) => {
          const r = Math.random;
          const base = { x, y, life: 0, spin: r() * 6 };
          if (kind === "flame") particles.push({ ...base, kind, vx: (r() - 0.5) * 0.6 * scale, vy: -(1.6 + r() * 2.2) * scale, max: 34 + r() * 34, size: (10 + r() * 12) * scale });
          if (kind === "spark") particles.push({ ...base, kind, vx: (r() - 0.5) * 2.4 * scale, vy: -(2 + r() * 3) * scale, max: 30 + r() * 40, size: (0.8 + r() * 1.2) * scale });
          if (kind === "ash") particles.push({ ...base, kind, vx: (r() - 0.5) * 0.8 * scale, vy: -(0.5 + r() * 1.1) * scale, max: 90 + r() * 80, size: (1.5 + r() * 3) * scale });
          if (kind === "smoke") particles.push({ ...base, kind, vx: (r() - 0.5) * 0.4 * scale, vy: -(0.6 + r() * 0.6) * scale, max: 110 + r() * 60, size: (12 + r() * 14) * scale });
        };

        const frame = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          // Slow catch, steady burn, quick finish
          const front = t < 0.12 ? (t / 0.12) ** 2 * 0.06 : 0.06 + (t - 0.12) / 0.88 * 1.02;

          // Paper pixels
          const src = paper.data, dst = out.data;
          const edge: number[] = [];
          for (let i = 0, p = 0; i < map.length; i++, p += 4) {
            const d = map[i] - front;
            if (d < 0) { dst[p + 3] = 0; continue; }
            let r = src[p], g = src[p + 1], b = src[p + 2];
            if (d < SCORCH) {
              // Brown scorch deepening toward the char line
              const k = 1 - d / SCORCH;
              r *= 1 - 0.45 * k; g *= 1 - 0.6 * k; b *= 1 - 0.75 * k;
            }
            if (d < CHAR) {
              const k = 1 - d / CHAR;
              r *= 1 - 0.9 * k; g *= 1 - 0.92 * k; b *= 1 - 0.95 * k;
            }
            if (d < EMBER) {
              // Glowing edge: hot yellow at the very front, orange behind it
              const k = 1 - d / EMBER;
              const flick = 0.75 + 0.25 * Math.sin(now / 60 + i * 0.013);
              r += (255 - r) * k * flick; g += (150 + 80 * k - g) * k * flick; b += (40 - b) * k * 0.6;
              if (Math.random() < 0.006) edge.push(i);
            }
            dst[p] = r; dst[p + 1] = g; dst[p + 2] = b; dst[p + 3] = 255;
          }
          pctx.putImageData(out, 0, 0);

          // Emit particles from sampled points along the burning edge
          for (const i of edge) {
            const x = px + (i % pw), y = py + Math.floor(i / pw);
            emit("flame", x, y);
            if (Math.random() < 0.18) emit("spark", x, y);
            if (Math.random() < 0.12) emit("ash", x, y);
            if (Math.random() < 0.08) emit("smoke", x, y);
          }

          // Compose: smoke behind, paper, then additive fire on top
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (const p of particles) {
            if (p.kind !== "smoke") continue;
            const a = (1 - p.life / p.max) * 0.16;
            const s = p.size * (1 + p.life / p.max * 2.2);
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
            g.addColorStop(0, `rgba(70,64,62,${a})`);
            g.addColorStop(1, "rgba(70,64,62,0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2); ctx.fill();
          }
          ctx.drawImage(paperCanvas, px, py);
          for (const p of particles) {
            if (p.kind !== "ash") continue;
            const a = 1 - p.life / p.max;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.spin + p.life * 0.08);
            ctx.fillStyle = p.life < 12 ? `rgba(255,140,50,${a})` : `rgba(45,38,34,${a * 0.9})`;
            ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
            ctx.restore();
          }
          ctx.globalCompositeOperation = "lighter";
          for (const p of particles) {
            if (p.kind === "flame") {
              const k = p.life / p.max;
              const s = p.size * (1 - k * 0.7);
              const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
              const a = (1 - k) * 0.55;
              g.addColorStop(0, `rgba(255,${235 - k * 120},${150 - k * 140},${a})`);
              g.addColorStop(0.45, `rgba(255,${120 - k * 70},20,${a * 0.6})`);
              g.addColorStop(1, "rgba(200,40,10,0)");
              ctx.fillStyle = g;
              ctx.beginPath(); ctx.ellipse(p.x, p.y, s * 0.7, s, 0, 0, Math.PI * 2); ctx.fill();
            } else if (p.kind === "spark") {
              const a = 1 - p.life / p.max;
              ctx.fillStyle = `rgba(255,${200 - p.life * 2},90,${a})`;
              ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            }
          }
          ctx.globalCompositeOperation = "source-over";

          // Advance particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life++;
            if (p.kind === "ash") { p.vx += Math.sin(p.life * 0.09 + p.spin) * 0.03 * scale; }
            if (p.kind === "spark") { p.vx *= 0.98; p.vy += 0.02 * scale; }
            if (p.kind === "flame") { p.vx += (Math.random() - 0.5) * 0.15 * scale; }
            p.x += p.vx; p.y += p.vy;
            if (p.life >= p.max) particles.splice(i, 1);
          }

          const pct = Math.round(Math.min(1, front) * 20) / 20;
          if (pct !== lastReport) { lastReport = pct; cbs.current.onProgress?.(Math.min(1, front)); }

          if (front >= 1.02 && !finishedAt) finishedAt = now;
          // Let the last embers and smoke drift away before finishing
          if (finishedAt && (particles.length === 0 || now - finishedAt > 1600)) {
            cbs.current.onDone?.();
            return;
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      }
    })();

    return () => { cancelled = true; ignite.current = null; cancelAnimationFrame(raf); };
  }, [letter, name, photo, paperH, canvasH]);

  // With a lit match in hand, touching the paper (hovering, tapping or dragging onto it) lights it
  useEffect(() => {
    if (!armed) return;
    const tryLight = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !ignite.current || lit.current) return;
      const r = canvas.getBoundingClientRect();
      const k = r.width / CANVAS_W;                       // CSS px per canvas unit
      const fx = ((e.clientX - r.left) / k - PAD_X) / PAPER_W;
      const fy = ((e.clientY - r.top) / k - PAD_TOP) / paperH;
      if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) ignite.current(fx, fy);
    };
    window.addEventListener("pointermove", tryLight);
    window.addEventListener("pointerdown", tryLight);
    return () => {
      window.removeEventListener("pointermove", tryLight);
      window.removeEventListener("pointerdown", tryLight);
    };
  }, [armed, paperH]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${CANVAS_W}px`, maxWidth: "100%", height: "auto", aspectRatio: `${CANVAS_W} / ${canvasH}`, display: "block", marginTop: `-${PAD_TOP - 20}px` }}
      aria-label="Your letter"
    />
  );
}
