"use client";
import { useState, useEffect, useRef } from "react";
import StarField from "@/components/StarField";
import { useMascotReact } from "@/components/Mascot";

type Phase = "idle" | "typing" | "shouting" | "echo" | "still";

const ECHOES = [
  "It heard you.",
  "The wind carried it all the way.",
  "Every word. Every bit of it.",
  "You were allowed to say that.",
  "The valley held it.",
  "The sky is big enough for all of it.",
  "You let it out. That matters.",
];

const CLOSING = [
  "Grief is not something to fix. It is something to move through. You just took a step.",
  "You did not have to be quiet. You chose to speak. That is brave.",
  "The pain is real. So is the fact that you are still here, saying it out loud.",
  "There is no right way to grieve. There is only your way. And you just did it.",
];

interface WordParticle {
  id: number;
  word: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  rotation: number;
}

export default function TheCliffPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [shout, setShout] = useState("");
  const [echo, setEcho] = useState("");
  const [closing, setClosing] = useState("");
  const [echoVisible, setEchoVisible] = useState(false);
  const [windProgress, setWindProgress] = useState(0);
  const [particles, setParticles] = useState<WordParticle[]>([]);
  const [armsRaised, setArmsRaised] = useState(false);
  const animFrame = useRef<number | null>(null);
  const mascotReact = useMascotReact();

  function startShout() {
    if (!shout.trim()) return;
    setPhase("shouting");
    setArmsRaised(true);
    mascotReact("sad", "...");

    // Scatter words as particles
    const words = shout.trim().split(/\s+/).slice(0, 12);
    const newParticles: WordParticle[] = words.map((word, i) => ({
      id: i,
      word,
      x: 42 + (Math.random() - 0.3) * 20,  // start near figure on cliff
      y: 62 + (Math.random() - 0.5) * 10,
      vx: 0.8 + Math.random() * 1.2,
      vy: -(0.1 + Math.random() * 0.4),
      opacity: 1,
      size: 10 + Math.random() * 6,
      rotation: (Math.random() - 0.5) * 20,
    }));
    setParticles(newParticles);

    // Wind progress for cliff scene
    let wind = 0;
    const windInterval = setInterval(() => {
      wind += 0.015;
      setWindProgress(Math.min(wind, 1));
      if (wind >= 1) {
        clearInterval(windInterval);
        setTimeout(() => {
          setArmsRaised(false);
          setEcho(pick(ECHOES));
          setClosing(pick(CLOSING));
          setParticles([]);
          setPhase("echo");
          setTimeout(() => {
            setEchoVisible(true);
            setTimeout(() => setPhase("still"), 1000);
          }, 300);
        }, 500);
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
    setParticles([]);
    setArmsRaised(false);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <StarField />

      {/* Full-screen cliff scene */}
      <CliffScene phase={phase} windProgress={windProgress} armsRaised={armsRaised} particles={particles} />

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
        ← the well
      </a>

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100vh", padding: "60px 24px 60px",
        justifyContent: "flex-end",
      }}>

        {/* Idle / typing */}
        {(phase === "idle" || phase === "typing") && (
          <div style={{
            width: "100%", maxWidth: "520px",
            display: "flex", flexDirection: "column", gap: "16px",
            animation: "fadeInUp 0.8s ease forwards",
          }}>
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: "18px",
                fontStyle: "italic", color: "rgba(176,160,144,0.85)",
                lineHeight: 1.7,
              }}>
                Stand at the edge. Say everything.<br/>The valley will carry it.
              </p>
            </div>

            <textarea
              placeholder="Shout it all out. No one will hear except the wind..."
              value={shout}
              onChange={e => { setShout(e.target.value); setPhase(e.target.value ? "typing" : "idle"); }}
              rows={5}
              style={{
                width: "100%",
                background: "rgba(13,13,26,0.75)",
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
                backdropFilter: "blur(6px)",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
            />

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={startShout}
                disabled={!shout.trim()}
                style={{
                  padding: "14px 48px", borderRadius: "999px",
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

            <p style={{
              fontFamily: "var(--font-lato)", fontSize: "10px",
              color: "rgba(176,160,144,0.4)", textAlign: "center",
              letterSpacing: "0.1em", lineHeight: 1.7,
            }}>
              Carrying something heavier than words?{" "}
              <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer"
                style={{ color: "rgba(201,168,76,0.5)", textDecoration: "underline" }}>
                You are not alone.
              </a>
            </p>
          </div>
        )}

        {/* Shouting — just let the cliff scene do the work */}
        {phase === "shouting" && (
          <div style={{ height: "80px" }} />
        )}

        {/* Echo + still */}
        {(phase === "echo" || phase === "still") && (
          <div style={{
            width: "100%", maxWidth: "480px",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "24px", textAlign: "center",
            opacity: echoVisible ? 1 : 0,
            transform: echoVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}>
            <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "26px",
              fontStyle: "italic", color: "var(--stone-light)", lineHeight: 1.5,
              letterSpacing: "0.02em",
            }}>
              {echo}
            </p>

            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "17px",
              fontStyle: "italic", color: "rgba(176,160,144,0.75)", lineHeight: 1.8,
              maxWidth: "380px",
            }}>
              {closing}
            </p>

            <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={reset} style={{
                fontFamily: "var(--font-lato)", fontSize: "11px",
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--stone)", background: "none", border: "none",
                borderBottom: "1px solid rgba(176,160,144,0.3)",
                cursor: "pointer", paddingBottom: "2px",
              }}>shout again</button>
              <a href="/" style={{
                fontFamily: "var(--font-lato)", fontSize: "11px",
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--stone)", textDecoration: "none",
                borderBottom: "1px solid rgba(176,160,144,0.3)",
                paddingBottom: "2px",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
              >make a wish</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ── Cliff SVG scene ── */
function CliffScene({ phase, windProgress, armsRaised, particles }: {
  phase: Phase; windProgress: number; armsRaised: boolean; particles: WordParticle[];
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="skyGrad" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#1c1c3e" />
            <stop offset="100%" stopColor="#0d0d1a" />
          </radialGradient>
          <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,249,230,0.18)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="valleyMist" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(176,160,144,0.04)" />
            <stop offset="100%" stopColor="rgba(176,160,144,0.0)" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="600" fill="url(#skyGrad)" />

        {/* Stars — static a few */}
        {[
          [120,60],[200,30],[340,80],[500,45],[620,70],[700,30],[750,90],
          [60,120],[400,20],[550,110],[150,140],[680,50],
        ].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={0.8 + (i%3)*0.4} fill="white" opacity={0.4 + (i%3)*0.2}/>
        ))}

        {/* Moon */}
        <circle cx="660" cy="75" r="55" fill="url(#moonHalo)" />
        <circle cx="660" cy="75" r="26" fill="#f5efe0" opacity="0.92" />
        <circle cx="653" cy="68" r="8" fill="rgba(220,200,160,0.3)" />

        {/* Far mountains */}
        <path d="M0 420 L80 310 L160 380 L260 270 L360 350 L460 240 L560 320 L660 230 L760 300 L800 260 L800 600 L0 600 Z"
          fill="#111125" opacity="0.95" />
        {/* Mid mountains */}
        <path d="M0 460 L120 370 L200 420 L310 340 L400 400 L500 330 L600 390 L700 350 L800 380 L800 600 L0 600 Z"
          fill="#13132b" opacity="0.9" />

        {/* Valley floor mist */}
        <ellipse cx="400" cy="520" rx="500" ry="80" fill="url(#valleyMist)" />

        {/* Cliff platform the figure stands on */}
        <path d="M0 500 Q60 494 120 497 Q160 498 195 500 L195 600 L0 600 Z"
          fill="#1a1a3a" />
        <path d="M195 500 Q210 496 220 508 Q224 515 226 600 L195 600 Z"
          fill="#13132b" />
        {/* Cliff edge highlight */}
        <path d="M0 500 Q100 496 195 499" fill="none" stroke="rgba(176,160,144,0.15)" strokeWidth="1.5"/>

        {/* Wind lines during shout */}
        {phase === "shouting" && [0,1,2,3,4].map(i => (
          <line key={i}
            x1={220 + windProgress * 60}
            y1={400 + i * 22 - windProgress * 20}
            x2={280 + windProgress * 180 + i * 15}
            y2={395 + i * 22 - windProgress * 40}
            stroke={`rgba(201,168,76,${Math.max(0, 0.35 - windProgress * 0.3)})`}
            strokeWidth={1.5 - i * 0.2}
            strokeLinecap="round"
            style={{ animation: `windLine ${0.8 + i * 0.15}s ease-out ${i * 0.08}s forwards` }}
          />
        ))}

        {/* Word particles flying away */}
        {particles.map(p => (
          <text key={p.id}
            fontSize={p.size}
            fill={`rgba(245,239,224,${p.opacity})`}
            fontFamily="Georgia, serif"
            fontStyle="italic"
            textAnchor="middle"
            style={{
              animation: `wordsCarry ${1.2 + Math.random() * 0.4}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.3}s`,
            }}
            x={`${p.x}%`}
            y={`${p.y}%`}
            transform={`rotate(${p.rotation})`}
          >
            {p.word}
          </text>
        ))}

        {/* Stick figure on cliff edge */}
        <g transform="translate(185, 444)">
          {/* Head */}
          <circle cx="0" cy="-8" r="6" fill="rgba(176,160,144,0.85)" />
          {/* Body */}
          <line x1="0" y1="-2" x2="0" y2="22" stroke="rgba(176,160,144,0.85)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Arms */}
          {armsRaised ? (
            <>
              <line x1="0" y1="6" x2="-14" y2="-6" stroke="rgba(176,160,144,0.85)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="6" x2="14" y2="-6" stroke="rgba(176,160,144,0.85)" strokeWidth="2" strokeLinecap="round"/>
            </>
          ) : (
            <>
              <line x1="0" y1="6" x2="-10" y2="16" stroke="rgba(176,160,144,0.85)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="6" x2="10" y2="16" stroke="rgba(176,160,144,0.85)" strokeWidth="2" strokeLinecap="round"/>
            </>
          )}
          {/* Legs */}
          <line x1="0" y1="22" x2="-7" y2="36" stroke="rgba(176,160,144,0.85)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="0" y1="22" x2="7" y2="36" stroke="rgba(176,160,144,0.85)" strokeWidth="2" strokeLinecap="round"/>
        </g>
      </svg>
    </div>
  );
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
