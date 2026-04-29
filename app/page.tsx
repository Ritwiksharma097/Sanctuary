import { getStats } from "@/lib/api";
import StarField from "@/components/StarField";
import WishingWell from "@/components/WishingWell";

export const revalidate = 60;

export default async function Home() {
  const stats = await getStats();

  return (
    <main>
      <StarField />
      {/* Moon */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "40px",
          right: "80px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #fff9e6, #f0d080)",
          boxShadow: "0 0 40px 12px rgba(240,208,100,0.18), 0 0 80px 30px rgba(240,208,100,0.07)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <WishingWell initialWishCount={stats.wish_count} />
    </main>
  );
}
