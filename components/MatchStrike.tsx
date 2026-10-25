"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A matchbox with one match. Strike it on the box (drag it across the striker,
// or just click it and it strikes itself), and the lit match follows the
// pointer so it can be touched to the letter. Box and match are Blender
// renders (art/match.py).

const BOX_W = 180;
const BOX_H = 150;
// Striker band on the box, as fractions of the box image (STRIKER from the script)
const STRIKER = { x0: 0.125, x1: 0.875, y0: 0.595, y1: 0.715 };
const MATCH = 110;
// Match head within the match image (MATCH_HEAD from the script)
const HEAD = { x: 0.7639 * MATCH, y: 0.1855 * MATCH };

type State = "resting" | "held" | "striking" | "lit" | "dropped";

export default function MatchStrike({ spent, onLit }: { spent: boolean; onLit: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("resting");
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);   // head position, viewport px
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const drag = useRef({ startX: 0, moved: 0, strokeX: null as number | null, lastX: 0, lastY: 0 });
  const sparkId = useRef(0);

  const strikerRect = () => {
    const r = boxRef.current!.getBoundingClientRect();
    return {
      left: r.left + STRIKER.x0 * r.width, right: r.left + STRIKER.x1 * r.width,
      top: r.top + STRIKER.y0 * r.height, bottom: r.top + STRIKER.y1 * r.height,
    };
  };

  function burst(x: number, y: number, n = 10) {
    const fresh = Array.from({ length: n }, () => ({
      id: sparkId.current++, x, y,
      vx: (Math.random() - 0.2) * 6, vy: -Math.random() * 5 - 1,
    }));
    setSparks(s => [...s, ...fresh]);
    setTimeout(() => setSparks(s => s.filter(p => !fresh.includes(p))), 600);
  }

  function light(x: number, y: number) {
    burst(x, y, 16);
    setPos({ x, y });
    setState("lit");
    onLit();
  }

  // Click/tap: the match strikes itself along the striker
  function autoStrike() {
    const s = strikerRect();
    const y = (s.top + s.bottom) / 2;
    setState("striking");
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 420);
      const x = s.left + (s.right - s.left) * k;
      setPos({ x, y });
      if (Math.random() < 0.5) burst(x, y, 2);
      if (k < 1) requestAnimationFrame(step);
      else light(x + 6, y - 4);
    };
    requestAnimationFrame(step);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (state !== "resting") return;
    e.preventDefault();
    drag.current = { startX: e.clientX, moved: 0, strokeX: null, lastX: e.clientX, lastY: e.clientY };
    setPos({ x: e.clientX, y: e.clientY });
    setState("held");
  }

  function onPointerMove(e: PointerEvent) {
    const d = drag.current;
    d.moved += Math.abs(e.clientX - d.lastX) + Math.abs(e.clientY - d.lastY);
    d.lastX = e.clientX; d.lastY = e.clientY;
    setPos({ x: e.clientX, y: e.clientY });
    // Dragged across the striker? A long enough stroke lights it
    const s = strikerRect();
    const onStrip = e.clientX >= s.left - 10 && e.clientX <= s.right + 10 && e.clientY >= s.top - 14 && e.clientY <= s.bottom + 14;
    if (onStrip) {
      if (d.strokeX === null) d.strokeX = e.clientX;
      if (Math.random() < 0.4) burst(e.clientX, e.clientY, 2);
      if (Math.abs(e.clientX - d.strokeX) > (s.right - s.left) * 0.35) light(e.clientX, e.clientY);
    } else {
      d.strokeX = null;
    }
  }

  function onPointerUp() {
    // A tap (barely moved) means "strike it for me"; otherwise put it back
    if (drag.current.moved < 8) autoStrike();
    else { setState("resting"); setPos(null); }
  }

  // While held, follow the pointer at the window level (the box button unmounts once picked up)
  const handlers = useRef({ onPointerMove, onPointerUp });
  handlers.current = { onPointerMove, onPointerUp };
  useEffect(() => {
    if (state !== "held") return;
    const move = (e: PointerEvent) => handlers.current.onPointerMove(e);
    const up = () => handlers.current.onPointerUp();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [state]);

  // Once lit, the match follows the pointer anywhere on the page
  useEffect(() => {
    if (state !== "lit") return;
    const move = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", move);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
    };
  }, [state]);

  // The letter caught: drop the spent match
  useEffect(() => {
    if (spent && state === "lit") setState("dropped");
  }, [spent, state]);

  const carried = state === "held" || state === "striking" || state === "lit" || state === "dropped";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div ref={boxRef} style={{ position: "relative", width: `${BOX_W}px`, height: `${BOX_H}px` }}>
        <img src="/art/matchbox.webp" alt="" width={BOX_W} height={BOX_H} style={{ display: "block" }} draggable={false} />
        {!carried && (
          <button
            onPointerDown={onPointerDown}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); autoStrike(); } }}
            aria-label="Strike the match"
            style={{
              position: "absolute", left: "36px", top: "-34px", width: `${MATCH}px`, height: `${MATCH}px`,
              background: "none", border: "none", padding: 0, cursor: "grab", touchAction: "none",
              animation: "matchNudge 2.4s ease-in-out infinite",
            }}
          >
            <img src="/art/match.webp" alt="" width={MATCH} height={MATCH} draggable={false} style={{ display: "block", pointerEvents: "none" }} />
          </button>
        )}
      </div>
      <p style={{ fontFamily: "var(--font-lato)", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--stone-light)", textAlign: "center", minHeight: "16px" }}>
        {state === "resting" && "Strike the match on the box"}
        {state === "held" && "Drag it across the striker"}
        {state === "lit" && "Now touch the flame to your letter"}
      </p>

      {/* The match in hand and its sparks live in <body>: an ancestor's transform would break position: fixed */}
      {typeof document !== "undefined" && createPortal(<>
      {/* The match in hand: head (and flame) at the pointer */}
      {carried && pos && (
        <div
          style={{
            position: "fixed", left: pos.x - HEAD.x, top: pos.y - HEAD.y, width: `${MATCH}px`, height: `${MATCH}px`,
            pointerEvents: "none", zIndex: 60,
            transition: state === "dropped" ? "transform 0.9s ease-in, opacity 0.9s ease-in" : "none",
            transform: state === "dropped" ? "translate(-30px, 220px) rotate(-70deg)" : "none",
            opacity: state === "dropped" ? 0 : 1,
          }}
        >
          <img src="/art/match.webp" alt="" width={MATCH} height={MATCH} draggable={false} style={{ display: "block", pointerEvents: "none" }} />
          {(state === "lit" || state === "dropped") && (
            <svg width="40" height="60" viewBox="-20 -52 40 60" style={{ position: "absolute", left: HEAD.x - 20, top: HEAD.y - 52, overflow: "visible", pointerEvents: "none" }}>
              <defs>
                <radialGradient id="matchFlame" cx="50%" cy="80%" r="70%">
                  <stop offset="0%" stopColor="#fff6cf" />
                  <stop offset="40%" stopColor="#ffbe45" />
                  <stop offset="80%" stopColor="#ff6a1f" />
                  <stop offset="100%" stopColor="#c0392b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="matchGlow">
                  <stop offset="0%" stopColor="rgba(255,170,70,0.45)" />
                  <stop offset="100%" stopColor="rgba(255,170,70,0)" />
                </radialGradient>
                <filter id="matchBlur"><feGaussianBlur stdDeviation="1.2" /></filter>
              </defs>
              <circle cx="0" cy="-12" r="34" fill="url(#matchGlow)" />
              <g style={{ transformOrigin: "0px 0px", animation: "flicker 0.3s ease-in-out infinite alternate" }}>
                <path d="M0,-44 C7,-30 10,-16 7,-6 C5,1 -5,1 -7,-6 C-10,-16 -7,-30 0,-44 Z" fill="url(#matchFlame)" filter="url(#matchBlur)" />
                <ellipse cx="0" cy="-3" rx="3.5" ry="3" fill="rgba(120,170,255,0.6)" filter="url(#matchBlur)" />
              </g>
            </svg>
          )}
        </div>
      )}

      {/* Sparks from the strike */}
      {sparks.map(p => (
        <span key={p.id} style={{
          position: "fixed", left: p.x, top: p.y, width: "3px", height: "3px", borderRadius: "50%",
          background: "#ffd27a", boxShadow: "0 0 6px 2px rgba(255,160,60,0.8)", pointerEvents: "none", zIndex: 61,
          animation: "sparkFly 0.6s ease-out forwards",
          ["--vx" as string]: `${p.vx * 10}px`, ["--vy" as string]: `${p.vy * 10}px`,
        }} />
      ))}
      </>, document.body)}
    </div>
  );
}
