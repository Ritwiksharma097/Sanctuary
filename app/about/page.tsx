import StarField from "@/components/StarField";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Wishing Well",
  description: "What is Wishing Well and why does it exist.",
};

const PAGES = [
  {
    href: "/",
    label: "The Well",
    desc: "Write your wish. Send it into the water. No one will read it.",
  },
  {
    href: "/evil-eye",
    label: "Evil Eye",
    desc: "If you feel a heaviness that is not yours, name it here and let it go.",
  },
  {
    href: "/the-flame",
    label: "The Flame",
    desc: "Light a candle. Hold your wish. Look at the flame and do not look away.",
  },
  {
    href: "/mantras",
    label: "Sacred Phrases",
    desc: "Words from eight traditions, all pointing at the same human thing.",
  },
];

export default function AboutPage() {
  const prose: React.CSSProperties = {
    fontFamily: "var(--font-serif)",
    fontSize: "19px",
    color: "var(--stone-light)",
    lineHeight: 1.85,
    fontStyle: "italic",
  };

  return (
    <main className="relative min-h-screen">
      <StarField />
      <div className="relative z-10 max-w-lg mx-auto px-6 py-16">
        <Link href="/" className="text-xs tracking-widest uppercase hover:text-amber-300 transition-colors mb-12 inline-block"
          style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
          the well
        </Link>

        <h1 className="text-5xl font-light mb-10" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
          About
        </h1>

        <div className="flex flex-col gap-6">
          <p style={prose}>
            This website doesn't believe in anything. But it believes in you, and in the very human need to have somewhere quiet to put your hopes.
          </p>
          <p style={prose}>
            Every ritual here is ancient. The wishing well is Roman. The evil eye crosses dozens of cultures. The candle gazing is as old as fire. The sacred phrases come from eight traditions across six continents. We did not invent any of it. We only removed the gatekeeping.
          </p>
          <p style={prose}>
            No religion required. No culture required. Just a person who needs a moment, and a place that was already here.
          </p>
          <p style={prose}>
            Nothing you do here is stored or read. The well receives your wish and holds it. The rituals are yours alone. The only thing that leaves is what you choose to send.
          </p>

          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "8px 0" }} />

          {/* Pages */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {PAGES.map(page => (
              <Link
                key={page.href}
                href={page.href}
                style={{ textDecoration: "none" }}
              >
                <div style={{ borderLeft: "1px solid rgba(201,168,76,0.25)", paddingLeft: "16px", transition: "border-color 0.2s" }}>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--cream)", marginBottom: "4px" }}>
                    {page.label}
                  </p>
                  <p style={{ fontFamily: "var(--font-lato)", fontSize: "12px", color: "var(--stone)", lineHeight: 1.6, letterSpacing: "0.05em" }}>
                    {page.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "8px 0" }} />

          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
            Made with care · wishing-well.site
          </p>

          <Link href="/contact" className="text-sm hover:text-amber-300 transition-colors"
            style={{ color: "var(--stone-light)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            Write to us →
          </Link>
        </div>
      </div>
    </main>
  );
}
