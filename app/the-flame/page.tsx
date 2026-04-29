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

    // Countdown
    let remaining = selectedDuration.seconds;
    intervalRef.current = setInterval(() => {
      remaining--;
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
              <CandleSVG
                color={color.hex}
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
            <CandleSVG
              color={color.hex}
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
              { href: "/mantras", label: "Mantras" },
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

function CandleSVG({
  color,
  flameColor,
  glowColor,
  intensity,
  extinguished = false,
}: {
  color: string;
  flameColor: string;
  glowColor: string;
  intensity: number;
  extinguished?: boolean;
}) {
  return (
    <svg width="80" height="200" viewBox="0 0 80 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flameGlow" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor={flameColor} stopOpacity={0.9 * intensity} />
          <stop offset="60%" stopColor={glowColor} stopOpacity={0.4 * intensity} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="candleBody" cx="30%" cy="50%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Glow around flame */}
      {!extinguished && (
        <ellipse cx="40" cy="52" rx="30" ry="40" fill="url(#flameGlow)" opacity={intensity} />
      )}

      {/* Flame */}
      {!extinguished && intensity > 0 && (
        <g transform={`translate(40, 48) scale(${0.9 + intensity * 0.1})`}>
          <path
            d={`M0,-28 C${6 + Math.random() * 2},-18 ${10 + Math.random() * 3},-8 0,0 C${-(10 + Math.random() * 3)},-8 ${-(6 + Math.random() * 2)},-18 0,-28`}
            fill={flameColor}
            opacity={0.95}
          />
          {/* Inner bright core */}
          <path
            d="M0,-16 C3,-10 5,-4 0,0 C-5,-4 -3,-10 0,-16"
            fill="white"
            opacity={0.7 * intensity}
          />
        </g>
      )}

      {/* Smoke when extinguished */}
      {extinguished && (
        <path
          d="M40,48 C42,40 38,32 40,24 C42,16 38,10 40,4"
          stroke="rgba(176,160,144,0.5)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Wick */}
      <line x1="40" y1="48" x2="40" y2="60" stroke="#3a2a1a" strokeWidth="2" strokeLinecap="round" />

      {/* Wax drip */}
      <path d="M28,80 Q26,90 27,95" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M52,72 Q54,82 53,88" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />

      {/* Candle body */}
      <rect x="26" y="60" width="28" height="128" rx="4" fill="url(#candleBody)" />

      {/* Candle top rim */}
      <ellipse cx="40" cy="60" rx="14" ry="4" fill={color} opacity="0.8" />

      {/* Candle shine */}
      <rect x="30" y="70" width="4" height="90" rx="2" fill="white" opacity="0.12" />

      {/* Base */}
      <ellipse cx="40" cy="188" rx="18" ry="5" fill={color} opacity="0.5" />
    </svg>
  );
}
