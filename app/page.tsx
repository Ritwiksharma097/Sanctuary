import { getStats } from "@/lib/api";
import StarField from "@/components/StarField";
import WishingWell from "@/components/WishingWell";
import Moon from "@/components/Moon";

export default async function Home() {
  const stats = await getStats();

  return (
    <main>
      <StarField />
      {/* Moon */}
      <Moon />
      <WishingWell initialWishCount={stats.wish_count} />
    </main>
  );
}
