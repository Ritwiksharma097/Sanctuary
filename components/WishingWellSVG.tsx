"use client";
import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";

export interface WellHandle {
  triggerRipple: () => void;
  triggerCoinDrop: () => void;
}

// Overlay coordinates match the 720×640 render in art/well.py (shown at half size).
// Water centre from the script's WATER_POS; radii trimmed to the opening the capstones leave visible.
const W = 360;
const H = 320;
const WATER = { cx: 180, cy: 182, rx: 48, ry: 15 };

// A tossed coin: arcs up from the viewer's side, tumbles, drops into the opening,
// splashes, then glints as it sinks.
const FLIGHT_MS = 1100;
const SINK_MS = 900;
const SPLASH_MS = 650;

type Coin = { id: number; born: number; x0: number; x1: number; spins: number };
type Droplet = { vx: number; vy: number; r: number };
const DROPLETS: Droplet[] = Array.from({ length: 9 }, (_, i) => ({
  vx: (i - 4) * 0.028 + (i % 2 ? 0.006 : -0.006),
  vy: -0.16 - (i % 3) * 0.035,
  r: 1.2 + (i % 3) * 0.5,
}));

function quad(a: number, c: number, b: number, s: number) {
  return (1 - s) * (1 - s) * a + 2 * (1 - s) * s * c + s * s * b;
}

const WishingWellSVG = forwardRef<WellHandle>((_, ref) => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const [now, setNow] = useState(0);
  const coinId = useRef(0);
  const rippleId = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);

  function spawnRipple() {
    const id = rippleId.current++;
    setRipples(r => [...r, { id }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 1800);
  }

  function spawnCoinDrop() {
    // The toss button sits below the well: bring the well into view first so the throw is seen
    const rect = boxRef.current?.getBoundingClientRect();
    if (rect && (rect.top < 0 || rect.bottom > window.innerHeight)) {
      boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(throwCoin, 500);
    } else {
      throwCoin();
    }
  }

  function throwCoin() {
    const id = coinId.current++;
    setCoins(c => [...c, {
      id,
      born: performance.now(),
      x0: W * (0.86 + Math.random() * 0.1),
      x1: WATER.cx + (Math.random() - 0.5) * WATER.rx * 0.8,
      spins: 3 + Math.random() * 2,
    }]);
    setTimeout(spawnRipple, FLIGHT_MS);
    setTimeout(() => setCoins(c => c.filter(coin => coin.id !== id)), FLIGHT_MS + SINK_MS);
  }

  // Drive the coin animation frame by frame while any coin is in play
  useEffect(() => {
    if (!coins.length) return;
    let raf = requestAnimationFrame(function tick(t) {
      setNow(t);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [coins.length]);

  useImperativeHandle(ref, () => ({
    triggerRipple: spawnRipple,
    triggerCoinDrop: spawnCoinDrop,
  }));

  return (
    <div ref={boxRef} style={{ position: "relative", width: `min(${W}px, 100%)`, aspectRatio: `${W} / ${H}`, margin: "0 auto 24px" }}>
      {/* Moonlight pooling behind the well */}
      <div aria-hidden style={{
        position: "absolute", inset: "-10% -20%",
        background: "radial-gradient(ellipse at 50% 55%, rgba(120,150,220,0.14), transparent 60%)",
        pointerEvents: "none",
      }} />
      <img
        src="/art/well.webp"
        alt=""
        width={W}
        height={H}
        style={{ position: "relative", display: "block", width: "100%", height: "auto" }}
      />
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <clipPath id="wellWater">
            <ellipse cx={WATER.cx} cy={WATER.cy} rx={WATER.rx} ry={WATER.ry} />
          </clipPath>
          {/* While falling in, the coin shows above the water line or inside the opening,
              so the front rim appears to swallow it */}
          <clipPath id="wellMouth">
            <rect x="0" y="-200" width={W} height={WATER.cy + 200} />
            <ellipse cx={WATER.cx} cy={WATER.cy} rx={WATER.rx} ry={WATER.ry} />
          </clipPath>
          <radialGradient id="coinGlint">
            <stop offset="0%" stopColor="rgba(255,225,140,0.9)" />
            <stop offset="100%" stopColor="rgba(255,200,90,0)" />
          </radialGradient>
        </defs>

        {/* Ripples spread across the water surface */}
        <g clipPath="url(#wellWater)">
          {ripples.map(r => (
            <g key={r.id}>
              {[0, 0.25, 0.5].map((delay, i) => (
                <ellipse key={i} cx={WATER.cx} cy={WATER.cy} rx={WATER.rx} ry={WATER.ry}
                  fill="none" stroke={`rgba(170,205,255,${0.75 - i * 0.2})`} strokeWidth={2 - i * 0.4}
                  style={{
                    transformBox: "fill-box", transformOrigin: "center",
                    animation: `wellRipple 1.5s ease-out ${delay}s both`,
                  }} />
              ))}
            </g>
          ))}
        </g>

        {coins.map(coin => {
          const t = Math.max(0, now - coin.born);
          if (t < FLIGHT_MS) {
            // Quadratic arc from below-right, up over the rim, down into the water
            const s = t / FLIGHT_MS;
            const y0 = H * 0.98;
            const yc = 40;   // peaks under the roof, just above the rim
            const x = quad(coin.x0, (coin.x0 + coin.x1) / 2 + 20, coin.x1, s);
            const y = quad(y0, yc, WATER.cy, s);
            const descending = s > (y0 - yc) / (y0 - 2 * yc + WATER.cy);
            const size = 34 - s * 16;
            const flip = Math.cos(s * coin.spins * Math.PI * 2);
            return (
              <g key={coin.id} clipPath={descending ? "url(#wellMouth)" : undefined}>
                <g transform={`translate(${x} ${y}) rotate(${s * 160 - 40}) scale(1 ${Math.max(0.12, Math.abs(flip))})`}>
                  <image href="/art/coin.webp" width={size} height={size} x={-size / 2} y={-size / 2}
                    style={{ filter: flip > 0 ? "none" : "brightness(0.75)" }} />
                </g>
              </g>
            );
          }
          const u = t - FLIGHT_MS;
          return (
            <g key={coin.id}>
              {/* Splash: a flash on impact and droplets thrown up and falling back */}
              {u < 180 && (
                <ellipse cx={coin.x1} cy={WATER.cy} rx={14 + u * 0.08} ry={4 + u * 0.02}
                  fill="rgba(210,230,255,0.55)" opacity={1 - u / 180} />
              )}
              {u < SPLASH_MS && DROPLETS.map((d, i) => {
                const dx = coin.x1 + d.vx * u;
                const dy = WATER.cy + d.vy * u + 0.00045 * u * u;
                return dy <= WATER.cy + 2 && (
                  <circle key={i} cx={dx} cy={dy} r={d.r} fill="rgba(200,225,255,0.85)" opacity={1 - u / SPLASH_MS} />
                );
              })}
              {/* The coin sinking: a fading glint under the surface */}
              {u < SINK_MS && (
                <g clipPath="url(#wellWater)" opacity={1 - u / SINK_MS}>
                  <ellipse cx={coin.x1} cy={WATER.cy + (u / SINK_MS) * WATER.ry * 0.7} rx={9} ry={4} fill="url(#coinGlint)" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
});

WishingWellSVG.displayName = "WishingWellSVG";
export default WishingWellSVG;
