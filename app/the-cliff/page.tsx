"use client";
import { useState, useEffect, useRef } from "react";
import StarField from "@/components/StarField";
import Moon from "@/components/Moon";
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
  duration: number;
  delay: number;
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
      x: FIGURE.x + 30 + Math.random() * 120,  // start just downwind of the figure
      y: FIGURE.y - 20 + (Math.random() - 0.5) * 90,
      vx: 0.8 + Math.random() * 1.2,
      vy: -(0.1 + Math.random() * 0.4),
      opacity: 1,
      size: 24 + Math.random() * 16,
      duration: 1.2 + Math.random() * 0.4,
      delay: 0.75 + i * 0.12 + Math.random() * 0.2,   // once the arms are up, one after another
    }));
    setParticles(newParticles);

    // Wind progress for cliff scene
    let wind = 0;
    const windInterval = setInterval(() => {
      wind += 0.011;   // ~3.6s of wind: long enough for every word to leave
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
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <StarField />
      <Moon size={84} />

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

        {/* Shouting: just let the cliff scene do the work */}
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

/* ── Cliff scene ──
   Layers are Blender renders (art/cliff.py) on a transparent sky, so the shared
   sky and moon show through. All share one 1920×1080 camera; the stage below
   covers the viewport like object-fit: cover, anchored 18% from the left so the
   figure stays in frame on narrow screens. FIGURE is the figure's head in stage
   pixels (FIGURE_HEAD printed by the script). */
const STAGE_W = 1920;
const STAGE_H = 1080;
const FIGURE = { x: 0.1682 * STAGE_W, y: 0.4065 * STAGE_H };

// The figure is an animated sprite sheet (art/export-cliff-fig.sh): 8 frames per row,
// each cropped to FIG_CROP (left, top, right, bottom as fractions of the stage).
// Frames: 16 idle loop, 10 arms raising, 16 shouting loop.
const FIG_CROP = [0.1115, 0.3271, 0.2642, 0.5639];
const SHEET_COLS = 8;
const SHEET_ROWS = 6;
const IDLE = { start: 0, len: 16 };
const RAISE = { start: 16, len: 10 };
const SHOUT = { start: 26, len: 16 };
const FPS = 12;

type FigureMode = "idle" | "raising" | "shout" | "lowering";

function useFigureFrame(armsRaised: boolean) {
  const [frame, setFrame] = useState(0);
  const state = useRef<{ mode: FigureMode; i: number }>({ mode: "idle", i: 0 });

  useEffect(() => {
    const st = state.current;
    if (armsRaised && (st.mode === "idle" || st.mode === "lowering")) {
      // From idle start the raise from the bottom; mid-lower, raise from where the arms are
      if (st.mode === "idle") st.i = 0;
      st.mode = "raising";
    }
    if (!armsRaised && (st.mode === "shout" || st.mode === "raising")) {
      st.i = st.mode === "shout" ? RAISE.len - 1 : st.i;
      st.mode = "lowering";
    }
  }, [armsRaised]);

  useEffect(() => {
    const id = setInterval(() => {
      const st = state.current;
      let f = 0;
      if (st.mode === "idle") { f = IDLE.start + (st.i % IDLE.len); st.i++; }
      else if (st.mode === "raising") {
        f = RAISE.start + st.i;
        if (++st.i >= RAISE.len) { st.mode = "shout"; st.i = 0; }
      } else if (st.mode === "shout") { f = SHOUT.start + (st.i % SHOUT.len); st.i++; }
      else {
        f = RAISE.start + st.i;
        if (--st.i < 0) { st.mode = "idle"; st.i = 0; }
      }
      setFrame(f);
    }, 1000 / FPS);
    return () => clearInterval(id);
  }, []);

  return frame;
}

function CliffScene({ phase, windProgress, armsRaised, particles }: {
  phase: Phase; windProgress: number; armsRaised: boolean; particles: WordParticle[];
}) {
  const layer: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" };
  const frame = useFigureFrame(armsRaised);
  const col = frame % SHEET_COLS;
  const row = Math.floor(frame / SHEET_COLS);
  const shouting = phase === "shouting";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        bottom: 0,
        height: "max(100vh, 56.25vw)",
        width: "calc(max(100vh, 56.25vw) * 16 / 9)",
        left: "calc((100vw - max(100vh, 56.25vw) * 16 / 9) * 0.18)",
      }}>
        {/* Moonlight swells while the figure shouts */}
        <div style={{
          ...layer,
          background: "radial-gradient(ellipse at 82% 8%, rgba(200,215,255,0.22), transparent 55%)",
          opacity: shouting ? 1 : 0.35,
          transition: "opacity 1.2s ease",
        }} />

        <img src="/art/cliff.webp" alt="" style={layer} />

        {/* Valley mist, drifting; the shout drives it away down the valley */}
        <div style={{
          position: "absolute", left: "15%", right: "-30%", top: "52%", height: "30%",
          transform: shouting ? "translateX(-14%)" : "none",
          opacity: shouting ? 0.95 : 0.55,
          transition: "transform 3.5s ease-out, opacity 1.5s ease",
        }}>
          <div className="cliff-mist" style={{ position: "absolute", inset: 0 }} />
        </div>

        {/* The figure */}
        <div style={{
          position: "absolute",
          left: `${FIG_CROP[0] * 100}%`,
          top: `${FIG_CROP[1] * 100}%`,
          width: `${(FIG_CROP[2] - FIG_CROP[0]) * 100}%`,
          height: `${(FIG_CROP[3] - FIG_CROP[1]) * 100}%`,
          backgroundImage: "url(/art/cliff-figure.webp)",
          backgroundSize: `${SHEET_COLS * 100}% ${SHEET_ROWS * 100}%`,
          backgroundPosition: `${(col / (SHEET_COLS - 1)) * 100}% ${(row / (SHEET_ROWS - 1)) * 100}%`,
        }} />

        <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} style={{ ...layer, overflow: "visible" }} aria-hidden>
          {/* The voice: rings pulsing out from the figure across the valley */}
          {shouting && [0, 1, 2, 3].map(i => (
            <ellipse key={i} cx={FIGURE.x + 10} cy={FIGURE.y + 10} rx={60} ry={34}
              fill="none" stroke="rgba(230,215,175,0.4)" strokeWidth={1.5}
              style={{
                transformBox: "fill-box", transformOrigin: "center",
                animation: `voiceRing 2.2s ease-out ${0.7 + i * 0.45}s infinite both`,
              }} />
          ))}

          {/* Gusts streaming off the ledge */}
          {shouting && [0, 1, 2, 3, 4].map(i => (
            <path key={i}
              d={`M${FIGURE.x + 60} ${FIGURE.y - 40 + i * 34}
                  q ${160 + windProgress * 200} ${-30 - i * 6} ${380 + windProgress * 420 + i * 40} ${-20 - windProgress * 60}`}
              fill="none"
              stroke={`rgba(220,200,150,${Math.max(0, 0.4 - windProgress * 0.32)})`}
              strokeWidth={3 - i * 0.4}
              strokeLinecap="round"
              style={{ animation: `windLine ${0.8 + i * 0.15}s ease-out ${0.6 + i * 0.08}s both` }}
            />
          ))}

          {/* Word particles carried out over the valley */}
          {particles.map(p => (
            <text key={p.id}
              fontSize={p.size}
              fill={`rgba(245,239,224,${p.opacity})`}
              fontFamily="'Cormorant Garamond', Georgia, serif"
              fontStyle="italic"
              textAnchor="middle"
              style={{
                animation: `wordsCarry ${p.duration}s ease-out ${p.delay}s both`,
                transformBox: "fill-box",
                transformOrigin: "center",
                textShadow: "0 0 12px rgba(201,168,76,0.5)",
              }}
              x={p.x}
              y={p.y}
            >
              {p.word}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
