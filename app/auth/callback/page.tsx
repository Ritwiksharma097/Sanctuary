"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";
import { Suspense } from "react";

function CallbackInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
    }
    router.replace("/");
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ fontFamily: "var(--font-serif)", color: "var(--stone-light)", fontSize: "18px", fontStyle: "italic" }}>
        Signing you in…
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
