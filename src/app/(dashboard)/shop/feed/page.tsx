"use client";

import ShopNav from "@/components/ShopNav";
import Feed from "@/components/Feed";
import { useAuthStore } from "@/store/authStore";

export default function ShopFeedPage() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-background">
      <ShopNav userId={user?.id} />
      <main className="p-3 sm:p-4 max-w-2xl mx-auto">
        <Feed />
      </main>
    </div>
  );
}
