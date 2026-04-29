"use client";
import { useEffect, useRef, useState } from "react";
import StarField from "@/components/StarField";

type Mood = "idle" | "listening" | "happy" | "sad" | "thinking";

const MOOD_COLORS: Record<Mood, string> = {
  idle:      "rgba(201,168,76,0.15)",
  listening: "rgba(100,160,220,0.15)",
  happy:     "rgba(100,200,120,0.18)",
  sad:       "rgba(120,100,180,0.18)",
  thinking:  "rgba(201,168,76,0.1)",
};

const MOOD_MESSAGES: Record<Mood, string[]> = {
  idle:      ["Just here with you.", "Take your time.", "Whenever you're ready."],
  listening: ["I'm listening.", "Go on.", "I hear you."],
  happy:     ["That warms my heart.", "Yes, yes!", "I feel it too."],
  sad:       ["I'm right here.", "You don't have to carry it alone.", "I'm not going anywhere."],
  thinking:  ["Mm.", "...", "I'm with you."],
};

function getMoodFromText(text: string): Mood {
  const lower = text.toLowerCase();
  const happyWords = ["happy", "joy", "excited", "love", "great", "wonderful", "amazing", "good", "smile", "laugh", "hope", "wish", "dream", "better", "healed", "grateful", "thankful"];
  const sadWords   = ["sad", "cry", "miss", "lost", "hurt", "pain", "grief", "alone", "lonely", "scared", "afraid", "tired", "broken", "died", "death", "depression", "anxiety", "hate", "angry", "fail"];

  let happyScore = happyWords.filter(w => lower.includes(w)).length;
  let sadScore   = sadWords.filter(w => lower.includes(w)).length;

  if (happyScore > sadScore && happyScore > 0) return "happy";
  if (sadScore > happyScore && sadScore > 0)   return "sad";
  if (text.length > 20) return "listening";
  return "thinking";
}

export default function CompanionPage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const inputRef     = useRef<HTMLTextAreaElement>(null);
  const [text, setText]         = useState("");
  const [mood, setMood]         = useState<Mood>("idle");
  const [message, setMessage]   = useState("Just here with you.");
  const [sent, setSent]         = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const [error, setError]       = useState(false);
  const sceneRef = useRef<any>(null);

  // Load Three.js and set up scene
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Dynamically import Three.js from CDN via a module-compatible approach
        // We'll use a script tag approach since npm install is blocked
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");

        if (cancelled || !canvasRef.current) return;

        const THREE = (window as any).THREE;
        if (!THREE) { setError(true); return; }

        const canvas = canvasRef.current;
        const W = canvas.clientWidth || 500;
        const H = canvas.clientHeight || 500;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 100);
        camera.position.set(0, 1.2, 3.5);
        camera.lookAt(0, 0.6, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H, false);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;

        // Lights
        const ambient = new THREE.AmbientLight(0xfff8e7, 0.7);
        scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffe4b0, 1.2);
        key.position.set(2, 4, 3);
        key.castShadow = true;
        scene.add(key);

        const fill = new THREE.DirectionalLight(0xc9c0ff, 0.3);
        fill.position.set(-3, 2, -1);
        scene.add(fill);

        // Ground plane (invisible, for shadow)
        const groundGeo = new THREE.PlaneGeometry(10, 10);
        const groundMat = new THREE.ShadowMaterial({ opacity: 0.2 });
        const ground    = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Load GLB via GLTFLoader
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js");

        if (cancelled) return;

        const loader = new (window as any).THREE.GLTFLoader();

        loader.load(
          "/companion/dog.glb",
          (gltf: any) => {
            if (cancelled) return;

            const model = gltf.scene;
            // Centre and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const centre = box.getCenter(new THREE.Vector3());
            const size   = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale  = 1.6 / maxDim;

            model.scale.setScalar(scale);
            model.position.sub(centre.multiplyScalar(scale));
            model.position.y = 0;

            model.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            scene.add(model);

            // Animation mixer
            let mixer: any = null;
            if (gltf.animations && gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(model);
              const action = mixer.clipAction(gltf.animations[0]);
              action.play();
            }

            sceneRef.current = { scene, camera, renderer, mixer, model };
            setLoaded(true);

            // Render loop
            const clock = new THREE.Clock();
            let animId: number;
            let t = 0;

            function animate() {
              animId = requestAnimationFrame(animate);
              const delta = clock.getDelta();
              t += delta;

              if (mixer) mixer.update(delta);

              // Gentle idle sway
              if (model) {
                model.rotation.y = Math.sin(t * 0.4) * 0.08;
              }

              renderer.render(scene, camera);
            }

            animate();

            // Store cleanup
            sceneRef.current.animId = animId!;
            sceneRef.current.cleanup = () => {
              cancelAnimationFrame(animId);
              renderer.dispose();
            };
          },
          undefined,
          (err: any) => {
            console.error("GLB load error", err);
            setError(true);
          }
        );

        // Resize handler
        function onResize() {
          if (!canvasRef.current) return;
          const W2 = canvasRef.current.clientWidth;
          const H2 = canvasRef.current.clientHeight;
          camera.aspect = W2 / H2;
          camera.updateProjectionMatrix();
          renderer.setSize(W2, H2, false);
        }
        window.addEventListener("resize", onResize);
        sceneRef.current = { ...(sceneRef.current || {}), onResize };

      } catch (e) {
        console.error(e);
        setError(true);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (sceneRef.current?.cleanup) sceneRef.current.cleanup();
      if (sceneRef.current?.onResize) window.removeEventListener("resize", sceneRef.current.onResize);
    };
  }, []);

  function handleSend() {
    if (!text.trim()) return;
    const newMood = getMoodFromText(text);
    setMood(newMood);
    const msgs = MOOD_MESSAGES[newMood];
    setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center" style={{ background: "var(--night)" }}>
      <StarField />

      {/* Header */}
      <div className="relative z-10 text-center pt-12 pb-4 px-6">
        <p className="text-xs tracking-[0.35em] uppercase mb-2" style={{ color: "var(--stone-light)", fontFamily: "var(--font-lato)" }}>
          you don't have to be alone
        </p>
        <h1 className="text-5xl font-light mb-3" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
          The Companion
        </h1>
        <p className="text-base italic max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "var(--font-serif)", color: "var(--stone-light)" }}>
          Say anything. They won't reply in words.<br />
          But they will hear you.
        </p>
      </div>

      {/* 3D Canvas + mood glow */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        <div
          className="relative w-full"
          style={{
            height: "340px",
            transition: "background 1.2s ease",
            background: MOOD_COLORS[mood],
            borderRadius: "50% 50% 0 0",
          }}
        >
          {/* Loading state */}
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div style={{ textAlign: "center", color: "var(--stone-light)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px", animation: "pulseGlow 2s ease-in-out infinite" }}>🐕</div>
                <p style={{ fontSize: "14px" }}>Coming to you…</p>
              </div>
            </div>
          )}

          {/* Error fallback — 2D dog emoji companion */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div style={{ fontSize: "80px", animation: "sealAppear 0.6s ease forwards" }}>🐕</div>
              <p style={{ color: "var(--stone-light)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "14px" }}>
                Still here with you.
              </p>
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              opacity: loaded ? 1 : 0,
              transition: "opacity 1s ease",
            }}
          />
        </div>

        {/* Mood message bubble */}
        <div
          style={{
            minHeight: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
          }}
        >
          <p
            key={message}
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "18px",
              color: "var(--stone-light)",
              textAlign: "center",
              animation: "fadeInUp 0.6s ease forwards",
            }}
          >
            {message}
          </p>
        </div>

        {/* Divider */}
        <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "8px 0 20px" }} />

        {/* Text input */}
        <div className="w-full px-6">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to them. Anything at all."
            rows={3}
            maxLength={500}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "12px",
              color: "var(--cream)",
              fontFamily: "var(--font-serif)",
              fontSize: "17px",
              lineHeight: "1.6",
              padding: "16px 18px",
              resize: "none",
              outline: "none",
              caretColor: "var(--gold)",
            }}
            onFocus={e => {
              e.target.style.borderColor = "rgba(201,168,76,0.45)";
              setMood("listening");
              setMessage(MOOD_MESSAGES.listening[0]);
            }}
            onBlur={e => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
          />

          <div className="flex justify-between items-center mt-3 px-1">
            <span style={{ fontSize: "11px", color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
              Press Enter to share
            </span>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              style={{
                background: text.trim() ? "rgba(201,168,76,0.15)" : "transparent",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "20px",
                color: text.trim() ? "var(--gold-light)" : "var(--stone)",
                fontFamily: "var(--font-serif)",
                fontSize: "14px",
                padding: "6px 18px",
                cursor: text.trim() ? "pointer" : "default",
                transition: "all 0.3s",
              }}
            >
              {sent ? "♡ received" : "Share →"}
            </button>
          </div>
        </div>

        {/* Quiet note */}
        <p
          className="mt-8 text-center px-8"
          style={{
            fontFamily: "var(--font-lato)",
            fontSize: "11px",
            color: "var(--stone)",
            lineHeight: 1.8,
            letterSpacing: "0.03em",
          }}
        >
          Nothing you write here is stored or seen by anyone.<br />
          This is just between you and them.
        </p>
      </div>

      {/* Footer nav */}
      <nav className="relative z-10 mt-12 mb-10 flex gap-6 flex-wrap justify-center text-xs tracking-widest uppercase" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
        {[
          { href: "/",          label: "Wishing Well" },
          { href: "/evil-eye",  label: "Evil Eye" },
          { href: "/the-flame", label: "The Flame" },
          { href: "/let-go",    label: "Let Go" },
          { href: "/the-hug",   label: "The Hug" },
          { href: "/the-cliff", label: "The Cliff" },
          { href: "/about",     label: "About" },
          { href: "/contact",   label: "Contact" },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{ color: "var(--stone)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}
