"use client";
import { useRef, forwardRef, useImperativeHandle, useState } from "react";

export interface WellHandle {
  triggerRipple: () => void;
  triggerCoinDrop: () => void;
}

const WishingWellSVG = forwardRef<WellHandle>((_, ref) => {
  const [coins, setCoins] = useState<{ id: number; x: number }[]>([]);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const coinId = useRef(0);
  const rippleId = useRef(0);

  function spawnRipple() {
    const id = rippleId.current++;
    setRipples(r => [...r, { id }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 1500);
  }

  function spawnCoinDrop() {
    const id = coinId.current++;
    const x = 115 + (Math.random() - 0.5) * 50;
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
    <div style={{ position: "relative", width: "260px", height: "220px", margin: "0 auto 32px" }}>
      <svg viewBox="0 0 260 220" width="260" height="220" aria-hidden style={{ display: "block", overflow: "visible" }}>
        <defs>
          <radialGradient id="waterGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2a4a7a" />
            <stop offset="100%" stopColor="#0d1f3a" />
          </radialGradient>
        </defs>

        {/* Roof posts */}
        <line x1="70" y1="38" x2="70" y2="14" stroke="#7a6a5a" strokeWidth="3" strokeLinecap="round"/>
        <line x1="190" y1="38" x2="190" y2="14" stroke="#7a6a5a" strokeWidth="3" strokeLinecap="round"/>
        <rect x="58" y="11" width="144" height="7" rx="3.5" fill="#6a5a48"/>
        <polygon points="40,40 130,8 220,40" fill="#4a3c2c"/>
        <polygon points="46,40 130,12 214,40" fill="#5a4a38"/>
        <line x1="40" y1="40" x2="220" y2="40" stroke="#3a2e20" strokeWidth="2"/>

        {/* Rope + bucket */}
        <line x1="130" y1="40" x2="130" y2="80" stroke="#9a8a78" strokeWidth="1.5" strokeDasharray="5,3"/>
        <rect x="116" y="80" width="28" height="20" rx="2" fill="#6a5a48"/>
        <line x1="116" y1="80" x2="144" y2="80" stroke="#4a3c2c" strokeWidth="2.5"/>

        {/* Well body */}
        <rect x="28" y="118" width="204" height="86" rx="6" fill="#2e2016"/>
        <rect x="24" y="112" width="212" height="20" rx="5" fill="#4e3c28"/>
        {/* Stone rows */}
        <rect x="34" y="136" width="42" height="11" rx="2" fill="#3e2e1c" opacity="0.8"/>
        <rect x="82" y="136" width="54" height="11" rx="2" fill="#342618" opacity="0.8"/>
        <rect x="142" y="136" width="46" height="11" rx="2" fill="#3e2e1c" opacity="0.8"/>
        <rect x="52" y="151" width="38" height="11" rx="2" fill="#342618" opacity="0.7"/>
        <rect x="96" y="151" width="62" height="11" rx="2" fill="#3e2e1c" opacity="0.7"/>
        <rect x="164" y="151" width="40" height="11" rx="2" fill="#342618" opacity="0.7"/>
        <rect x="34" y="166" width="50" height="11" rx="2" fill="#3e2e1c" opacity="0.6"/>
        <rect x="90" y="166" width="44" height="11" rx="2" fill="#342618" opacity="0.6"/>
        <rect x="140" y="166" width="52" height="11" rx="2" fill="#3e2e1c" opacity="0.6"/>
        {/* Moss */}
        <ellipse cx="40" cy="152" rx="12" ry="6" fill="#1e3a1e" opacity="0.55"/>
        <ellipse cx="215" cy="155" rx="9" ry="5" fill="#1e3a1e" opacity="0.45"/>

        {/* Water */}
        <ellipse cx="130" cy="136" rx="92" ry="14" fill="url(#waterGrad)"/>
        <ellipse cx="130" cy="136" rx="92" ry="14" fill="none" stroke="#3a6a9a" strokeWidth="1" opacity="0.5"/>
        <ellipse cx="98" cy="134" rx="22" ry="3.5" fill="#3a6aaa" opacity="0.4"
          style={{ animation: "waterShimmer 3s ease-in-out infinite" }}/>
        <ellipse cx="162" cy="137" rx="15" ry="2.5" fill="#3a6aaa" opacity="0.35"
          style={{ animation: "waterShimmer 4.5s ease-in-out infinite 1.2s" }}/>

        {/* Static coins on bottom */}
        <ellipse cx="100" cy="188" rx="9" ry="4.5" fill="#c9a84c" opacity="0.45"/>
        <ellipse cx="148" cy="192" rx="7.5" ry="3.5" fill="#c9a84c" opacity="0.38"/>
        <ellipse cx="124" cy="196" rx="6" ry="3" fill="#e8c97a" opacity="0.32"/>
        <ellipse cx="168" cy="186" rx="5.5" ry="2.5" fill="#c9a84c" opacity="0.38"/>
        <ellipse cx="84" cy="193" rx="6.5" ry="3" fill="#c9a84c" opacity="0.3"/>

        {/* Animated ripples */}
        {ripples.map(r => (
          <g key={r.id}>
            <ellipse cx="130" cy="136" rx="8" ry="4" fill="none"
              stroke="rgba(100,160,240,0.7)" strokeWidth="1.5"
              style={{ animation: "wellRipple 1.4s ease-out forwards" }}/>
            <ellipse cx="130" cy="136" rx="8" ry="4" fill="none"
              stroke="rgba(100,160,240,0.4)" strokeWidth="1"
              style={{ animation: "wellRipple 1.4s ease-out 0.2s forwards" }}/>
            <ellipse cx="130" cy="136" rx="8" ry="4" fill="none"
              stroke="rgba(100,160,240,0.2)" strokeWidth="1"
              style={{ animation: "wellRipple 1.4s ease-out 0.4s forwards" }}/>
          </g>
        ))}

        {/* Falling coins */}
        {coins.map(coin => (
          <text key={coin.id} fontSize="18" textAnchor="middle"
            x={coin.x} y="58"
            style={{ animation: "coinFall 0.9s cubic-bezier(0.5,0,1,1) forwards" }}
          >
            🪙
          </text>
        ))}
      </svg>
    </div>
  );
});

WishingWellSVG.displayName = "WishingWellSVG";
export default WishingWellSVG;
