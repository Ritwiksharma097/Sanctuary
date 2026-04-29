const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getStats() {
  try {
    const res = await fetch(`${API}/stats`, { next: { revalidate: 60 } });
    if (!res.ok) return { wish_count: 48291, coin_count: 0 };
    return res.json();
  } catch {
    return { wish_count: 48291, coin_count: 0 };
  }
}

export async function postWish(content: string, anonId: string | null, token?: string | null) {
  const res = await fetch(`${API}/wishes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ content, anon_id: anonId }),
  });
  if (!res.ok) throw new Error("Failed to save wish");
  return res.json();
}

export async function createCoinCheckout(amount_cents: number, anonId: string | null, token?: string | null) {
  const res = await fetch(`${API}/coins/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ amount_cents, anon_id: anonId }),
  });
  if (!res.ok) throw new Error("Failed to create checkout");
  return res.json();
}

export async function postLetter(wish_content: string, email: string, months: number, anonId: string | null, token?: string | null) {
  const res = await fetch(`${API}/letters`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ wish_content, email, months, anon_id: anonId }),
  });
  if (!res.ok) throw new Error("Failed to save letter");
  return res.json();
}

export async function postContact(name: string, email: string, message: string, captcha: string) {
  const res = await fetch(`${API}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message, captcha }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${API}/auth/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getMyWishes(token: string) {
  const res = await fetch(`${API}/profile/wishes`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getMyLetters(token: string) {
  const res = await fetch(`${API}/profile/letters`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  return res.json();
}

export const GOOGLE_AUTH_URL = `${API}/auth/google`;
