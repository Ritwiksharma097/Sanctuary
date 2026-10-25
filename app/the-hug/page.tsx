"use client";
import { useState, useEffect } from "react";
import StarField from "@/components/StarField";
import { useMascotReact } from "@/components/Mascot";


const WARM_MESSAGES = [
  "Someone out there is thinking of you.",
  "You are not as alone as it feels right now.",
  "A stranger just chose to send you warmth.",
  "Something warm just came your way.",
  "You were thought of. Just now. By someone real.",
];

type Phase = "idle" | "sending" | "sent" | "received";

export default function TheHugPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [yourName, setYourName] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [warmMessage, setWarmMessage] = useState("");
  const [hugCount, setHugCount] = useState(0);
  const mascotReact = useMascotReact();

  useEffect(() => {
    // Simulate a hug count from the server
    setHugCount(Math.floor(Math.random() * 8000) + 2000);
  }, []);

  function sendHug() {
    if (!yourName.trim()) return;
    setPhase("sending");
    mascotReact("happy", "♡");

    setTimeout(() => {
      // Randomly either send to a "real person" or Zombita
      const toZombita = Math.random() > 0.6;
      const recipient = toZombita
        ? "Zombita"
        : pick(RANDOM_NAMES);
      setReceivedFrom(recipient);
      setWarmMessage(pick(WARM_MESSAGES));
      setHugCount(c => c + 1);
      setPhase("sent");
    }, 1800);
  }

  function reset() {
    setPhase("idle");
    setYourName("");
    setReceivedFrom("");
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <StarField />

      <a href="/" style={{
        position: "fixed", top: "20px", left: "20px",
        fontFamily: "var(--font-lato)", fontSize: "11px",
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: "var(--stone)", textDecoration: "none", zIndex: 20,
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
      >
        the well
      </a>

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100vh", padding: "80px 24px 80px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{
            fontFamily: "var(--font-lato)", fontSize: "11px",
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "var(--stone-light)", marginBottom: "12px",
          }}>
            sometimes all we need
          </p>
          <h1 style={{
            fontFamily: "var(--font-serif)", fontSize: "52px",
            fontWeight: 300, color: "var(--cream)",
            marginBottom: "16px", lineHeight: 1.1,
          }}>
            The Hug
          </h1>
          <p style={{
            fontFamily: "var(--font-serif)", fontSize: "17px",
            fontStyle: "italic", color: "var(--stone-light)",
            maxWidth: "400px", lineHeight: 1.8,
          }}>
            Press a button. A random person out there receives your hug.
            They will not know who you are. You will not know who they are.
            Just warmth, passing between strangers.
          </p>
          <div style={{
            width: "60px", height: "1px",
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            margin: "20px auto 0",
          }} />
        </div>

        {/* Hug counter */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{
            fontFamily: "var(--font-serif)", fontSize: "36px",
            color: "var(--gold-light)",
          }}>
            {hugCount.toLocaleString()}
          </span>
          <p style={{
            fontFamily: "var(--font-lato)", fontSize: "10px",
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: "var(--stone)", marginTop: "4px",
          }}>
            hugs sent
          </p>
        </div>

        {/* PHASE: idle */}
        {phase === "idle" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "20px", width: "100%", maxWidth: "360px",
            animation: "fadeInUp 0.6s ease forwards",
          }}>
            <input
              type="text"
              placeholder="Your name"
              value={yourName}
              onChange={e => setYourName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendHug()}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.25)", borderRadius: "8px",
                color: "var(--cream)", fontFamily: "var(--font-serif)",
                fontSize: "18px", padding: "14px 18px",
                outline: "none", caretColor: "var(--gold)",
                textAlign: "center",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}
            />

            <button
              onClick={sendHug}
              disabled={!yourName.trim()}
              style={{
                padding: "16px 48px", borderRadius: "999px",
                background: yourName.trim() ? "var(--gold)" : "rgba(201,168,76,0.3)",
                color: yourName.trim() ? "var(--night)" : "var(--stone)",
                fontFamily: "var(--font-serif)", fontSize: "22px",
                border: "none", cursor: yourName.trim() ? "pointer" : "default",
                letterSpacing: "0.05em", transition: "background 0.2s",
              }}
            >
              Send a Hug ♡
            </button>

            <p style={{
              fontFamily: "var(--font-lato)", fontSize: "11px",
              color: "var(--stone)", letterSpacing: "0.1em", textAlign: "center",
            }}>
              If nobody is online, Zombita will receive it. She always does.
            </p>
          </div>
        )}

        {/* PHASE: sending */}
        {phase === "sending" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "24px", animation: "fadeInUp 0.4s ease forwards",
          }}>
            <HugAnimation sending />
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "18px",
              fontStyle: "italic", color: "var(--stone-light)", textAlign: "center",
            }}>
              Finding someone...
            </p>
          </div>
        )}

        {/* PHASE: sent */}
        {phase === "sent" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "24px", textAlign: "center", maxWidth: "400px",
            animation: "fadeInUp 0.6s ease forwards",
          }}>
            <HugAnimation />

            <div style={{
              width: "60px", height: "1px",
              background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            }} />

            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "22px",
              color: "var(--cream)", lineHeight: 1.5,
            }}>
              <span style={{ color: "var(--stone-light)", fontStyle: "italic" }}>{yourName}</span>
              {" hugged "}
              <span style={{ color: "var(--gold-light)", fontStyle: "italic" }}>{receivedFrom}</span>
            </p>

            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "17px",
              fontStyle: "italic", color: "var(--stone-light)", lineHeight: 1.7,
            }}>
              {warmMessage}
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
                send another
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
            </div>
          </div>
        )}

        {phase === "idle" && (
          <nav style={{
            marginTop: "auto", paddingTop: "64px",
            display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center",
            fontFamily: "var(--font-lato)", fontSize: "11px",
            letterSpacing: "0.3em", textTransform: "uppercase",
          }}>
            {[
              { href: "/", label: "Well" },
              { href: "/evil-eye", label: "Evil Eye" },
              { href: "/the-flame", label: "The Flame" },
              { href: "/let-go", label: "Let Go" },
              { href: "/the-cliff", label: "The Cliff" },
              { href: "/contact", label: "Contact" },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                color: "var(--stone)", textDecoration: "none", transition: "color 0.2s",
              }}
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

// Two warm lights (you, and a stranger) drift toward each other while the hug is
// sent, then meet in a single glowing heart.
function HugAnimation({ sending = false }: { sending?: boolean }) {
  return (
    <div style={{ position: "relative", width: "200px", height: "160px" }}>
      <svg viewBox="0 0 200 160" width="200" height="160" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="soulWarm">
            <stop offset="0%" stopColor="#fff4d6" />
            <stop offset="30%" stopColor="#f3c86b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="soulRose">
            <stop offset="0%" stopColor="#ffe8e4" />
            <stop offset="30%" stopColor="#f19a8c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d98880" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hugHalo">
            <stop offset="0%" stopColor="rgba(243,200,107,0.45)" />
            <stop offset="100%" stopColor="rgba(243,200,107,0)" />
          </radialGradient>
          <linearGradient id="heartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe3b0" />
            <stop offset="100%" stopColor="#e8956b" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx="100" cy="80" r="78" fill="url(#hugHalo)"
          style={{ animation: sending ? "hugPulse 1.2s ease-in-out infinite" : "hugPulse 3s ease-in-out infinite" }} />

        {sending ? (
          <>
            {/* Two lights orbiting closer */}
            <g style={{ animation: "soulLeft 1.8s ease-in-out forwards" }}>
              <circle cx="40" cy="80" r="26" fill="url(#soulWarm)" />
            </g>
            <g style={{ animation: "soulRight 1.8s ease-in-out forwards" }}>
              <circle cx="160" cy="80" r="26" fill="url(#soulRose)" />
            </g>
          </>
        ) : (
          <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "heartbeat 1.6s ease-in-out infinite" }}>
            <circle cx="88" cy="76" r="30" fill="url(#soulWarm)" opacity="0.8" />
            <circle cx="112" cy="76" r="30" fill="url(#soulRose)" opacity="0.8" />
            <path d="M100 104 C 72 86, 70 62, 86 58 C 94 56, 99 62, 100 66 C 101 62, 106 56, 114 58 C 130 62, 128 86, 100 104 Z"
              fill="url(#heartFill)" filter="url(#softGlow)" />
          </g>
        )}

        {/* Drifting sparks */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <circle key={i} cx={60 + i * 16} cy={120 - (i % 3) * 8} r={1.4} fill="#f3d9a0"
            style={{ animation: `floatUp ${2.4 + i * 0.3}s ease-out ${i * 0.35}s infinite` }} />
        ))}
      </svg>
      <style>{`
        @keyframes hugPulse  { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        @keyframes heartbeat { 0%,100% { transform: scale(1); } 15% { transform: scale(1.08); } 30% { transform: scale(1); } 45% { transform: scale(1.05); } }
        @keyframes soulLeft  { from { transform: translate(0, 0); } to { transform: translate(44px, -6px); } }
        @keyframes soulRight { from { transform: translate(0, 0); } to { transform: translate(-44px, -6px); } }
      `}</style>
    </div>
  );
}

const RANDOM_NAMES = [
  "Aria","Lena","Kai","Sam","Maya","Noah","Zara","Leo","Mia","Eli",
  "Nora","Jin","Ava","Rio","Luna","Max","Isla","Ray","Cleo","Finn",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
