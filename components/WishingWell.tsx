"use client";
import { useState, useRef, useEffect } from "react";
import WishingWellSVG, { WellHandle } from "./WishingWellSVG";
import { getRandomQuote } from "@/lib/quotes";
import { postWish, postLetter, createCoinCheckout } from "@/lib/api";
import { getToken, getAnonId } from "@/lib/auth";
import { shimmerStars } from "./StarField";
import { useMascotReact } from "./Mascot";

type Phase = "idle" | "dissolving" | "quote" | "letter-prompt" | "letter-sent";

const COIN_OPTIONS = [
  { label: "5¢",  cents: 5 },
  { label: "10¢", cents: 10 },
  { label: "25¢", cents: 25 },
  { label: "50¢", cents: 50 },
  { label: "$1",  cents: 100 },
];

export default function WishingWell({ initialWishCount }: { initialWishCount: number }) {
  const [phase,          setPhase]          = useState<Phase>("idle");
  const [wishText,       setWishText]       = useState("");
  const [quote,          setQuote]          = useState(getRandomQuote());
  const [wishCount,      setWishCount]      = useState(initialWishCount);
  const [coinTrayOpen,   setCoinTrayOpen]   = useState(false);
  const [selectedCoin,   setSelectedCoin]   = useState<number | null>(null);
  const [letterEmail,    setLetterEmail]    = useState("");
  const [letterMonths,   setLetterMonths]   = useState(12);
  const [loading,        setLoading]        = useState(false);
  const [soundOn,        setSoundOn]        = useState(false);
  const [showWishText,   setShowWishText]   = useState(true);

  const wellRef  = useRef<WellHandle>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const splashRef = useRef<HTMLAudioElement | null>(null);
  const mascotReact = useMascotReact();

  useEffect(() => {
    // Ambient audio setup (you provide the mp3 files in /public)
    audioRef.current  = new Audio("/sounds/water-ambient.mp3");
    splashRef.current = new Audio("/sounds/splash.mp3");
    if (audioRef.current) {
      audioRef.current.loop   = true;
      audioRef.current.volume = 0.25;
    }
    if (splashRef.current) splashRef.current.volume = 0.6;
  }, []);

  function toggleSound() {
    if (!audioRef.current) return;
    if (soundOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setSoundOn(!soundOn);
  }

  async function handleWish() {
    if (!wishText.trim() || loading) return;
    setLoading(true);

    try {
      const token  = getToken();
      const anonId = getAnonId();
      await postWish(wishText.trim(), anonId, token);
      setWishCount(c => c + 1);
    } catch { /* silent — wish still completes visually */ }

    // Dissolve animation
    setShowWishText(false);
    setPhase("dissolving");

    // Stars shimmer
    shimmerStars();
    mascotReact("hopeful", "✦");

    setTimeout(() => {
      setPhase("quote");
      setQuote(getRandomQuote());
      wellRef.current?.triggerRipple();
      setLoading(false);
    }, 900);
  }

  async function handleCoinToss() {
    if (!selectedCoin) return;
    setLoading(true);
    try {
      const token  = getToken();
      const anonId = getAnonId();
      const { checkout_url } = await createCoinCheckout(selectedCoin, anonId, token);
      wellRef.current?.triggerCoinDrop();
      if (soundOn && splashRef.current) splashRef.current.play().catch(() => {});
      mascotReact("happy", "🪙!");
      setTimeout(() => {
        window.location.href = checkout_url;
      }, 1000);
    } catch {
      setLoading(false);
    }
  }

  async function handleLetter() {
    if (!letterEmail || loading) return;
    setLoading(true);
    try {
      const token  = getToken();
      const anonId = getAnonId();
      await postLetter(wishText.trim(), letterEmail, letterMonths, anonId, token);
      setPhase("letter-sent");
    } catch { /* silent */ }
    setLoading(false);
  }

  function reset() {
    setPhase("idle");
    setWishText("");
    setShowWishText(true);
    setLetterEmail("");
    setCoinTrayOpen(false);
    setSelectedCoin(null);
  }

  return (
    <div className="relative z-10 flex flex-col items-center min-h-screen px-6 py-12">

      {/* Sound toggle */}
      <button
        onClick={toggleSound}
        className="fixed top-5 right-5 text-xs tracking-widest uppercase text-stone-400 hover:text-amber-300 transition-colors z-20"
        style={{ fontFamily: "var(--font-lato)" }}
        aria-label="Toggle ambient sound"
      >
        {soundOn ? "♪ on" : "♪ off"}
      </button>

      {/* Auth button */}
      <AuthNav />

      {/* Title */}
      <div className="text-center mb-10 mt-4">
        <p className="text-xs tracking-[0.35em] uppercase mb-2" style={{ color: "var(--stone-light)", fontFamily: "var(--font-lato)" }}>
          a quiet place to
        </p>
        <h1 className="text-6xl font-light mb-3" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
          Wishing Well
        </h1>
        <p className="text-base italic" style={{ fontFamily: "var(--font-serif)", color: "var(--stone-light)" }}>
          Close your eyes. Think of what you want.<br />Then let the water carry it.
        </p>
      </div>

      {/* The Well */}
      <WishingWellSVG ref={wellRef} />

      {/* PHASE: idle / writing */}
      {(phase === "idle" || phase === "dissolving") && (
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <p className="text-lg italic" style={{ fontFamily: "var(--font-serif)", color: "var(--stone-light)" }}>
            What do you wish for?
          </p>

          <div className="w-full relative">
            <textarea
              value={wishText}
              onChange={e => setWishText(e.target.value)}
              placeholder="Write your wish here… no one will read it."
              rows={4}
              maxLength={1000}
              style={{
                width: "100%",
                background: showWishText ? "rgba(255,255,255,0.04)" : "transparent",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: "12px",
                color: "var(--cream)",
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                lineHeight: "1.6",
                padding: "18px 20px",
                resize: "none",
                outline: "none",
                caretColor: "var(--gold)",
                animation: phase === "dissolving" ? "wishDissolve 0.9s ease forwards" : undefined,
              }}
              onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(201,168,76,0.25)"}
              disabled={phase === "dissolving"}
            />
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={handleWish}
              disabled={!wishText.trim() || loading}
              className="px-10 py-3 rounded-full text-base transition-all"
              style={{
                background: wishText.trim() ? "var(--gold)" : "rgba(201,168,76,0.3)",
                color: wishText.trim() ? "var(--night)" : "var(--stone)",
                fontFamily: "var(--font-serif)",
                fontSize: "17px",
                border: "none",
                cursor: wishText.trim() ? "pointer" : "default",
                letterSpacing: "0.06em",
              }}
            >
              {loading ? "Sending…" : "Make My Wish ✦"}
            </button>

            <button
              onClick={() => setCoinTrayOpen(!coinTrayOpen)}
              className="px-6 py-3 rounded-full text-sm transition-all"
              style={{
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.35)",
                color: "var(--gold-light)",
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              🪙 Drop a Coin
            </button>
          </div>

          {/* Coin tray */}
          {coinTrayOpen && (
            <div className="flex flex-col items-center gap-3 animate-fade-in-up w-full">
              <p className="text-xs tracking-widest uppercase" style={{ color: "var(--stone-light)", fontFamily: "var(--font-lato)" }}>
                Choose your coin
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                {COIN_OPTIONS.map(opt => (
                  <button
                    key={opt.cents}
                    onClick={() => setSelectedCoin(opt.cents)}
                    className="px-4 py-2 rounded-full text-sm transition-all"
                    style={{
                      border: selectedCoin === opt.cents
                        ? "1px solid rgba(201,168,76,0.8)"
                        : "1px solid rgba(201,168,76,0.3)",
                      background: selectedCoin === opt.cents ? "rgba(201,168,76,0.15)" : "transparent",
                      color: "var(--gold-light)",
                      fontFamily: "var(--font-lato)",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCoinToss}
                disabled={!selectedCoin || loading}
                className="px-6 py-2 rounded-full text-sm transition-all"
                style={{
                  border: "1px solid rgba(201,168,76,0.5)",
                  color: selectedCoin ? "var(--gold)" : "var(--stone)",
                  background: "transparent",
                  fontFamily: "var(--font-serif)",
                  fontSize: "15px",
                  cursor: selectedCoin ? "pointer" : "default",
                  opacity: selectedCoin ? 1 : 0.5,
                }}
              >
                Toss it in →
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASE: quote */}
      {phase === "quote" && (
        <div className="w-full max-w-md flex flex-col items-center gap-5 animate-fade-in-up">
          {/* Envelope / sealed letter animation */}
          <div className="text-3xl animate-seal" aria-hidden>✉</div>

          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

          <blockquote
            className="text-center italic leading-relaxed"
            style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--cream)" }}
          >
            "{quote.text}"
          </blockquote>
          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--stone-light)", fontFamily: "var(--font-lato)" }}>
            — {quote.author}
          </p>

          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

          <button
            onClick={() => setPhase("letter-prompt")}
            className="text-sm italic transition-colors"
            style={{ color: "var(--stone-light)", fontFamily: "var(--font-serif)", background: "none", border: "none", cursor: "pointer" }}
          >
            Send this wish to your future self →
          </button>

          <button
            onClick={reset}
            className="text-xs tracking-widest uppercase transition-colors mt-2"
            style={{
              color: "var(--stone)",
              fontFamily: "var(--font-lato)",
              background: "none",
              border: "none",
              borderBottom: "1px solid rgba(176,160,144,0.3)",
              cursor: "pointer",
              paddingBottom: "2px",
            }}
          >
            make another wish
          </button>
        </div>
      )}

      {/* PHASE: letter prompt */}
      {phase === "letter-prompt" && (
        <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in-up">
          <p className="text-lg italic text-center" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
            The well will keep your wish and return it to you.
          </p>
          <input
            type="email"
            placeholder="your@email.com"
            value={letterEmail}
            onChange={e => setLetterEmail(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "8px",
              color: "var(--cream)",
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              padding: "12px 16px",
              outline: "none",
            }}
          />
          <div className="flex gap-3 items-center">
            {[6, 12].map(m => (
              <button
                key={m}
                onClick={() => setLetterMonths(m)}
                className="px-4 py-1 rounded-full text-xs transition-all"
                style={{
                  border: letterMonths === m ? "1px solid rgba(201,168,76,0.8)" : "1px solid rgba(201,168,76,0.3)",
                  background: letterMonths === m ? "rgba(201,168,76,0.15)" : "transparent",
                  color: "var(--gold-light)",
                  fontFamily: "var(--font-lato)",
                  cursor: "pointer",
                }}
              >
                {m} months
              </button>
            ))}
          </div>
          <button
            onClick={handleLetter}
            disabled={!letterEmail || loading}
            className="px-8 py-3 rounded-full transition-all"
            style={{
              background: letterEmail ? "var(--gold)" : "rgba(201,168,76,0.3)",
              color: letterEmail ? "var(--night)" : "var(--stone)",
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              border: "none",
              cursor: letterEmail ? "pointer" : "default",
            }}
          >
            {loading ? "Sealing…" : "Seal My Wish ✦"}
          </button>
          <button onClick={() => setPhase("quote")} style={{ color: "var(--stone)", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-lato)" }}>
            ← go back
          </button>
        </div>
      )}

      {/* PHASE: letter sent */}
      {phase === "letter-sent" && (
        <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in-up text-center">
          <div className="text-4xl animate-seal">✉</div>
          <p className="text-xl italic" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
            Your wish is sealed.
          </p>
          <p className="text-sm" style={{ fontFamily: "var(--font-lato)", color: "var(--stone-light)", lineHeight: 1.7 }}>
            The well will return it to you in {letterMonths} months.<br />
            Believe in it until then.
          </p>
          <button onClick={reset} className="mt-4 text-xs tracking-widest uppercase" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)", background: "none", border: "none", borderBottom: "1px solid rgba(176,160,144,0.3)", cursor: "pointer", paddingBottom: "2px" }}>
            make another wish
          </button>
        </div>
      )}

      {/* Global counter */}
      <div className="mt-16 text-center">
        <span className="block text-4xl" style={{ fontFamily: "var(--font-serif)", color: "var(--gold-light)" }}>
          {wishCount.toLocaleString()}
        </span>
        <span className="text-xs tracking-widest uppercase" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
          wishes made
        </span>
      </div>

      {/* Footer nav */}
      <nav className="mt-12 flex gap-6 flex-wrap justify-center text-xs tracking-widest uppercase" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
        {[
          { href: "/evil-eye",   label: "Evil Eye" },
          { href: "/the-flame",  label: "The Flame" },
          { href: "/companion",  label: "The Companion" },
          { href: "/let-go",     label: "Let Go" },
          { href: "/the-hug",    label: "The Hug" },
          { href: "/the-cliff",  label: "The Cliff" },
          { href: "/about",      label: "About" },
          { href: "/contact",    label: "Contact" },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            className="hover:text-amber-300 transition-colors"
            style={{ color: "var(--stone)", textDecoration: "none" }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function AuthNav() {
  const [user, setUser] = useState<{name: string; avatar_url?: string} | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    import("@/lib/api").then(({ getMe }) => getMe(token).then(setUser));
  }, []);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="fixed top-5 left-5 z-20">
      {user ? (
        <a href="/profile" className="flex items-center gap-2 text-xs tracking-widest uppercase hover:text-amber-300 transition-colors" style={{ color: "var(--stone-light)", fontFamily: "var(--font-lato)" }}>
          {user.avatar_url && <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />}
          {user.name.split(" ")[0]}
        </a>
      ) : (
        <a href={`${API}/auth/google`} className="text-xs tracking-widest uppercase hover:text-amber-300 transition-colors" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
          Sign in
        </a>
      )}
    </div>
  );
}
