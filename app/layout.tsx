import type { Metadata } from "next";
import "./globals.css";
import Mascot from "@/components/Mascot";

export const metadata: Metadata = {
  title: "Sanctuary — A quiet place",
  description: "Write your wish. Cleanse what follows you. Sit with a flame. A quiet place for anyone who needs it.",
  keywords: ["wishing well", "make a wish", "evil eye", "candle meditation", "sanctuary", "hope", "ritual"],
  openGraph: {
    title: "Sanctuary",
    description: "A quiet place to put something heavy down.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sanctuary",
    description: "A quiet place to put something heavy down.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Lato:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}<Mascot /></body>
    </html>
  );
}
