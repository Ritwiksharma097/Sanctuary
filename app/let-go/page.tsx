"use client";
import { useState, useRef, useEffect } from "react";
import StarField from "@/components/StarField";
import { useMascotReact } from "@/components/Mascot";

type Phase = "write" | "burning" | "flushing" | "done";

export default function LetGoPage() {
  const [phase, setPhase] = useState<Phase>("write");
  const [name, setName] = useState("");
  const [letter, setLetter] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [burnProgress, setBurnProgress] = useState(0);
  const [flushProgress, setFlushProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const mascotReact = useMascotReact();

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function startBurn() {
    if (!letter.trim()) return;
    setPhase("burning");
    mascotReact("sad", "...");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.012;
      setBurnProgress(Math.min(progress, 1));
      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("flushing");
          startFlush();
        }, 600);
      }
    }, 50);
  }

  function startFlush() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.02;
      setFlushProgress(Math.min(progress, 1));
      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("done");
          mascotReact("hopeful", "♡");
        }, 800);
      }
    }, 50);
  }

  function reset() {
    setPhase("write");
    setName("");
    setLetter("");
    setPhoto(null);
    setBurnProgress(0);
    setFlushProgress(0);
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <StarField />

      <a
        href="/"
        style={{
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{
            fontFamily: "var(--font-lato)", fontSize: "11px",
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "var(--stone-light)", marginBottom: "12px",
          }}>
            a ritual of release
          </p>
          <h1 style={{
            fontFamily: "var(--font-serif)", fontSize: "52px",
            fontWeight: 300, color: "var(--cream)",
            marginBottom: "16px", lineHeight: 1.1,
          }}>
            Let Go
          </h1>
          {phase === "write" && (
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "17px",
              fontStyle: "italic", color: "var(--stone-light)",
              maxWidth: "420px", lineHeight: 1.8,
            }}>
              Say everything you never got to say. Type their name. Write it all out.
              Then watch it burn. Then watch it go. No one will read this.
              It is only for you.
            </p>
          )}
          <div style={{
            width: "60px", height: "1px",
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            margin: "20px auto 0",
          }} />
        </div>

        {/* PHASE: write */}
        {phase === "write" && (
          <div style={{
            width: "100%", maxWidth: "480px",
            display: "flex", flexDirection: "column", gap: "16px",
            animation: "fadeInUp 0.6s ease forwards",
          }}>
            <input
              type="text"
              placeholder="Their name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.25)", borderRadius: "8px",
                color: "var(--cream)", fontFamily: "var(--font-serif)",
                fontSize: "20px", padding: "14px 18px", outline: "none",
                caretColor: "var(--gold)",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}
            />

            <textarea
              placeholder={`Dear ${name || "..."},\n\nWhat I never got to say is...`}
              value={letter}
              onChange={e => setLetter(e.target.value)}
              rows={8}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.25)", borderRadius: "8px",
                color: "var(--cream)", fontFamily: "var(--font-serif)",
                fontSize: "17px", lineHeight: 1.7, padding: "16px 18px",
                outline: "none", resize: "none", caretColor: "var(--gold)",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}
            />

            {/* Photo upload - optional */}
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  background: "transparent",
                  border: "1px dashed rgba(201,168,76,0.3)",
                  borderRadius: "8px", padding: "10px 20px",
                  color: "var(--stone-light)", fontFamily: "var(--font-lato)",
                  fontSize: "12px", letterSpacing: "0.2em",
                  textTransform: "uppercase", cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
              >
                {photo ? "Change photo" : "Add a photo (optional)"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                style={{ display: "none" }}
              />
              <p style={{
                fontFamily: "var(--font-lato)", fontSize: "10px",
                color: "var(--stone)", marginTop: "6px", letterSpacing: "0.1em",
              }}>
                Never stored. Exists only in your browser.
              </p>
            </div>

            {photo && (
              <div style={{
                width: "80px", height: "80px", borderRadius: "8px",
                overflow: "hidden", border: "1px solid rgba(201,168,76,0.2)",
                opacity: 0.6,
              }}>
                <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}

            <button
              onClick={startBurn}
              disabled={!letter.trim()}
              style={{
                padding: "14px 40px", borderRadius: "999px", marginTop: "8px",
                background: letter.trim() ? "var(--gold)" : "rgba(201,168,76,0.3)",
                color: letter.trim() ? "var(--night)" : "var(--stone)",
                fontFamily: "var(--font-serif)", fontSize: "17px",
                border: "none", cursor: letter.trim() ? "pointer" : "default",
                letterSpacing: "0.05em", transition: "background 0.2s",
              }}
            >
              Burn it
            </button>
          </div>
        )}

        {/* PHASE: burning */}
        {phase === "burning" && (
          <div style={{
            width: "100%", maxWidth: "480px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "24px",
          }}>
            <BurnAnimation
              letter={letter}
              name={name}
              photo={photo}
              progress={burnProgress}
            />
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "18px",
              fontStyle: "italic", color: "var(--stone-light)",
              textAlign: "center", lineHeight: 1.7,
            }}>
              Everything you said. Everything you held. It is leaving now.
            </p>
          </div>
        )}

        {/* PHASE: flushing */}
        {phase === "flushing" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "24px",
            animation: "fadeInUp 0.5s ease forwards",
          }}>
            <FlushAnimation progress={flushProgress} />
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "18px",
              fontStyle: "italic", color: "var(--stone-light)",
              textAlign: "center",
            }}>
              Gone.
            </p>
          </div>
        )}

        {/* PHASE: done */}
        {phase === "done" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "20px", textAlign: "center", maxWidth: "400px",
            animation: "fadeInUp 0.8s ease forwards",
          }}>
            <div style={{
              width: "60px", height: "1px",
              background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            }} />
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "24px",
              fontStyle: "italic", color: "var(--cream)", lineHeight: 1.6,
            }}>
              {name ? `You let go of ${name}.` : "You let go."}
            </p>
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "17px",
              fontStyle: "italic", color: "var(--stone-light)", lineHeight: 1.8,
            }}>
              That took courage. Saying everything you needed to say and then
              releasing it is one of the hardest and most honest things a person
              can do. The weight is a little lighter now.
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
                write another
              </button>
              <a
                href="/"
                style={{
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

        {/* Footer nav */}
        {phase === "write" && (
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
              { href: "/the-hug", label: "The Hug" },
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

// ─── Burn animation ───────────────────────────────────────────────────────────

function BurnAnimation({ letter, name, photo, progress }: {
  letter: string; name: string; photo: string | null; progress: number;
}) {
  return (
    <div style={{ position: "relative", width: "320px" }}>
      {/* Paper */}
      <div style={{
        background: `rgba(245,239,224,${1 - progress * 0.9})`,
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: "4px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.1s",
        minHeight: "160px",
      }}>
        {/* Letter text fading */}
        <p style={{
          fontFamily: "var(--font-serif)", fontSize: "14px",
          color: `rgba(13,13,26,${1 - progress})`,
          lineHeight: 1.6, margin: 0,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          maxHeight: "120px", overflow: "hidden",
        }}>
          {name && `Dear ${name},\n\n`}{letter.slice(0, 200)}{letter.length > 200 ? "..." : ""}
        </p>

        {/* Burn overlay from bottom */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: `${progress * 120}%`,
          background: "linear-gradient(to top, rgba(192,57,43,0.9), rgba(230,126,34,0.6), transparent)",
          pointerEvents: "none",
          transition: "height 0.1s",
        }} />

        {/* Char/ash effect */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: `${progress * 80}%`,
          background: "linear-gradient(to top, rgba(13,13,26,0.95), rgba(40,30,20,0.7), transparent)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Flame at bottom of paper */}
      {progress > 0.05 && (
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "4px", marginTop: "2px",
          opacity: Math.min(1, progress * 3),
        }}>
          {["🔥", "🔥", "🔥"].map((f, i) => (
            <span key={i} style={{
              fontSize: `${14 + i * 4}px`,
              animation: `flicker${i} 0.3s ease-in-out infinite alternate`,
            }}>{f}</span>
          ))}
        </div>
      )}

      {/* Ash particles */}
      {progress > 0.3 && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: "3px", height: "3px",
              borderRadius: "50%",
              background: `rgba(${100 + i * 20},${80 + i * 10},${60},${0.6 * progress})`,
              left: `${15 + i * 13}%`,
              bottom: `${20 + (i % 3) * 15}%`,
              animation: `ashFloat${i % 3} ${1.5 + i * 0.3}s ease-out infinite`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Flush animation ──────────────────────────────────────────────────────────

function FlushAnimation({ progress }: { progress: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="120" height="160" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        {/* Toilet bowl simplified */}
        <ellipse cx="60" cy="80" rx="45" ry="30" fill="none" stroke="rgba(176,160,144,0.4)" strokeWidth="2" />
        <path d="M15 80 Q15 130 60 140 Q105 130 105 80" fill="rgba(13,13,26,0.6)" stroke="rgba(176,160,144,0.4)" strokeWidth="2" />
        {/* Water swirl */}
        <g opacity={progress > 0.1 ? 1 : 0} style={{ transition: "opacity 0.3s" }}>
          <path
            d={`M60 90 Q${60 + Math.cos(progress * Math.PI * 4) * 20} ${90 + Math.sin(progress * Math.PI * 4) * 10} ${60 - Math.cos(progress * Math.PI * 4) * 20} ${90 - Math.sin(progress * Math.PI * 4) * 10}`}
            stroke="rgba(41,128,185,0.6)" strokeWidth="2" fill="none" strokeLinecap="round"
          />
        </g>
        {/* Ashes/paper going down */}
        <ellipse
          cx="60"
          cy={80 + progress * 60}
          rx={Math.max(0, 20 - progress * 20)}
          ry={Math.max(0, 8 - progress * 8)}
          fill={`rgba(40,30,20,${Math.max(0, 0.7 - progress * 0.7)})`}
        />
        {/* Water level rising then flushing */}
        <ellipse
          cx="60"
          cy="95"
          rx="35"
          ry="8"
          fill={`rgba(41,128,185,${0.15 + progress * 0.2})`}
        />
      </svg>
      <p style={{
        fontFamily: "var(--font-lato)", fontSize: "11px",
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: "var(--stone)", marginTop: "8px",
      }}>
        {progress < 0.5 ? "going..." : "gone."}
      </p>
    </div>
  );
}
