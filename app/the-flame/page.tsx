"use client";
import { useState, useEffect, useRef } from "react";
import StarField from "@/components/StarField";

const CANDLE_COLORS = [
  {
    id: "white",
    label: "White",
    hex: "#f5efe0",
    flame: "#fff8e1",
    glow: "rgba(255,248,225,0.4)",
    description: "When you are unsure. When you need clarity. When any wish will do.",
  },
  {
    id: "red",
    label: "Red",
    hex: "#c0392b",
    flame: "#ff6b4a",
    glow: "rgba(192,57,43,0.45)",
    description: "For wishes of love, courage, and the things your heart burns for.",
  },
  {
    id: "green",
    label: "Green",
    hex: "#27ae60",
    flame: "#5dde8a",
    glow: "rgba(39,174,96,0.4)",
    description: "For growth, abundance, and new beginnings you are ready for.",
  },
  {
    id: "blue",
    label: "Blue",
    hex: "#2980b9",
    flame: "#74b9ff",
    glow: "rgba(41,128,185,0.4)",
    description: "For peace, healing, and the calm you have been searching for.",
  },
  {
    id: "purple",
    label: "Purple",
    hex: "#8e44ad",
    flame: "#c39bd3",
    glow: "rgba(142,68,173,0.4)",
    description: "For wisdom, guidance, and the answers that have not come yet.",
  },
  {
    id: "pink",
    label: "Pink",
    hex: "#d98880",
    flame: "#f1948a",
    glow: "rgba(217,136,128,0.4)",
    description: "For gentle love, self-compassion, and the kindness you deserve.",
  },
  {
    id: "yellow",
    label: "Yellow",
    hex: "#d4ac0d",
    flame: "#f9e04b",
    glow: "rgba(212,172,13,0.4)",
    description: "For focus, clarity of mind, and the success you are working toward.",
  },
];

const DURATIONS = [
  { label: "10 min", seconds: 600 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
];

type Phase = "choose" | "ritual" | "done";

export default function TheFlamePage() {
  const [phase, setPhase] = useState<Phase>("choose");
  const [selectedColor, setSelectedColor] = useState(CANDLE_COLORS[0]);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [flameIntensity, setFlameIntensity] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startRitual() {
    setTimeLeft(selectedDuration.seconds);
    setPhase("ritual");

    // Flicker the flame randomly
    flameRef.current = setInterval(() => {
      setFlameIntensity(0.85 + Math.random() * 0.3);
    }, 150);

    // Countdown from a fixed end time so background-tab timer throttling can't stretch it
    const endsAt = Date.now() + selectedDuration.seconds * 1000;
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (flameRef.current) clearInterval(flameRef.current);
        setPhase("done");
      }
    }, 1000);
  }

  function endEarly() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (flameRef.current) clearInterval(flameRef.current);
    setPhase("done");
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (flameRef.current) clearInterval(flameRef.current);
    setPhase("choose");
    setTimeLeft(0);
    setFlameIntensity(1);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (flameRef.current) clearInterval(flameRef.current);
    };
  }, []);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const color = selectedColor;

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <StarField />

      {/* Back nav */}
      <a
        href="/"
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          fontFamily: "var(--font-lato)",
          fontSize: "11px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--stone)",
          textDecoration: "none",
          zIndex: 20,
          transition: "color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
      >
        the well
      </a>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          padding: "80px 24px 60px",
        }}
      >
        {/* PHASE: choose */}
        {phase === "choose" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <p
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "11px",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "var(--stone-light)",
                  marginBottom: "12px",
                }}
              >
                a ritual of stillness
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "52px",
                  fontWeight: 300,
                  color: "var(--cream)",
                  marginBottom: "16px",
                  lineHeight: 1.1,
                }}
              >
                The Flame
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "17px",
                  fontStyle: "italic",
                  color: "var(--stone-light)",
                  maxWidth: "440px",
                  lineHeight: 1.8,
                }}
              >
                For thousands of years, across every corner of the world, humans have
                sat in front of fire. Not to worship it. Simply because a flame
                quiets the noise inside you. It pulls your eyes in, slows your
                breathing, and without trying, your mind settles onto the one thing
                that matters.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "17px",
                  fontStyle: "italic",
                  color: "var(--stone-light)",
                  maxWidth: "440px",
                  lineHeight: 1.8,
                  marginTop: "12px",
                }}
              >
                This is that. Nothing more. Light a real candle. Hold your wish
                somewhere behind your eyes. Look at the flame. The longer you
                look, the quieter everything else becomes.
              </p>
              <div
                style={{
                  width: "60px",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
                  margin: "24px auto 0",
                }}
              />
            </div>

            {/* Preview of the chosen candle, unlit */}
            <div style={{ marginBottom: "24px", transform: "scale(0.8)", transformOrigin: "center bottom", marginTop: "-40px" }}>
              <Candle colorId={selectedColor.id} flameColor={selectedColor.flame} glowColor={selectedColor.glow} intensity={0} unlit />
            </div>

            {/* Color picker */}
            <div style={{ width: "100%", maxWidth: "480px", marginBottom: "32px" }}>
              <p
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "11px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--stone-light)",
                  textAlign: "center",
                  marginBottom: "16px",
                }}
              >
                Choose your candle
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                {CANDLE_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      border: selectedColor.id === c.id
                        ? `1px solid ${c.hex}`
                        : "1px solid rgba(176,160,144,0.25)",
                      background: selectedColor.id === c.id
                        ? `${c.hex}22`
                        : "transparent",
                      color: selectedColor.id === c.id ? c.hex : "var(--stone-light)",
                      fontFamily: "var(--font-lato)",
                      fontSize: "12px",
                      letterSpacing: "0.15em",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: c.hex,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Color meaning */}
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "16px",
                  fontStyle: "italic",
                  color: "var(--stone-light)",
                  textAlign: "center",
                  lineHeight: 1.6,
                  minHeight: "48px",
                  transition: "opacity 0.3s",
                }}
              >
                {selectedColor.description}
              </p>
            </div>

            {/* Duration picker */}
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "11px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--stone-light)",
                  marginBottom: "12px",
                }}
              >
                How long will you sit
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                {DURATIONS.map(d => (
                  <button
                    key={d.seconds}
                    onClick={() => setSelectedDuration(d)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "999px",
                      border: selectedDuration.seconds === d.seconds
                        ? "1px solid rgba(201,168,76,0.8)"
                        : "1px solid rgba(201,168,76,0.3)",
                      background: selectedDuration.seconds === d.seconds
                        ? "rgba(201,168,76,0.15)"
                        : "transparent",
                      color: selectedDuration.seconds === d.seconds
                        ? "var(--gold-light)"
                        : "var(--stone-light)",
                      fontFamily: "var(--font-lato)",
                      fontSize: "12px",
                      letterSpacing: "0.15em",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startRitual}
              style={{
                padding: "14px 44px",
                borderRadius: "999px",
                background: "var(--gold)",
                color: "var(--night)",
                fontFamily: "var(--font-serif)",
                fontSize: "17px",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Light the Flame
            </button>

            <p
              style={{
                fontFamily: "var(--font-lato)",
                fontSize: "11px",
                color: "var(--stone)",
                letterSpacing: "0.1em",
                textAlign: "center",
                marginTop: "16px",
                maxWidth: "320px",
                lineHeight: 1.6,
              }}
            >
              Light a real candle before you begin. This page is a guide and a companion,
              not a substitute for the flame itself.
            </p>
          </>
        )}

        {/* PHASE: ritual */}
        {phase === "ritual" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "32px",
              animation: "fadeInUp 1s ease forwards",
            }}
          >
            {/* Animated candle */}
            <div style={{ position: "relative" }}>
              <Candle
                colorId={color.id}
                flameColor={color.flame}
                glowColor={color.glow}
                intensity={flameIntensity}
              />
            </div>

            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
                fontStyle: "italic",
                color: "var(--stone-light)",
                textAlign: "center",
                maxWidth: "340px",
                lineHeight: 1.7,
              }}
            >
              Look at the flame. Hold your wish. Do not look away.
            </p>

            {/* Timer */}
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "48px",
                  color: color.hex,
                  letterSpacing: "0.05em",
                  opacity: 0.8,
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            <button
              onClick={endEarly}
              style={{
                fontFamily: "var(--font-lato)",
                fontSize: "11px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--stone)",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(176,160,144,0.3)",
                cursor: "pointer",
                paddingBottom: "2px",
                marginTop: "8px",
              }}
            >
              I am done
            </button>
          </div>
        )}

        {/* PHASE: done */}
        {phase === "done" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              textAlign: "center",
              maxWidth: "400px",
              animation: "fadeInUp 0.8s ease forwards",
            }}
          >
            {/* Extinguished candle */}
            <Candle
              colorId={color.id}
              flameColor={color.flame}
              glowColor={color.glow}
              intensity={0}
              extinguished
            />

            <div
              style={{
                width: "60px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
              }}
            />

            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
                fontStyle: "italic",
                color: "var(--cream)",
                lineHeight: 1.6,
              }}
            >
              You sat with your wish. That is not a small thing.
            </p>

            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "16px",
                fontStyle: "italic",
                color: "var(--stone-light)",
                lineHeight: 1.7,
              }}
            >
              The flame doesn't grant wishes. But the stillness you found while
              watching it, that is real. And sometimes that is exactly what a wish needs.
            </p>

            <div
              style={{
                width: "60px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
              }}
            />

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "11px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid rgba(176,160,144,0.3)",
                  cursor: "pointer",
                  paddingBottom: "2px",
                }}
              >
                sit again
              </button>
              <a
                href="/"
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "11px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(176,160,144,0.3)",
                  paddingBottom: "2px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
              >
                make a wish
              </a>
            </div>
          </div>
        )}

        {/* Footer nav - only on choose phase */}
        {phase === "choose" && (
          <nav
            style={{
              marginTop: "auto",
              paddingTop: "64px",
              display: "flex",
              gap: "24px",
              fontFamily: "var(--font-lato)",
              fontSize: "11px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--stone)",
            }}
          >
            {[
              { href: "/", label: "Well" },
              { href: "/evil-eye", label: "Evil Eye" },
              { href: "/let-go", label: "Let Go" },
              { href: "/the-cliff", label: "The Cliff" },
              { href: "/contact", label: "Contact" },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{ color: "var(--stone)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}

// Wax body is a Blender render (art/candle.py); the flame and glow are drawn live on top.
// WICK_Y is the wick tip as a fraction of the render's height (printed by the script).
const CANDLE_W = 130;
const CANDLE_H = 280;
const WICK_Y = 0.358 * CANDLE_H;

function Candle({
  colorId,
  flameColor,
  glowColor,
  intensity,
  extinguished = false,
  unlit = false,
}: {
  colorId: string;
  flameColor: string;
  glowColor: string;
  intensity: number;
  extinguished?: boolean;
  unlit?: boolean;
}) {
  const lit = !extinguished && !unlit;
  return (
    <div style={{ position: "relative", width: `${CANDLE_W}px`, height: `${CANDLE_H}px` }}>
      {/* Warm light spilling around the candle */}
      {lit && (
        <div style={{
          position: "absolute",
          left: "50%", top: `${WICK_Y - 30}px`,
          width: "320px", height: "320px",
          transform: `translate(-50%, -50%) scale(${0.9 + intensity * 0.12})`,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 62%)`,
          opacity: 0.55 * intensity,
          transition: "transform 0.15s, opacity 0.15s",
          pointerEvents: "none",
        }} />
      )}

      <img
        src={`/art/candle-${colorId}.webp`}
        alt=""
        width={CANDLE_W}
        height={CANDLE_H}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          filter: lit ? "none" : unlit ? "brightness(0.8)" : "brightness(0.55) saturate(0.85)",
          transition: "filter 1.2s ease",
        }}
      />

      {/* Flame: outer coloured tongue, warm middle, white-hot core */}
      {lit && (
        <svg
          width="40" height="70" viewBox="-20 -66 40 70"
          style={{
            position: "absolute",
            left: "50%", top: `${WICK_Y - 64}px`,
            transform: "translateX(-50%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <defs>
            <radialGradient id="flameOuter" cx="50%" cy="80%" r="70%">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="45%" stopColor={flameColor} />
              <stop offset="100%" stopColor={flameColor} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="flameCore" cx="50%" cy="75%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#ffe9a8" />
              <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
            </radialGradient>
            <filter id="flameBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          <g style={{ transformOrigin: "0px 0px", animation: "flicker 0.35s ease-in-out infinite alternate" }}>
            <path d="M0,-58 C9,-40 14,-22 10,-8 C7,1 -7,1 -10,-8 C-14,-22 -9,-40 0,-58 Z"
              fill="url(#flameOuter)" filter="url(#flameBlur)" opacity={0.95} />
            <path d="M0,-38 C5,-26 7,-14 5,-6 C3,-1 -3,-1 -5,-6 C-7,-14 -5,-26 0,-38 Z"
              fill="url(#flameCore)" filter="url(#flameBlur)" />
            {/* Blue base where the flame meets the wick */}
            <ellipse cx="0" cy="-3" rx="4" ry="3" fill="rgba(120,170,255,0.55)" filter="url(#flameBlur)" />
          </g>
        </svg>
      )}

      {/* Smoke curling up from a blown-out wick */}
      {extinguished && (
        <svg width="60" height="120" viewBox="-30 -120 60 120"
          style={{ position: "absolute", left: "50%", top: `${WICK_Y - 116}px`, transform: "translateX(-50%)", overflow: "visible", pointerEvents: "none" }}>
          <filter id="smokeBlur"><feGaussianBlur stdDeviation="2.2" /></filter>
          {[0, 1.3, 2.6].map(delay => (
            <path key={delay}
              d="M0,0 C6,-18 -8,-34 0,-52 C8,-70 -6,-88 2,-110"
              stroke="rgba(190,180,170,0.45)" strokeWidth="3" fill="none" strokeLinecap="round"
              filter="url(#smokeBlur)"
              style={{ animation: `smokeRise 3.9s ease-out ${delay}s infinite both` }} />
          ))}
        </svg>
      )}
    </div>
  );
}
