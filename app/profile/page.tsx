"use client";
import { useEffect, useState } from "react";
import { getToken, signOut } from "@/lib/auth";
import { getMe, getMyWishes, getMyLetters } from "@/lib/api";
import StarField from "@/components/StarField";
import Link from "next/link";

type Wish   = { id: string; content: string; created_at: string };
type Letter = { id: string; deliver_at: string; delivered: boolean; created_at: string };
type User   = { name: string; email: string; avatar_url?: string; created_at: string };

export default function ProfilePage() {
  const [user,    setUser]    = useState<User | null>(null);
  const [wishes,  setWishes]  = useState<Wish[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/";
      return;
    }
    Promise.all([getMe(token), getMyWishes(token), getMyLetters(token)])
      .then(([u, w, l]) => {
        if (!u) { window.location.href = "/"; return; }
        setUser(u);
        setWishes(w);
        setLetters(l);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ fontFamily: "var(--font-serif)", color: "var(--stone-light)", fontSize: "18px", fontStyle: "italic" }}>
        The well remembers…
      </p>
    </div>
  );

  return (
    <main className="relative min-h-screen">
      <StarField />

      <div className="relative z-10 max-w-xl mx-auto px-6 py-16">
        {/* Back */}
        <Link href="/" className="text-xs tracking-widest uppercase hover:text-amber-300 transition-colors mb-12 inline-block"
          style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
          ← back to the well
        </Link>

        {/* User header */}
        <div className="flex items-center gap-4 mb-12">
          {user?.avatar_url && (
            <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full opacity-90" />
          )}
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "var(--cream)" }}>
              {user?.name}
            </p>
            <p className="text-xs tracking-widest uppercase mt-1" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
              {wishes.length} wishes · {letters.length} sealed letters
            </p>
          </div>
        </div>

        {/* Wishes */}
        <Section title="Your Wishes">
          {wishes.length === 0 ? (
            <Empty>No wishes yet. The well is waiting.</Empty>
          ) : (
            wishes.map(w => (
              <WishCard key={w.id} content={w.content} date={w.created_at} />
            ))
          )}
        </Section>

        {/* Letters */}
        <Section title="Sealed Letters">
          {letters.length === 0 ? (
            <Empty>No letters sealed yet.</Empty>
          ) : (
            letters.map(l => (
              <LetterCard key={l.id} deliverAt={l.deliver_at} delivered={l.delivered} />
            ))
          )}
        </Section>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="mt-10 text-xs tracking-widest uppercase transition-colors"
          style={{
            color: "var(--stone)",
            fontFamily: "var(--font-lato)",
            background: "none",
            border: "none",
            borderBottom: "1px solid rgba(176,160,144,0.25)",
            cursor: "pointer",
            paddingBottom: "2px",
          }}
        >
          sign out
        </button>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <p className="text-xs tracking-widest uppercase mb-5" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function WishCard({ content, date }: { content: string; date: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(201,168,76,0.12)",
      borderRadius: "10px",
      padding: "16px 20px",
    }}>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "17px", color: "var(--cream)", fontStyle: "italic", lineHeight: 1.6 }}>
        "{content}"
      </p>
      <p className="mt-2 text-xs" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
        {new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}

function LetterCard({ deliverAt, delivered }: { deliverAt: string; delivered: boolean }) {
  const date = new Date(deliverAt);
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(201,168,76,0.12)",
      borderRadius: "10px",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}>
      <span style={{ fontSize: "20px" }}>{delivered ? "📬" : "✉"}</span>
      <div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "15px", color: "var(--cream)" }}>
          {delivered ? "Delivered" : `Opens ${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--stone)", fontFamily: "var(--font-lato)" }}>
          {delivered ? "Your wish found its way back." : "Sealed and waiting."}
        </p>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm italic" style={{ color: "var(--stone)", fontFamily: "var(--font-serif)" }}>
      {children}
    </p>
  );
}
