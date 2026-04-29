"use client";
import { useState, useEffect } from "react";
import StarField from "@/components/StarField";
import { useMascotReact } from "@/components/Mascot";

const ZOMBITA_NAMES = ["Zombita", "Zombita", "Zombita"]; // always Zombita

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
              🤗 Send a Hug
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

function HugAnimation({ sending = false }: { sending?: boolean }) {
  return (
    <div style={{ position: "relative", width: "120px", height: "120px" }}>
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <defs>
          <radialGradient id="hugGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(201,168,76,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="55" fill="url(#hugGlow)"
          style={{ animation: sending ? "pulse 0.8s ease-in-out infinite alternate" : "none" }}
        />
        {/* Left figure */}
        <circle cx="35" cy="35" r="10" fill="rgba(176,160,144,0.6)" />
        <path d="M35 45 Q20 60 25 80" stroke="rgba(176,160,144,0.6)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Right figure */}
        <circle cx="85" cy="35" r="10" fill="rgba(176,160,144,0.6)" />
        <path d="M85 45 Q100 60 95 80" stroke="rgba(176,160,144,0.6)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Arms reaching */}
        <path d="M25 80 Q60 95 95 80" stroke="rgba(201,168,76,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"
          style={{ animation: sending ? "none" : "hugPulse 2s ease-in-out infinite" }}
        />
        {/* Heart */}
        <text x="60" y="68" textAnchor="middle" fontSize="18"
          style={{ animation: "heartbeat 1.4s ease-in-out infinite" }}
        >♡</text>
      </svg>
      <style>{`
        @keyframes pulse { from { opacity: 0.4; } to { opacity: 1; } }
        @keyframes hugPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes heartbeat { 0%,100% { font-size: 18px; } 50% { font-size: 22px; } }
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
