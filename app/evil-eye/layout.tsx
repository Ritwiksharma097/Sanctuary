import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Evil Eye — Wishing Well",
  description: "A quiet ritual for releasing what has been cast upon you. No belief required.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
