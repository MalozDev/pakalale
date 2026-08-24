"use client";

import ShopNav from "@/components/ShopNav";
import { useAuthStore } from "@/store/authStore";
import { Eye, ShoppingBag, TrendingUp, Star, User, Store, Loader2, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/useApi";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  preparing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function OverviewPage() {
  const { user } = useAuthStore();
  const { data: analytics, loading } = useAnalytics(user?.id || null);

  const stats = analytics?.stats;
  const recentOrders = analytics?.recentOrders || [];

  const statCards = stats
    ? [
        { icon: Eye, value: stats.totalViews.toLocaleString(), label: "Total Views", color: "text-blue-400", bg: "bg-blue-400/10" },
        { icon: ShoppingBag, value: stats.totalOrders.toString(), label: "Orders", color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { icon: DollarSign, value: `K${stats.totalRevenue.toLocaleString()}`, label: "Revenue", color: "text-yellow-400", bg: "bg-yellow-400/10" },
        { icon: Star, value: stats.totalProducts.toString(), label: "Products", color: "text-purple-400", bg: "bg-purple-400/10" },
      ]
    : [];

  const formatTime = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (diff < 1) return "Just now";
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <ShopNav userId={user?.id} />
      <main className="p-3 sm:p-4 space-y-4 max-w-5xl mx-auto">
        {/* Welcome */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-amber-golden/10 border-primary/20">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-lg font-bold">Welcome back, {user?.firstName}!</h2>
              <Store className="h-5 w-5 text-primary shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Manage your shop and grow your business</p>
          </CardContent>
        </Card>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {statCards.map((stat) => (
                <Card key={stat.label} className="bg-card border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg sm:text-xl font-bold truncate">{stat.value}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="p-3 sm:p-4 border-b border-border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    Recent Orders
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {recentOrders.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">No orders yet</div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium truncate">{order.customer}</h4>
                            <p className="text-xs text-muted-foreground truncate">{order.products}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatTime(order.createdAt)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium">K{order.total.toLocaleString()}</p>
                            <Badge variant="secondary" className={`text-[10px] mt-1 capitalize ${statusColors[order.status] || ""}`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
