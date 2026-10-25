"use client";
import { useRef, forwardRef, useImperativeHandle, useState } from "react";

export interface WellHandle {
  triggerRipple: () => void;
  triggerCoinDrop: () => void;
}

// Overlay coordinates match the 720×640 render in art/well.py (shown at half size).
// Water centre from the script's WATER_POS; radii trimmed to the opening the capstones leave visible.
const W = 360;
const H = 320;
const WATER = { cx: 180, cy: 182, rx: 48, ry: 15 };
const COIN_START_Y = 70;

const WishingWellSVG = forwardRef<WellHandle>((_, ref) => {
  const [coins, setCoins] = useState<{ id: number; x: number }[]>([]);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const coinId = useRef(0);
  const rippleId = useRef(0);

  function spawnRipple() {
    const id = rippleId.current++;
    setRipples(r => [...r, { id }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 1800);
  }

  function spawnCoinDrop() {
    const id = coinId.current++;
    const x = WATER.cx + (Math.random() - 0.5) * 40;
    setCoins(c => [...c, { id, x }]);
    setTimeout(() => {
      setCoins(c => c.filter(coin => coin.id !== id));
      spawnRipple();
    }, 900);
  }

  useImperativeHandle(ref, () => ({
    triggerRipple: spawnRipple,
    triggerCoinDrop: spawnCoinDrop,
  }));

  return (
    <div style={{ position: "relative", width: `min(${W}px, 100%)`, aspectRatio: `${W} / ${H}`, margin: "0 auto 24px" }}>
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

        {/* Falling coins */}
        {coins.map(coin => (
          <image key={coin.id} href="/art/coin.webp" width="26" height="26"
            x={coin.x - 13} y={COIN_START_Y}
            style={{
              transformBox: "fill-box", transformOrigin: "center",
              animation: "coinFall 0.9s cubic-bezier(0.5,0,1,1) forwards",
            }}
          />
        ))}
      </svg>
    </div>
  );
});

WishingWellSVG.displayName = "WishingWellSVG";
export default WishingWellSVG;
