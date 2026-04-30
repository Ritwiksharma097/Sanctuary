"use client";
import { useState, useEffect, useRef } from "react";
import StarField from "@/components/StarField";


type Phase = "idle" | "typing" | "cleansing" | "done";

const CLEANSE_LINES = [
  "The eye has been seen.",
  "What was cast upon you is lifting.",
  "You are not what was wished against you.",
  "The weight is not yours to carry anymore.",
  "It is dissolving now, into the dark water, into nothing.",
  "You are clear.",
];

const CLOSING_QUOTES = [
  { text: "What people think of you is none of your business.", author: "Unknown" },
  { text: "No weapon formed against you shall prosper.", author: "Isaiah 54:17" },
  { text: "The evil eye can only reach those who believe they can be diminished.", author: "Old proverb" },
  { text: "You carry within you the antidote to every curse.", author: "Unknown" },
  { text: "Let them look. You are still standing.", author: "Unknown" },
];

export default function EvilEyePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [feeling, setFeeling] = useState("");
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [quote, setQuote] = useState(CLOSING_QUOTES[0]);
  const [eyeScale, setEyeScale] = useState(1);
  const [eyeOpacity, setEyeOpacity] = useState(1);
  const [crackProgress, setCrackProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setQuote(CLOSING_QUOTES[Math.floor(Math.random() * CLOSING_QUOTES.length)]);
  }, []);

  function startCleanse() {
    if (!name.trim()) return;
    setPhase("cleansing");
    setVisibleLines(0);
    setCrackProgress(0);
    setEyeScale(1);
    setEyeOpacity(1);

    // Animate the eye cracking and dissolving
    let crack = 0;
    const crackInterval = setInterval(() => {
      crack += 0.04;
      setCrackProgress(Math.min(crack, 1));
      setEyeScale(1 + crack * 0.15);
      if (crack >= 1) {
        clearInterval(crackInterval);
        setEyeOpacity(0);
        setTimeout(() => setPhase("done"), 600);
      }
    }, 80);

    // Reveal cleansing lines one by one
    let lineIdx = 0;
    intervalRef.current = setInterval(() => {
      lineIdx++;
      setVisibleLines(lineIdx);
      if (lineIdx >= CLEANSE_LINES.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 900);
  }

  function reset() {
    setPhase("idle");
    setName("");
    setFeeling("");
    setVisibleLines(0);
    setCrackProgress(0);
    setEyeScale(1);
    setEyeOpacity(1);
  }

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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
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
            a quiet ritual
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
            Evil Eye
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "17px",
              fontStyle: "italic",
              color: "var(--stone-light)",
              maxWidth: "420px",
              lineHeight: 1.75,
            }}
          >
            Across dozens of cultures, for thousands of years, people have believed
            that envy and ill intent can attach itself to a person. Not as
            superstition, but as something felt. A heaviness. A run of bad fortune.
            A sense that something is working against you.
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

        {/* The Eye SVG */}
        <div
          style={{
            marginBottom: "40px",
            position: "relative",
            transition: "transform 0.1s, opacity 0.6s",
            transform: `scale(${eyeScale})`,
            opacity: eyeOpacity,
          }}
        >
          <EvilEyeSVG crackProgress={crackProgress} />
        </div>

        {/* PHASE: idle */}
        {phase === "idle" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              width: "100%",
              maxWidth: "400px",
              animation: "fadeInUp 0.6s ease forwards",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                fontStyle: "italic",
                color: "var(--stone-light)",
                textAlign: "center",
              }}
            >
              If you feel it, name it. That is how the ritual begins.
            </p>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: "8px",
                color: "var(--cream)",
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                padding: "14px 18px",
                outline: "none",
                caretColor: "var(--gold)",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}
            />

            <textarea
              placeholder="When did it start, and how does it feel? (optional)"
              value={feeling}
              onChange={e => setFeeling(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: "8px",
                color: "var(--cream)",
                fontFamily: "var(--font-serif)",
                fontSize: "16px",
                padding: "14px 18px",
                outline: "none",
                resize: "none",
                caretColor: "var(--gold)",
                lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}
            />

            <button
              onClick={startCleanse}
              disabled={!name.trim()}
              style={{
                padding: "14px 40px",
                borderRadius: "999px",
                background: name.trim() ? "var(--gold)" : "rgba(201,168,76,0.3)",
                color: name.trim() ? "var(--night)" : "var(--stone)",
                fontFamily: "var(--font-serif)",
                fontSize: "17px",
                border: "none",
                cursor: name.trim() ? "pointer" : "default",
                letterSpacing: "0.05em",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              Begin the Cleanse
            </button>

            <p
              style={{
                fontFamily: "var(--font-lato)",
                fontSize: "11px",
                color: "var(--stone)",
                letterSpacing: "0.1em",
                textAlign: "center",
                marginTop: "4px",
              }}
            >
              No data is saved. This ritual is only for you.
            </p>
          </div>
        )}

        {/* PHASE: cleansing */}
        {phase === "cleansing" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0",
              width: "100%",
              maxWidth: "420px",
              textAlign: "center",
            }}
          >
            {CLEANSE_LINES.map((line, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "20px",
                  fontStyle: "italic",
                  color: "var(--cream)",
                  lineHeight: 1.8,
                  opacity: visibleLines > i ? 1 : 0,
                  transform: visibleLines > i ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.8s ease, transform 0.8s ease",
                }}
              >
                {line}
              </p>
            ))}
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
              width: "100%",
              maxWidth: "420px",
              textAlign: "center",
              animation: "fadeInUp 0.8s ease forwards",
            }}
          >
            {/* Intact eye amulet, now glowing softly */}
            <div style={{ fontSize: "48px", lineHeight: 1 }}>🧿</div>

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
              {name}, you are clear now.
            </p>

            <blockquote
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                fontStyle: "italic",
                color: "var(--stone-light)",
                lineHeight: 1.7,
              }}
            >
              "{quote.text}"
            </blockquote>
            <p
              style={{
                fontFamily: "var(--font-lato)",
                fontSize: "11px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--stone)",
              }}
            >
              {quote.author}
            </p>

            <div
              style={{
                width: "60px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
              }}
            />

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
              begin again
            </button>
          </div>
        )}

        {/* Footer nav */}
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
            { href: "/the-flame", label: "The Flame" },
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
      </div>
    </main>
  );
}

function EvilEyeSVG({ crackProgress }: { crackProgress: number }) {
  const hue = Math.round(crackProgress * 30); // shifts from blue toward amber as it cracks
  const eyeColor = crackProgress > 0.5 ? `hsl(${200 - hue * 4}, 60%, ${40 + crackProgress * 20}%)` : "#1a6faf";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={crackProgress > 0 ? "#c9a84c" : "#2a9dd8"} stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer glow */}
      <circle cx="70" cy="70" r="65" fill="url(#eyeGlow)" />

      {/* Main eye circle */}
      <circle
        cx="70" cy="70" r="56"
        fill="#0a3a5e"
        stroke="#1a6faf"
        strokeWidth="3"
        style={{ transition: "fill 0.3s" }}
      />

      {/* White of eye */}
      <ellipse cx="70" cy="70" rx="42" ry="28" fill="#d4e8f5" opacity={1 - crackProgress * 0.6} />

      {/* Iris */}
      <circle
        cx="70" cy="70" r="18"
        fill={eyeColor}
        style={{ transition: "fill 0.2s" }}
      />

      {/* Pupil */}
      <circle cx="70" cy="70" r="9" fill="#0d0d1a" opacity={1 - crackProgress * 0.8} />

      {/* Pupil shine */}
      <circle cx="66" cy="66" r="3" fill="white" opacity={1 - crackProgress} />

      {/* Crack lines that appear as cleanse progresses */}
      {crackProgress > 0.2 && (
        <line x1="70" y1="14" x2="65" y2="70" stroke="var(--gold)" strokeWidth="1.5" opacity={Math.min(1, (crackProgress - 0.2) * 3)} />
      )}
      {crackProgress > 0.4 && (
        <line x1="70" y1="70" x2="90" y2="110" stroke="var(--gold)" strokeWidth="1" opacity={Math.min(1, (crackProgress - 0.4) * 3)} />
      )}
      {crackProgress > 0.55 && (
        <line x1="30" y1="50" x2="70" y2="70" stroke="var(--gold)" strokeWidth="1" opacity={Math.min(1, (crackProgress - 0.55) * 4)} />
      )}
      {crackProgress > 0.7 && (
        <line x1="70" y1="70" x2="110" y2="55" stroke="var(--gold)" strokeWidth="1" opacity={Math.min(1, (crackProgress - 0.7) * 5)} />
      )}

      {/* Outer ring decoration */}
      <circle cx="70" cy="70" r="62" fill="none" stroke="#1a6faf" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
    </svg>
  );
}
