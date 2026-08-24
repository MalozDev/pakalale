"use client";

import { useState } from "react";
import ShopNav from "@/components/ShopNav";
import { TrendingUp, DollarSign, ShoppingBag, Users, Download, Activity, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useAnalytics } from "@/hooks/useApi";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  confirmed: "bg-blue-500/10 text-blue-500",
  preparing: "bg-purple-500/10 text-purple-500",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function SalesPage() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: analytics, loading } = useAnalytics(user?.id || null);

  const stats = analytics?.stats;
  const allOrders = analytics?.recentOrders || [];
  const filtered = statusFilter === "all" ? allOrders : allOrders.filter((t) => t.status === statusFilter);

  const formatTime = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (diff < 1) return "Just now";
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };

  const overviewStats = stats
    ? [
        { icon: DollarSign, value: `K ${stats.totalRevenue.toLocaleString()}`, label: "Total Revenue", color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { icon: ShoppingBag, value: stats.totalOrders.toString(), label: "Transactions", color: "text-blue-400", bg: "bg-blue-400/10" },
        { icon: Activity, value: `K ${stats.avgOrderValue}`, label: "Avg Order Value", color: "text-purple-400", bg: "bg-purple-400/10" },
        { icon: Users, value: `${stats.conversionRate}%`, label: "Conversion Rate", color: "text-yellow-400", bg: "bg-yellow-400/10" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <ShopNav userId={user?.id} />
      <main className="p-3 sm:p-4 space-y-4 max-w-5xl mx-auto">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {overviewStats.map((stat) => (
                    <Card key={stat.label} className="bg-card border-border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                            <p className="text-base sm:text-lg font-bold mt-0.5">{stat.value}</p>
                          </div>
                          <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-card border-border">
                  <CardContent className="p-0 divide-y divide-border">
                    <div className="p-3 border-b border-border">
                      <h3 className="text-sm font-semibold">Recent Transactions</h3>
                    </div>
                    {allOrders.slice(0, 5).length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">No transactions yet</div>
                    ) : (
                      allOrders.slice(0, 5).map((t) => (
                        <div key={t.id} className="p-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-sm font-medium truncate">{t.customer}</h4>
                              <p className="text-xs text-muted-foreground truncate">{t.products}</p>
                              <p className="text-[10px] text-muted-foreground">{formatTime(t.createdAt)}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-medium">K{t.total.toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground">{t.paymentMethod}</p>
                              <Badge variant="secondary" className={`text-[9px] capitalize mt-1 ${statusColors[t.status] || ""}`}>{t.status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-3 mt-4">
                <div className="flex gap-2">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-muted border border-border rounded-md text-xs flex-1">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Export</Button>
                </div>

                <Card className="bg-card border-border">
                  <CardContent className="p-0 divide-y divide-border">
                    {filtered.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">No transactions found</div>
                    ) : (
                      filtered.map((t) => (
                        <div key={t.id} className="p-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-sm font-medium truncate">{t.customer}</h4>
                              <p className="text-xs text-muted-foreground truncate">{t.products}</p>
                              <p className="text-[10px] text-muted-foreground">{formatTime(t.createdAt)}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-medium">K{t.total.toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground">{t.paymentMethod}</p>
                              <Badge variant="secondary" className={`text-[9px] capitalize mt-1 ${statusColors[t.status] || ""}`}>{t.status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
