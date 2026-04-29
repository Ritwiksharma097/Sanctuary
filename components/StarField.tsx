"use client";
import { useEffect, useRef } from "react";

export default function StarField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;
    container.innerHTML = "";

    for (let i = 0; i < 140; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2 + 0.5;
      const minO = (Math.random() * 0.2 + 0.05).toFixed(2);
      const maxO = Math.min(1, parseFloat(minO) + Math.random() * 0.5 + 0.2).toFixed(2);
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 65}%;
        width: ${size}px;
        height: ${size}px;
        --d: ${(Math.random() * 3 + 2).toFixed(1)}s;
        --min: ${minO};
        --max: ${maxO};
        animation-delay: ${(Math.random() * 5).toFixed(1)}s;
      `;
      container.appendChild(star);
    }
  }, []);

  return <div ref={ref} className="fixed inset-0 pointer-events-none z-0" aria-hidden />;
}

export function shimmerStars() {
  const stars = document.querySelectorAll<HTMLElement>(".star");
  stars.forEach((s) => {
    s.style.animation = "none";
    s.style.opacity = "1";
    setTimeout(() => {
      s.style.animation = "";
      s.style.opacity = "";
    }, 600);
  });
}
