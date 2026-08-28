"use client";

import { useRouter } from "next/navigation";
import ShopNav from "@/components/ShopNav";
import Feed from "@/components/Feed";
import { useAuthStore } from "@/store/authStore";
import { useAnalytics } from "@/hooks/useApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  ShoppingBag,
  DollarSign,
  Package,
  Loader2,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  Store,
} from "lucide-react";

export default function ShopFeedPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: analytics, loading } = useAnalytics(user?.id || null);

  const stats = analytics?.stats;

  return (
    <div className="min-h-screen bg-background">
      <ShopNav />
      <main className="p-3 sm:p-4 space-y-4 max-w-2xl mx-auto">
        {/* Welcome + Quick Stats */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-amber-golden/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold">
                  Hey, {user?.firstName} 👋
                </h2>
                <p className="text-xs text-muted-foreground">
                  Here&apos;s what&apos;s happening with your shop
                </p>
              </div>
              <Store className="h-5 w-5 text-primary shrink-0" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => router.push("/shop/overview")}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-bold">
                    {stats.totalViews.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Views
                  </span>
                </button>
                <button
                  onClick={() => router.push("/shop/deals")}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold">
                    {stats.totalOrders}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Deals
                  </span>
                </button>
                <button
                  onClick={() => router.push("/shop/sales")}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-bold">
                    K{stats.totalRevenue.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Revenue
                  </span>
                </button>
                <button
                  onClick={() => router.push("/shop/products")}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <Package className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-bold">
                    {stats.totalProducts}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Products
                  </span>
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1.5"
            onClick={() => router.push("/shop/products")}
          >
            <Package className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Manage Products</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1.5"
            onClick={() => router.push("/shop/chat")}
          >
            <MessageSquare className="h-5 w-5 text-teal-500" />
            <span className="text-xs font-medium">Messages</span>
          </Button>
        </div>

        {/* Community Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              Community Feed
            </h3>
          </div>
          <Feed />
        </div>
      </main>
    </div>
  );
}


