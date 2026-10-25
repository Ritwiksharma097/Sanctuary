"use client";
import { useState, useRef } from "react";
import StarField from "@/components/StarField";
import BurningLetter from "@/components/BurningLetter";
import ToiletFlush from "@/components/ToiletFlush";
import MatchStrike from "@/components/MatchStrike";
import { useMascotReact } from "@/components/Mascot";

type Phase = "write" | "burning" | "toilet" | "done";

export default function LetGoPage() {
  const [phase, setPhase] = useState<Phase>("write");
  const [name, setName] = useState("");
  const [letter, setLetter] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [burnProgress, setBurnProgress] = useState(0);
  const [matchLit, setMatchLit] = useState(false);
  const [ignited, setIgnited] = useState(false);
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
    setBurnProgress(0);
    setMatchLit(false);
    setIgnited(false);
    setPhase("burning");
  }

  function lit() {
    setIgnited(true);
    mascotReact("sad", "...");
  }

  function finishBurn() {
    setTimeout(() => setPhase("toilet"), 300);
  }

  function flushed() {
    setTimeout(() => { setPhase("done"); mascotReact("hopeful", "♡"); }, 400);
  }

  function reset() {
    setPhase("write");
    setName("");
    setLetter("");
    setPhoto(null);
    setBurnProgress(0);
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

        {/* Header: only show on write phase */}
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
              Done writing
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
            {!ignited && (
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: "18px", fontStyle: "italic",
                color: "var(--stone-light)", textAlign: "center", lineHeight: 1.7,
                marginBottom: "-8px", position: "relative", zIndex: 2,
              }}>
                Read it once more. Change anything you need to.<br />
                When you are ready, light the match.
              </p>
            )}
            <BurningLetter letter={letter} name={name} photo={photo}
              armed={matchLit && !ignited} onIgnite={lit}
              onProgress={setBurnProgress} onDone={finishBurn} />

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", flexWrap: "wrap",
              opacity: ignited ? 0 : 1, transition: "opacity 0.8s ease", pointerEvents: ignited ? "none" : "auto",
            }}>
              {!matchLit && (
                <button onClick={() => setPhase("write")} style={{
                  fontFamily: "var(--font-lato)", fontSize: "11px",
                  letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "var(--stone-light)", background: "none", border: "none",
                  borderBottom: "1px solid rgba(176,160,144,0.3)",
                  cursor: "pointer", paddingBottom: "2px",
                }}>← edit letter</button>
              )}
              <MatchStrike spent={ignited} onLit={() => setMatchLit(true)} />
            </div>
            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "20px",
              fontStyle: "italic", color: "var(--stone-light)",
              textAlign: "center", lineHeight: 1.7,
              opacity: ignited && burnProgress > 0.3 ? 1 : 0,
              transition: "opacity 0.8s ease",
            }}>
              {burnProgress < 0.6 ? "Everything you held. It is leaving now." : "Almost gone."}
            </p>
          </div>
        )}

        {/* PHASE: toilet */}
        {phase === "toilet" && (
          <div style={{ animation: "fadeInUp 0.5s ease forwards" }}>
            <ToiletFlush onFlushStart={() => mascotReact("happy", "!!")} onDone={flushed} />
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
