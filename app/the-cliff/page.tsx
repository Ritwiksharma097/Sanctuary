"use client";
import { useState, useRef } from "react";
import StarField from "@/components/StarField";
import { useMascotReact } from "@/components/Mascot";

type Phase = "idle" | "typing" | "shouting" | "echo" | "still";

const ECHOES = [
  "It heard you.",
  "The wind carried it all the way.",
  "Every word. Every bit of it.",
  "You were allowed to say that.",
  "The valley held it.",
  "It echoed back and then it settled.",
  "You let it out. That matters.",
  "The sky is big enough for all of it.",
];

const CLOSING = [
  "Grief is not something to fix. It is something to move through. You just took a step.",
  "You did not have to be quiet. You chose to speak. That is brave.",
  "The pain is real. So is the fact that you are still here, saying it out loud.",
  "There is no right way to grieve. There is only your way. And you just did it.",
];

export default function TheCliffPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [shout, setShout] = useState("");
  const [echo, setEcho] = useState("");
  const [closing, setClosing] = useState("");
  const [echoVisible, setEchoVisible] = useState(false);
  const [windProgress, setWindProgress] = useState(0);
  const mascotReact = useMascotReact();

  function startShout() {
    if (!shout.trim()) return;
    setPhase("shouting");
    mascotReact("sad", "...");

    // Wind carries words outward
    let wind = 0;
    const windInterval = setInterval(() => {
      wind += 0.02;
      setWindProgress(Math.min(wind, 1));
      if (wind >= 1) {
        clearInterval(windInterval);
        setTimeout(() => {
          setEcho(pick(ECHOES));
          setClosing(pick(CLOSING));
          setPhase("echo");
          setTimeout(() => {
            setEchoVisible(true);
            setTimeout(() => setPhase("still"), 1200);
          }, 400);
        }, 600);
      }
    }, 40);
  }

  function reset() {
    setPhase("idle");
    setShout("");
    setEcho("");
    setClosing("");
    setEchoVisible(false);
    setWindProgress(0);
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <StarField />

      {/* Cliff scene background */}
      <CliffScene phase={phase} windProgress={windProgress} shout={shout} />

      <a href="/" style={{
        position: "fixed", top: "20px", left: "20px",
        fontFamily: "var(--font-lato)", fontSize: "11px",
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: "rgba(176,160,144,0.6)", textDecoration: "none", zIndex: 20,
        transition: "color 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(176,160,144,0.6)")}
      >
        the well
      </a>

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100vh", padding: "60px 24px 60px",
        justifyContent: "flex-end",
      }}>

        {/* PHASE: idle / typing */}
        {(phase === "idle" || phase === "typing") && (
          <div style={{
            width: "100%", maxWidth: "520px",
            display: "flex", flexDirection: "column", gap: "16px",
            animation: "fadeInUp 0.8s ease forwards",
          }}>
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: "17px",
                fontStyle: "italic", color: "rgba(176,160,144,0.8)",
                lineHeight: 1.7,
              }}>
                Stand at the edge. Say everything. The valley will carry it.
              </p>
            </div>

            <textarea
              placeholder="Shout it all out. No one will hear except the wind..."
              value={shout}
              onChange={e => {
                setShout(e.target.value);
                setPhase(e.target.value ? "typing" : "idle");
              }}
              rows={5}
              style={{
                width: "100%",
                background: "rgba(13,13,26,0.7)",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: "8px",
                color: "var(--cream)",
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                lineHeight: 1.7,
                padding: "18px 20px",
                outline: "none",
                resize: "none",
                caretColor: "var(--gold)",
                backdropFilter: "blur(4px)",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
            />

            <div style={{ display: "flex", justifyContent: "center", gap: "16px", alignItems: "center" }}>
              <button
                onClick={startShout}
                disabled={!shout.trim()}
                style={{
                  padding: "14px 44px", borderRadius: "999px",
                  background: shout.trim() ? "var(--gold)" : "rgba(201,168,76,0.3)",
                  color: shout.trim() ? "var(--night)" : "var(--stone)",
                  fontFamily: "var(--font-serif)", fontSize: "17px",
                  border: "none", cursor: shout.trim() ? "pointer" : "default",
                  letterSpacing: "0.05em", transition: "all 0.2s",
                }}
              >
                Release it
              </button>
            </div>

            {/* Crisis line - quiet, always present */}
            <p style={{
              fontFamily: "var(--font-lato)", fontSize: "10px",
              color: "rgba(176,160,144,0.4)", textAlign: "center",
              letterSpacing: "0.1em", lineHeight: 1.7, marginTop: "8px",
            }}>
              If you are carrying something heavier than grief right now,
              you do not have to carry it alone.{" "}
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(201,168,76,0.5)", textDecoration: "underline" }}
              >
                Find support near you.
              </a>
            </p>
          </div>
        )}

        {/* PHASE: shouting - words fly into distance */}
        {phase === "shouting" && (
          <div style={{
            width: "100%", maxWidth: "520px", textAlign: "center",
            position: "relative", height: "120px",
          }}>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: `${Math.max(8, 20 - windProgress * 14)}px`,
              color: `rgba(245,239,224,${1 - windProgress * 0.9})`,
              transform: `translateX(${windProgress * 200}px) translateY(${-windProgress * 30}px)`,
              opacity: 1 - windProgress,
              transition: "all 0.04s linear",
              position: "absolute", left: "50%",
              whiteSpace: "nowrap", overflow: "hidden",
              maxWidth: "400px",
              textOverflow: "ellipsis",
            }}>
              {shout.slice(0, 60)}{shout.length > 60 ? "..." : ""}
            </p>
          </div>
        )}

        {/* PHASE: echo + still */}
        {(phase === "echo" || phase === "still") && (
          <div style={{
            width: "100%", maxWidth: "480px",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "24px", textAlign: "center",
            opacity: echoVisible ? 1 : 0,
            transform: echoVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}>
            <div style={{
              width: "60px", height: "1px",
              background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            }} />

            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "24px",
              fontStyle: "italic", color: "var(--stone-light)", lineHeight: 1.5,
              letterSpacing: "0.02em",
            }}>
              {echo}
            </p>

            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "17px",
              fontStyle: "italic", color: "rgba(176,160,144,0.7)", lineHeight: 1.8,
              maxWidth: "380px",
            }}>
              {closing}
            </p>

            <div style={{
              width: "60px", height: "1px",
              background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            }} />

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  fontFamily: "var(--font-lato)", fontSize: "11px",
                  letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "var(--stone)", background: "none", border: "none",
                  borderBottom: "1px solid rgba(176,160,144,0.3)",
                  cursor: "pointer", paddingBottom: "2px",
                }}
              >
                shout again
              </button>
              <a href="/" style={{
                fontFamily: "var(--font-lato)", fontSize: "11px",
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--stone)", textDecoration: "none",
                borderBottom: "1px solid rgba(176,160,144,0.3)",
                paddingBottom: "2px", transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
              >
                make a wish
              </a>
              <a href="/the-bench" style={{
                fontFamily: "var(--font-lato)", fontSize: "11px",
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--stone)", textDecoration: "none",
                borderBottom: "1px solid rgba(176,160,144,0.3)",
                paddingBottom: "2px", transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
              >
                sit quietly
              </a>
            </div>

            <p style={{
              fontFamily: "var(--font-lato)", fontSize: "10px",
              color: "rgba(176,160,144,0.35)", letterSpacing: "0.1em",
              lineHeight: 1.7,
            }}>
              If you need someone to talk to,{" "}
              <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer"
                style={{ color: "rgba(201,168,76,0.4)", textDecoration: "underline" }}>
                you are not alone.
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Cliff background scene ───────────────────────────────────────────────────

function CliffScene({ phase, windProgress, shout }: {
  phase: Phase; windProgress: number; shout: string;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
    }}>
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="skyGrad" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#1a1a3a" />
            <stop offset="100%" stopColor="#0d0d1a" />
          </radialGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff9e6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="600" fill="url(#skyGrad)" />

        {/* Moon */}
        <circle cx="650" cy="80" r="40" fill="url(#moonGlow)" />
        <circle cx="650" cy="80" r="22" fill="#f5efe0" opacity="0.9" />

        {/* Distant mountains */}
        <path d="M0 400 L150 250 L300 350 L450 200 L600 300 L750 220 L800 280 L800 600 L0 600 Z"
          fill="#13132b" opacity="0.9" />

        {/* Valley mist */}
        <ellipse cx="400" cy="500" rx="500" ry="100"
          fill="rgba(176,160,144,0.05)" />

        {/* Cliff edge */}
        <path d="M0 480 Q100 470 200 475 Q250 477 300 480 L300 600 L0 600 Z"
          fill="#1a1a3a" />
        <path d="M300 480 Q350 478 380 490 Q390 500 400 600 L300 600 Z"
          fill="#13132b" />

        {/* Cliff face */}
        <path d="M0 490 Q150 485 300 488 L300 600 L0 600 Z"
          fill="rgba(30,30,60,0.8)" />

        {/* Words flying in wind */}
        {phase === "shouting" && (
          <text
            x={400 + windProgress * 300}
            y={400 - windProgress * 100}
            fontSize={Math.max(6, 16 - windProgress * 12)}
            fill={`rgba(245,239,224,${Math.max(0, 1 - windProgress * 1.2)})`}
            fontFamily="Georgia, serif"
            fontStyle="italic"
          >
            {shout.slice(0, 40)}
          </text>
        )}

        {/* Wind lines */}
        {phase === "shouting" && (
          <>
            {[0, 1, 2, 3].map(i => (
              <line
                key={i}
                x1={300 + windProgress * 100}
                y1={380 + i * 20}
                x2={400 + windProgress * 200 + i * 20}
                y2={370 + i * 20 - windProgress * 30}
                stroke={`rgba(201,168,76,${0.3 - windProgress * 0.2})`}
                strokeWidth="1"
                strokeLinecap="round"
              />
            ))}
          </>
        )}

        {/* Small silhouette standing at cliff edge */}
        <g transform="translate(290, 450)">
          {/* Body */}
          <line x1="0" y1="0" x2="0" y2="25" stroke="rgba(176,160,144,0.8)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Head */}
          <circle cx="0" cy="-6" r="5" fill="rgba(176,160,144,0.8)" />
          {/* Arms raised if shouting */}
          {(phase === "shouting") ? (
            <>
              <line x1="0" y1="8" x2="-10" y2="-2" stroke="rgba(176,160,144,0.8)" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="8" x2="10" y2="-2" stroke="rgba(176,160,144,0.8)" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <line x1="0" y1="8" x2="-8" y2="16" stroke="rgba(176,160,144,0.8)" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="8" x2="8" y2="16" stroke="rgba(176,160,144,0.8)" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
          {/* Legs */}
          <line x1="0" y1="25" x2="-6" y2="36" stroke="rgba(176,160,144,0.8)" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="25" x2="6" y2="36" stroke="rgba(176,160,144,0.8)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
