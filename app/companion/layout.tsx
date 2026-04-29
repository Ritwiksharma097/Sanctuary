import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Companion — Sanctuary",
  description: "Sit with someone who listens. A companion that feels what you share.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
