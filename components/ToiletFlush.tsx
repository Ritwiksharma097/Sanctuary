"use client";
import { useEffect, useRef, useState } from "react";

// The end of Let Go: what's left of the letter is tossed into a toilet, and the
// visitor flushes it away. Toilet, lever (up and pressed) and scrap are Blender
// renders (art/toilet.py) shown at half size; the toss, splash, swirl and
// refill are drawn here over the bowl's water.

const W = 260;
const H = 280;
// Water centre from the script's WATER_CENTER; radii trimmed to what the rim leaves visible
const WATER = { cx: 124, cy: 159, rx: 31, ry: 14 };

const TOSS_MS = 1100;
const FLUSH_MS = 3400;
const REFILL_MS = 1200;

type Stage = "toss" | "waiting" | "flushing" | "refill" | "gone";

function quad(a: number, c: number, b: number, s: number) {
  return (1 - s) * (1 - s) * a + 2 * (1 - s) * s * c + s * s * b;
}

export default function ToiletFlush({ onFlushStart, onDone }: { onFlushStart?: () => void; onDone?: () => void }) {
  const [stage, setStage] = useState<Stage>("toss");
  const [t, setT] = useState(0);              // ms since the current stage began
  const stageStart = useRef(performance.now());
  const cbs = useRef({ onFlushStart, onDone });
  cbs.current = { onFlushStart, onDone };

  useEffect(() => {
    stageStart.current = performance.now();
    setT(0);
    if (stage === "gone") return;
    let raf = requestAnimationFrame(function tick(now) {
      const el = now - stageStart.current;
      setT(el);
      if (stage === "toss" && el >= TOSS_MS + 500) return setStage("waiting");
      if (stage === "flushing" && el >= FLUSH_MS) return setStage("refill");
      if (stage === "refill" && el >= REFILL_MS) { setStage("gone"); cbs.current.onDone?.(); return; }
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  function flush() {
    cbs.current.onFlushStart?.();
    setStage("flushing");
  }

  const { cx, cy, rx, ry } = WATER;
  const layer: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

  // Scrap position by stage
  let scrap: { x: number; y: number; size: number; rot: number; opacity: number; clip: boolean } | null = null;
  if (stage === "toss") {
    if (t < TOSS_MS) {
      const s = t / TOSS_MS;
      const x = quad(cx - 70, cx - 40, cx + 4, s);
      const y = quad(-60, 30, cy, s);
      scrap = { x, y, size: 40 - s * 16, rot: s * 540, opacity: 1, clip: s > 0.55 };
    } else {
      const u = t - TOSS_MS;
      scrap = { x: cx + 4, y: cy + Math.sin(u / 160) * 1.2, size: 24, rot: 540 + Math.sin(u / 300) * 6, opacity: 1, clip: true };
    }
  } else if (stage === "waiting") {
    // Bob gently on the water until the flush
    const u = performance.now();
    scrap = { x: cx + 4, y: cy + Math.sin(u / 160) * 1.2, size: 24, rot: 540 + Math.sin(u / 300) * 6, opacity: 1, clip: true };
  } else if (stage === "flushing") {
    // Spiral in, accelerating, shrinking as it is pulled down
    const k = Math.min(1, t / (FLUSH_MS * 0.85));
    const ang = k * k * 18;
    const rad = (1 - k) ** 1.2;
    scrap = {
      x: cx + Math.cos(ang) * rx * 0.75 * rad,
      y: cy + Math.sin(ang) * ry * 0.75 * rad + k * 3,
      size: 24 * (1 - k * 0.85),
      rot: 540 + ang * 57,
      opacity: k > 0.92 ? (1 - k) / 0.08 : 1,
      clip: true,
    };
  }

  const flushK = stage === "flushing" ? Math.min(1, t / FLUSH_MS) : stage === "refill" || stage === "gone" ? 1 : 0;
  const swirl = stage === "flushing" ? Math.sin(Math.min(1, t / FLUSH_MS) * Math.PI) : 0;
  const refillK = stage === "refill" ? t / REFILL_MS : stage === "gone" ? 1 : 0;
  const leverDown = stage === "flushing" && t < 700;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      {/* Shown a little larger than the half-size render; overlays scale with the viewBox */}
      <div style={{ position: "relative", width: `min(${Math.round(W * 1.3)}px, 90vw)`, aspectRatio: `${W} / ${H}` }}>
        <img src="/art/toilet.webp" alt="" width={W} height={H} style={{ ...layer }} />
        <img src="/art/toilet-lever.webp" alt="" width={W} height={H} style={{ ...layer, opacity: leverDown ? 0 : 1 }} />
        <img src="/art/toilet-lever-down.webp" alt="" width={W} height={H} style={{ ...layer, opacity: leverDown ? 1 : 0 }} />

        <svg viewBox={`0 0 ${W} ${H}`} style={{ ...layer, overflow: "visible" }} aria-hidden>
          <defs>
            <clipPath id="bowlWater"><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
            {/* While falling in: visible above the water line, or within the water */}
            <clipPath id="bowlMouth">
              <rect x="-100" y="-200" width={W + 200} height={cy + 200} />
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
            </clipPath>
            <radialGradient id="vortex">
              <stop offset="0%" stopColor="rgba(10,30,50,0.85)" />
              <stop offset="60%" stopColor="rgba(40,80,110,0.35)" />
              <stop offset="100%" stopColor="rgba(80,130,170,0)" />
            </radialGradient>
          </defs>

          <g clipPath="url(#bowlWater)">
            {/* The vortex opens in the middle of the bowl */}
            {swirl > 0 && (
              <ellipse cx={cx} cy={cy + 2} rx={rx * 0.9 * swirl} ry={ry * 0.9 * swirl} fill="url(#vortex)" />
            )}
            {/* Swirl lines, spinning faster and tighter as the water goes */}
            {swirl > 0.05 && [0, 1, 2, 3].map(i => {
              const k = 0.95 - i * 0.2 - flushK * 0.25;
              return (
                <ellipse key={i} cx={cx} cy={cy} rx={rx * Math.max(0.1, k)} ry={ry * Math.max(0.1, k)}
                  fill="none" stroke={`rgba(230,245,255,${0.6 * swirl})`} strokeWidth="1.3"
                  strokeDasharray={`${16 - i * 3} ${8 + i * 2}`}
                  style={{ transformBox: "fill-box", transformOrigin: "center", animation: `swirl ${0.7 - i * 0.12}s linear infinite` }} />
              );
            })}
            {/* Fresh water rushing back in */}
            {refillK > 0 && refillK < 1 && (
              <ellipse cx={cx} cy={cy} rx={rx * refillK} ry={ry * refillK} fill="none"
                stroke={`rgba(220,240,255,${0.7 * (1 - refillK)})`} strokeWidth="2" />
            )}
            {/* Splash ripple after the toss lands */}
            {stage === "toss" && t > TOSS_MS && t < TOSS_MS + 900 && [0, 1].map(i => {
              const k = Math.min(1, (t - TOSS_MS - i * 200) / 700);
              return k > 0 && (
                <ellipse key={i} cx={cx + 4} cy={cy} rx={rx * k} ry={ry * k} fill="none"
                  stroke={`rgba(230,245,255,${0.8 * (1 - k)})`} strokeWidth="1.5" />
              );
            })}
          </g>

          {/* Droplets thrown up by the toss */}
          {stage === "toss" && t > TOSS_MS && t < TOSS_MS + 500 && [-2, -1, 0, 1, 2, 3].map(i => {
            const u = t - TOSS_MS;
            const x = cx + 4 + i * 0.03 * u;
            const y = cy - (0.17 - Math.abs(i) * 0.015) * u + 0.0007 * u * u;
            return y < cy + 1 && <circle key={i} cx={x} cy={y} r={1.6} fill="rgba(230,245,255,0.9)" opacity={1 - u / 500} />;
          })}

          {scrap && (
            <g clipPath={scrap.clip ? "url(#bowlMouth)" : undefined} opacity={scrap.opacity}>
              <image href="/art/scrap.webp" width={scrap.size} height={scrap.size}
                x={scrap.x - scrap.size / 2} y={scrap.y - scrap.size / 2}
                transform={`rotate(${scrap.rot} ${scrap.x} ${scrap.y})`} />
            </g>
          )}
        </svg>
      </div>

      <div style={{ minHeight: "90px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
        {stage === "waiting" && (
          <>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontStyle: "italic", color: "var(--stone-light)", animation: "fadeInUp 0.5s ease forwards" }}>
              One last thing.
            </p>
            <button
              onClick={flush}
              style={{
                padding: "14px 40px", borderRadius: "999px",
                background: "var(--gold)", color: "var(--night)",
                fontFamily: "var(--font-serif)", fontSize: "17px",
                border: "none", cursor: "pointer", letterSpacing: "0.05em",
                animation: "fadeInUp 0.6s ease forwards",
              }}
            >
              Flush it and forget it
            </button>
          </>
        )}
        {(stage === "flushing" || stage === "refill") && (
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontStyle: "italic", color: "var(--stone-light)", letterSpacing: "0.04em" }}>
            {stage === "refill" ? "Gone." : flushK < 0.5 ? "Going…" : "Almost gone…"}
          </p>
        )}
      </div>
    </div>
  );
}
