"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Animal roster ────────────────────────────────────────────────────────────

const DOGS = [
  "afghan_hound","bloodhound","dalmation","doberman",
  "german_shepherd","great_dane","greyhound","husky",
  "mountain_dog","shiba",
];

const CATS = [
  "grey_tabby","siamese","abyssinian","tuxedo","bobtail","longhair",
];

// ─── Emotion → animation mapping ─────────────────────────────────────────────

type Emotion = "happy" | "sad" | "anxious" | "hopeful" | "calm" | "neutral" | "excited";

const DOG_ANIM: Record<Emotion, string[]> = {
  happy:   ["barking", "jump"],
  excited: ["barking", "jump", "headbutt"],
  hopeful: ["standing", "headbutt"],
  sad:     ["layingdown"],
  anxious: ["sitting"],
  calm:    ["sleeping", "sitting"],
  neutral: ["sitting", "standing"],
};

const CAT_ANIM: Record<Emotion, string[]> = {
  happy:   ["jump", "sit_head_turn"],
  excited: ["jump", "turning"],
  hopeful: ["sitting", "sit_head_turn"],
  sad:     ["laying_down"],
  anxious: ["crouch", "sit_head_turn"],
  calm:    ["sleeping", "groom_fur"],
  neutral: ["idle", "sitting"],
};

// ─── Personality per breed ────────────────────────────────────────────────────

type Personality = { name: string; bias: Emotion };

const DOG_PERSONALITY: Record<string, Personality> = {
  afghan_hound:   { name: "Afghan Hound",    bias: "calm" },
  bloodhound:     { name: "Bloodhound",      bias: "neutral" },
  dalmation:      { name: "Dalmatian",       bias: "excited" },
  doberman:       { name: "Doberman",        bias: "anxious" },
  german_shepherd:{ name: "German Shepherd", bias: "hopeful" },
  great_dane:     { name: "Great Dane",      bias: "calm" },
  greyhound:      { name: "Greyhound",       bias: "neutral" },
  husky:          { name: "Husky",           bias: "excited" },
  mountain_dog:   { name: "Mountain Dog",    bias: "hopeful" },
  shiba:          { name: "Shiba",           bias: "calm" },
};

const CAT_PERSONALITY: Record<string, Personality> = {
  grey_tabby:  { name: "Grey Tabby",  bias: "calm" },
  siamese:     { name: "Siamese",     bias: "anxious" },
  abyssinian:  { name: "Abyssinian",  bias: "excited" },
  tuxedo:      { name: "Tuxedo",      bias: "neutral" },
  bobtail:     { name: "Bobtail",     bias: "hopeful" },
  longhair:    { name: "Longhair",    bias: "calm" },
};

// ─── Bubble messages per emotion ─────────────────────────────────────────────

const BUBBLES: Record<Emotion, string[]> = {
  happy:   ["woof! ✦", "♪", "!!"],
  excited: ["woof woof!", "!!!", "✦✦"],
  hopeful: ["...", "♡", "✦"],
  sad:     ["...", "♡", "*nuzzle*"],
  anxious: ["?", "...", "*ears up*"],
  calm:    ["zzz", "...", "♡"],
  neutral: ["...", "woof", "♪"],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type AnimalType = "dog" | "cat";

interface MascotState {
  type: AnimalType;
  breed: string;
  emotion: Emotion;
  anim: string;
  bubble: string | null;
  phase: "walking-in" | "idle" | "reacting" | "settled";
}

// ─── Global event bus ─────────────────────────────────────────────────────────
// Other components call window.mascotSignal({ emotion, bubble? }) to trigger reactions

declare global {
  interface Window {
    mascotSignal?: (opts: { emotion: Emotion; bubble?: string }) => void;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gifPath(type: AnimalType, breed: string, anim: string): string {
  return `/mascot/${type}s/${breed}/${anim}.gif`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Mascot() {
  const [state, setState] = useState<MascotState | null>(null);
  const [visible, setVisible] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pick a random animal on mount
  useEffect(() => {
    const isDog = Math.random() > 0.4; // slightly more dogs than cats
    const type: AnimalType = isDog ? "dog" : "cat";
    const breed = isDog ? pick(DOGS) : pick(CATS);
    const personality = isDog
      ? DOG_PERSONALITY[breed]
      : CAT_PERSONALITY[breed];
    const emotion: Emotion = "neutral";
    const animMap = isDog ? DOG_ANIM : CAT_ANIM;
    const anim = pick(animMap[emotion]);

    setState({
      type,
      breed,
      emotion,
      anim,
      bubble: null,
      phase: "walking-in",
    });

    // Walk in after short delay
    setTimeout(() => {
      setVisible(true);
      // Use walking animation for walk-in
      setState(s => s ? { ...s, anim: "walking" } : s);
      setTimeout(() => {
        setSlideIn(true);
        // Settle into idle after walking in
        setTimeout(() => {
          setState(s => {
            if (!s) return s;
            const animMap = s.type === "dog" ? DOG_ANIM : CAT_ANIM;
            const bias = s.type === "dog"
              ? DOG_PERSONALITY[s.breed].bias
              : CAT_PERSONALITY[s.breed].bias;
            return { ...s, anim: pick(animMap[bias]), phase: "settled", emotion: bias };
          });
        }, 1200);
      }, 100);
    }, 800);
  }, []);

  // Register global signal handler
  const react = useCallback((emotion: Emotion, customBubble?: string) => {
    if (!state) return;
    const animMap = state.type === "dog" ? DOG_ANIM : CAT_ANIM;
    const anims = animMap[emotion];
    const anim = pick(anims);
    const bubble = customBubble ?? pick(BUBBLES[emotion]);

    // Clear old timers
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);

    setState(s => s ? { ...s, emotion, anim, phase: "reacting", bubble } : s);
    setShowBubble(true);

    // Show bubble for 2.5s
    bubbleTimer.current = setTimeout(() => {
      setShowBubble(false);
      setState(s => s ? { ...s, bubble: null } : s);
    }, 2500);

    // Return to settled after 3s
    reactionTimer.current = setTimeout(() => {
      setState(s => {
        if (!s) return s;
        const bias = s.type === "dog"
          ? DOG_PERSONALITY[s.breed].bias
          : CAT_PERSONALITY[s.breed].bias;
        const animMap = s.type === "dog" ? DOG_ANIM : CAT_ANIM;
        return { ...s, anim: pick(animMap[bias]), phase: "settled", emotion: bias };
      });
    }, 3200);
  }, [state]);

  useEffect(() => {
    window.mascotSignal = (opts) => react(opts.emotion, opts.bubble);
    return () => { window.mascotSignal = undefined; };
  }, [react]);

  if (!state || !visible) return null;

  const isdog = state.type === "dog";
  const size = isdog ? 64 : 32;
  const displaySize = isdog ? 128 : 96; // render at 2x or 3x for crispness

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: slideIn ? "24px" : "-200px",
        zIndex: 50,
        transition: "right 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Speech bubble */}
      <div
        style={{
          background: "rgba(13,13,26,0.92)",
          border: "1px solid rgba(201,168,76,0.4)",
          borderRadius: "12px",
          padding: "6px 12px",
          fontFamily: "var(--font-lato)",
          fontSize: "13px",
          color: "var(--gold-light)",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          opacity: showBubble ? 1 : 0,
          transform: showBubble ? "translateY(0) scale(1)" : "translateY(6px) scale(0.95)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          position: "relative",
        }}
      >
        {state.bubble}
        {/* Triangle pointer */}
        <div style={{
          position: "absolute",
          bottom: "-7px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "7px solid rgba(201,168,76,0.4)",
        }} />
      </div>

      {/* The animal */}
      <img
        key={`${state.breed}-${state.anim}`}
        src={gifPath(state.type, state.breed, state.anim)}
        alt={`${state.type} companion`}
        width={displaySize}
        height={displaySize}
        style={{
          imageRendering: "pixelated",
          width: `${displaySize}px`,
          height: `${displaySize}px`,
          objectFit: "contain",
          // Flip horizontally so dog walks in from right facing left
          transform: "scaleX(-1)",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
        }}
        onError={e => {
          // Fallback to idle/standing if gif not found
          const img = e.currentTarget;
          const fallback = isdog ? "standing" : "idle";
          if (!img.src.includes(fallback)) {
            img.src = gifPath(state.type, state.breed, fallback);
          }
        }}
      />

      {/* Breed name - tiny, barely visible */}
      <p style={{
        fontFamily: "var(--font-lato)",
        fontSize: "9px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(176,160,144,0.35)",
        margin: 0,
      }}>
        {isdog
          ? DOG_PERSONALITY[state.breed].name
          : CAT_PERSONALITY[state.breed].name}
      </p>
    </div>
  );
}

// ─── Helper hook for pages to trigger mascot reactions ───────────────────────

export function useMascotReact() {
  return useCallback((emotion: Emotion, bubble?: string) => {
    if (typeof window !== "undefined" && window.mascotSignal) {
      window.mascotSignal({ emotion, bubble });
    }
  }, []);
}
