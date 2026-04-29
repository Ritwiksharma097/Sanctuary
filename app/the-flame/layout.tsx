import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "The Flame — Wishing Well",
  description: "Light a candle. Hold your wish. Look at the flame and do not look away.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
