import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pluto, the Companion · Sanctuary",
  description: "Sit with Pluto. He listens, and he feels what you share.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
