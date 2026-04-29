"use client";
import { useRef, forwardRef, useImperativeHandle } from "react";

export interface WellHandle {
  triggerRipple: () => void;
  triggerCoinDrop: () => void;
}

const WishingWellSVG = forwardRef<WellHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function spawnRipple() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.style.opacity = "1";
    let t = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      [0, 250, 500].forEach((offset) => {
        const progress = Math.min(1, (t - offset) / 700);
        if (progress <= 0) return;
        const rx = 5 + progress * 90;
        const ry = 4 + progress * 24;
        ctx.beginPath();
        ctx.ellipse(100, 30, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(60,100,160,${(1 - progress) * 0.55})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      t += 16;
      if (t < 1300) requestAnimationFrame(draw);
      else if (canvas) canvas.style.opacity = "0";
    }
    draw();
  }

  function spawnCoinDrop() {
    const coin = document.createElement("div");
    coin.textContent = "🪙";
    coin.style.cssText = `
      position: fixed;
      font-size: 22px;
      top: 40%;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 100;
      animation: coinArc 1s ease-in forwards;
    `;
    document.body.appendChild(coin);

    // Splash sound placeholder
    setTimeout(() => {
      coin.remove();
      spawnRipple();
    }, 900);
  }

  useImperativeHandle(ref, () => ({
    triggerRipple: spawnRipple,
    triggerCoinDrop: spawnCoinDrop,
  }));

  return (
    <div className="relative w-64 h-56 mx-auto mb-8 well-glow rounded-full">
      <svg viewBox="0 0 260 220" width="260" height="220" aria-hidden>
        {/* Crossbar posts */}
        <line x1="60" y1="30" x2="60" y2="10" stroke="#8a7a6a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="200" y1="30" x2="200" y2="10" stroke="#8a7a6a" strokeWidth="2" strokeLinecap="round"/>
        <rect x="50" y="8" width="160" height="6" rx="3" fill="#7a6a5a"/>
        {/* Roof */}
        <polygon points="25,32 130,4 235,32" fill="#5a4a3a"/>
        <polygon points="30,32 130,8 230,32" fill="#6a5a4a"/>
        {/* Rope and bucket */}
        <line x1="130" y1="32" x2="130" y2="72" stroke="#8a7a6a" strokeWidth="1.5" strokeDasharray="4,3"/>
        <rect x="115" y="72" width="30" height="22" rx="3" fill="#7a6a5a"/>
        <line x1="115" y1="72" x2="145" y2="72" stroke="#5a4a3a" strokeWidth="2"/>
        {/* Well body */}
        <rect x="30" y="115" width="200" height="90" rx="6" fill="#3d2e22"/>
        <rect x="30" y="115" width="200" height="18" rx="4" fill="#5a4a3a"/>
        {/* Stone details */}
        <rect x="38" y="120" width="40" height="10" rx="2" fill="#6a5a4a" opacity="0.7"/>
        <rect x="84" y="120" width="50" height="10" rx="2" fill="#5a4a40" opacity="0.6"/>
        <rect x="140" y="120" width="44" height="10" rx="2" fill="#6a5a4a" opacity="0.7"/>
        <rect x="38" y="135" width="26" height="9" rx="2" fill="#5a4a40" opacity="0.5"/>
        <rect x="70" y="135" width="60" height="9" rx="2" fill="#6a5a4a" opacity="0.5"/>
        <rect x="136" y="135" width="36" height="9" rx="2" fill="#5a4a40" opacity="0.5"/>
        <rect x="178" y="135" width="44" height="9" rx="2" fill="#6a5a4a" opacity="0.5"/>
        {/* Water */}
        <ellipse cx="130" cy="138" rx="90" ry="12" fill="#1a2a4a"/>
        <ellipse cx="130" cy="138" rx="90" ry="12" fill="none" stroke="#2a4a6a" strokeWidth="1"/>
        <ellipse cx="100" cy="137" rx="20" ry="3" fill="#2a4a6a" opacity="0.6" style={{animation:"waterShimmer 3s ease-in-out infinite"}}/>
        <ellipse cx="155" cy="139" rx="14" ry="2" fill="#2a4a6a" opacity="0.5" style={{animation:"waterShimmer 4s ease-in-out infinite 1s"}}/>
        {/* Coins at bottom */}
        <ellipse cx="105" cy="185" rx="8" ry="4" fill="#c9a84c" opacity="0.5"/>
        <ellipse cx="148" cy="188" rx="7" ry="3.5" fill="#c9a84c" opacity="0.4"/>
        <ellipse cx="125" cy="192" rx="6" ry="3" fill="#e8c97a" opacity="0.35"/>
        <ellipse cx="165" cy="183" rx="5" ry="2.5" fill="#c9a84c" opacity="0.4"/>
        <ellipse cx="88" cy="190" rx="6" ry="3" fill="#c9a84c" opacity="0.35"/>
        {/* Moss */}
        <ellipse cx="44" cy="147" rx="10" ry="5" fill="#2a4a2a" opacity="0.5"/>
        <ellipse cx="210" cy="149" rx="8" ry="4" fill="#2a4a2a" opacity="0.4"/>
      </svg>

      {/* Ripple canvas overlaid on water surface */}
      <canvas
        ref={canvasRef}
        width={200}
        height={60}
        style={{
          position: "absolute",
          top: "110px",
          left: "30px",
          borderRadius: "50%",
          opacity: 0,
          transition: "opacity 0.4s",
          pointerEvents: "none",
        }}
      />
    </div>
  );
});

WishingWellSVG.displayName = "WishingWellSVG";
export default WishingWellSVG;
