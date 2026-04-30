"use client";
import { useState, useRef } from "react";
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
      progress += 0.008;
      setBurnProgress(Math.min(progress, 1));
      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => { setPhase("flushing"); startFlush(); }, 400);
      }
    }, 50);
  }

  function startFlush() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.018;
      setFlushProgress(Math.min(progress, 1));
      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => { setPhase("done"); mascotReact("hopeful", "♡"); }, 600);
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

      <a href="/" style={{
        position: "fixed", top: "20px", left: "20px",
        fontFamily: "var(--font-lato)", fontSize: "11px",
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: "var(--stone)", textDecoration: "none", zIndex: 20,
        transition: "color 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
      >
        ← the well
      </a>

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100vh", padding: "80px 24px 80px",
      }}>

        {/* Header — only show on write phase */}
        {phase === "write" && (
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
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "17px",
              fontStyle: "italic", color: "var(--stone-light)",
              maxWidth: "420px", lineHeight: 1.8,
            }}>
              Say everything you never got to say. Write it all out.
              Then watch it burn. No one will read this.
              It is only for you.
            </p>
            <div style={{
              width: "60px", height: "1px",
              background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
              margin: "20px auto 0",
            }} />
          </div>
        )}

        {/* PHASE: write */}
        {phase === "write" && (
          <div style={{
            width: "100%", maxWidth: "480px",
            display: "flex", flexDirection: "column", gap: "16px",
            animation: "fadeInUp 0.6s ease forwards",
          }}>
            <input
              type="text"
              placeholder="Their name (optional)"
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
                }}
              >
                {photo ? "Change photo" : "Add a photo (optional)"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
              <p style={{ fontFamily: "var(--font-lato)", fontSize: "10px", color: "var(--stone)", marginTop: "6px", letterSpacing: "0.1em" }}>
                Never stored. Exists only in your browser.
              </p>
            </div>

            {photo && (
              <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(201,168,76,0.2)", opacity: 0.6 }}>
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
            display: "flex", flexDirection: "column", alignItems: "center", gap: "32px",
            animation: "fadeInUp 0.4s ease forwards",
          }}>
            <BurnAnimation letter={letter} name={name} photo={photo} progress={burnProgress} />
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "20px",
              fontStyle: "italic", color: "var(--stone-light)",
              textAlign: "center", lineHeight: 1.7,
              opacity: burnProgress > 0.3 ? 1 : 0,
              transition: "opacity 0.8s ease",
            }}>
              {burnProgress < 0.6 ? "Everything you held. It is leaving now." : "Almost gone."}
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
          </div>
        )}

        {/* PHASE: done */}
        {phase === "done" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "24px", textAlign: "center", maxWidth: "400px",
            animation: "fadeInUp 0.8s ease forwards",
          }}>
            <div style={{ fontSize: "40px", opacity: 0.6 }}>✦</div>
            <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "26px",
              fontStyle: "italic", color: "var(--cream)", lineHeight: 1.5,
            }}>
              {name ? `You let go of ${name}.` : "You let go."}
            </p>
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "18px",
              fontStyle: "italic", color: "var(--stone-light)", lineHeight: 1.8,
            }}>
              That took courage. The weight is a little lighter now.
            </p>
            <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={reset} style={{
                fontFamily: "var(--font-lato)", fontSize: "11px",
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--stone)", background: "none", border: "none",
                borderBottom: "1px solid rgba(176,160,144,0.3)",
                cursor: "pointer", paddingBottom: "2px",
              }}>write another</button>
              <a href="/" style={{
                fontFamily: "var(--font-lato)", fontSize: "11px",
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--stone)", textDecoration: "none",
                borderBottom: "1px solid rgba(176,160,144,0.3)",
                paddingBottom: "2px",
              }}>make a wish</a>
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
              { href: "/the-cliff", label: "The Cliff" },
              { href: "/contact", label: "Contact" },
            ].map(link => (
              <a key={link.href} href={link.href} style={{ color: "var(--stone)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
              >{link.label}</a>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}

/* ── Burn animation ── */
function BurnAnimation({ letter, name, photo, progress }: {
  letter: string; name: string; photo: string | null; progress: number;
}) {
  // How far up the burn has consumed (0→1)
  const burnHeight = progress * 115; // % of paper height
  const charHeight = progress * 80;

  return (
    <div style={{ position: "relative", width: "320px" }}>
      {/* Paper */}
      <div style={{
        background: `rgba(245,235,210,${1 - progress * 0.85})`,
        border: `1px solid rgba(201,168,76,${0.4 - progress * 0.3})`,
        borderRadius: "4px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        minHeight: "180px",
        boxShadow: progress > 0.2
          ? `0 0 ${progress * 40}px ${progress * 20}px rgba(192,57,43,0.15)`
          : "none",
        transition: "box-shadow 0.3s",
      }}>
        {/* Letter text */}
        <p style={{
          fontFamily: "var(--font-serif)", fontSize: "15px",
          color: `rgba(13,13,26,${Math.max(0, 1 - progress * 1.4)})`,
          lineHeight: 1.65, margin: 0,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          maxHeight: "140px", overflow: "hidden",
          position: "relative", zIndex: 2,
        }}>
          {name && `Dear ${name},\n\n`}{letter.slice(0, 300)}{letter.length > 300 ? "…" : ""}
        </p>

        {/* Photo if exists */}
        {photo && (
          <div style={{
            marginTop: "12px", width: "60px", height: "60px",
            borderRadius: "4px", overflow: "hidden",
            opacity: Math.max(0, 1 - progress * 2),
            position: "relative", zIndex: 2,
          }}>
            <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Char edge — dark at the bottom creeping up */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${charHeight}%`,
          background: "linear-gradient(to top, #0d0d0d 0%, rgba(40,20,10,0.9) 40%, transparent 100%)",
          pointerEvents: "none", zIndex: 3,
          transition: "height 0.08s linear",
        }} />

        {/* Fire overlay — orange/red rising */}
        <div style={{
          position: "absolute", bottom: `${charHeight * 0.6}%`, left: 0, right: 0,
          height: `${progress * 50}%`,
          background: "linear-gradient(to top, rgba(192,57,43,0.0) 0%, rgba(230,126,34,0.7) 40%, rgba(241,196,15,0.4) 70%, transparent 100%)",
          pointerEvents: "none", zIndex: 4,
          mixBlendMode: "screen",
          transition: "height 0.08s linear, bottom 0.08s linear",
        }} />

        {/* Glowing ember edge */}
        {progress > 0.1 && (
          <div style={{
            position: "absolute",
            bottom: `${charHeight * 0.6}%`,
            left: "5%", right: "5%",
            height: "3px",
            background: `rgba(241,196,15,${Math.min(1, progress * 2)})`,
            borderRadius: "999px",
            boxShadow: `0 0 8px 3px rgba(230,126,34,0.6)`,
            pointerEvents: "none", zIndex: 5,
            transition: "bottom 0.08s linear",
          }} />
        )}
      </div>

      {/* Flame emojis at base */}
      {progress > 0.05 && (
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "2px", marginTop: "-4px",
          position: "relative", zIndex: 6,
          opacity: Math.min(1, progress * 5),
        }}>
          {["🔥", "🔥", "🔥", "🔥", "🔥"].map((f, i) => (
            <span key={i} style={{
              fontSize: `${16 + (i === 2 ? 6 : i === 1 || i === 3 ? 4 : 0)}px`,
              display: "inline-block",
              animation: `flicker${i % 3} ${0.25 + i * 0.07}s ease-in-out infinite alternate`,
              transformOrigin: "bottom center",
            }}>{f}</span>
          ))}
        </div>
      )}

      {/* Rising ash particles */}
      {progress > 0.25 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              borderRadius: "50%",
              background: i % 2 === 0 ? "rgba(200,180,160,0.7)" : "rgba(100,80,60,0.5)",
              left: `${10 + i * 11}%`,
              bottom: `${20 + (i % 4) * 12}%`,
              animation: `ashFloat${i % 3} ${1.2 + i * 0.25}s ease-out ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Flush animation ── */
function FlushAnimation({ progress }: { progress: number }) {
  const swirling = progress > 0.1;
  const gone = progress > 0.8;

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <svg width="140" height="170" viewBox="0 0 140 170" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="waterBowl" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#1a3a5a" />
            <stop offset="100%" stopColor="#0d1f30" />
          </radialGradient>
        </defs>
        {/* Bowl */}
        <path d="M20 60 Q20 140 70 150 Q120 140 120 60" fill="url(#waterBowl)" stroke="rgba(176,160,144,0.3)" strokeWidth="1.5"/>
        {/* Water surface */}
        <ellipse cx="70" cy="60" rx="50" ry="12" fill="#1a3a5a" stroke="rgba(100,160,200,0.4)" strokeWidth="1"/>

        {/* Swirl lines */}
        {swirling && [0,1,2].map(i => (
          <ellipse key={i}
            cx="70" cy={70 + progress * 30}
            rx={Math.max(1, 28 - i * 8 - progress * 22)}
            ry={Math.max(0.5, 7 - i * 2 - progress * 5)}
            fill="none"
            stroke={`rgba(41,128,185,${0.5 - i * 0.12})`}
            strokeWidth="1.5"
            style={{ animation: `swirl ${0.6 - i * 0.1}s linear infinite` }}
            strokeDasharray={`${10 - i * 3} ${4 + i * 2}`}
          />
        ))}

        {/* Ash/debris spiraling down */}
        {!gone && (
          <ellipse
            cx="70"
            cy={65 + progress * 70}
            rx={Math.max(0, 18 - progress * 19)}
            ry={Math.max(0, 5 - progress * 5.5)}
            fill={`rgba(40,25,15,${Math.max(0, 0.8 - progress)})`}
          />
        )}

        {/* Drain hole darkening */}
        <circle cx="70" cy="148" r={3 + progress * 4} fill="rgba(0,0,0,0.8)" opacity={progress}/>
      </svg>

      <p style={{
        fontFamily: "var(--font-serif)", fontSize: "22px",
        fontStyle: "italic",
        color: gone ? "var(--cream)" : "var(--stone-light)",
        transition: "color 0.8s ease",
        letterSpacing: "0.04em",
      }}>
        {gone ? "Gone." : progress < 0.4 ? "Going…" : "Almost gone…"}
      </p>

      {gone && (
        <p style={{
          fontFamily: "var(--font-lato)", fontSize: "11px",
          letterSpacing: "0.3em", textTransform: "uppercase",
          color: "var(--stone)", animation: "fadeInUp 0.6s ease forwards",
        }}>
          washed away
        </p>
      )}
    </div>
  );
}
