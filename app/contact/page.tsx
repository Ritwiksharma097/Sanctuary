"use client";
import { useState, useRef } from "react";
import StarField from "@/components/StarField";
import Link from "next/link";
import { postContact } from "@/lib/api";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "";

export default function ContactPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const captchaRef = useRef<HCaptcha>(null);

  async function handleSubmit() {
    if (!name || !email || !message || !captcha) return;
    setLoading(true);
    setError("");
    try {
      await postContact(name, email, message, captcha);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
      captchaRef.current?.resetCaptcha();
      setCaptcha(null);
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "8px",
    color: "var(--cream)",
    fontFamily: "var(--font-serif)",
    fontSize: "17px",
    padding: "12px 16px",
    outline: "none",
  };

  return (
    <main className="relative min-h-screen">
      <StarField />
      <div className="relative z-10 max-w-lg mx-auto px-6 py-16">
        <Link href="/" className="text-xs tracking-widest uppercase hover:text-amber-300 transition-colors mb-12 inline-block"
          style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
          ← back to the well
        </Link>

        {!sent ? (
          <>
            <h1 className="text-5xl font-light mb-3" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
              Say Hello
            </h1>
            <p className="text-base italic mb-10" style={{ fontFamily: "var(--font-serif)", color: "var(--stone-light)", lineHeight: 1.7 }}>
              Did your wish come true? We'd love to know.<br />
              Or just tell us anything — we read every message.
            </p>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <textarea
                placeholder="Your message…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                style={{ ...inputStyle, resize: "none" }}
              />

              <div className="mt-1">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  onVerify={token => setCaptcha(token)}
                  onExpire={() => setCaptcha(null)}
                  theme="dark"
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#e88", fontFamily: "var(--font-lato)" }}>{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!name || !email || !message || !captcha || loading}
                className="px-8 py-3 rounded-full transition-all mt-2"
                style={{
                  background: (name && email && message && captcha) ? "var(--gold)" : "rgba(201,168,76,0.3)",
                  color: (name && email && message && captcha) ? "var(--night)" : "var(--stone)",
                  fontFamily: "var(--font-serif)",
                  fontSize: "17px",
                  border: "none",
                  cursor: (name && email && message && captcha) ? "pointer" : "default",
                  letterSpacing: "0.06em",
                }}
              >
                {loading ? "Sending…" : "Send Message ✦"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center mt-20 animate-fade-in-up">
            <span style={{ fontSize: "40px" }}>✉</span>
            <h2 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
              Message sent.
            </h2>
            <p className="text-base italic" style={{ fontFamily: "var(--font-serif)", color: "var(--stone-light)", lineHeight: 1.7 }}>
              Thank you for writing to us. We'll read it and write back personally.
            </p>
            <Link href="/" className="mt-4 text-xs tracking-widest uppercase hover:text-amber-300 transition-colors"
              style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
              back to the well
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
