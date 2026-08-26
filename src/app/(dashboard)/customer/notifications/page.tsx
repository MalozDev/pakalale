"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Store, Heart, MapPin, Package, Info, Loader2, Bell, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useNotifications, markNotificationsRead, type NotificationData } from "@/hooks/useApi";
import { useNotificationStore } from "@/store/notificationStore";

const iconMap: Record<string, React.ElementType> = { deal: MessageSquare, message: MessageSquare, shop: Store, review: Heart, order: Package, system: Info };
const colorMap: Record<string, string> = { deal: "text-primary bg-primary/10", message: "text-teal-500 bg-teal-500/10", shop: "text-amber-400 bg-amber-400/10", review: "text-rose-400 bg-rose-400/10", order: "text-blue-400 bg-blue-400/10", system: "text-muted-foreground bg-muted" };

const formatTime = (timestamp: string) => {
  const diff = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, loading, refetch } = useNotifications(user?.id || null);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const notifications = data?.notifications || [];

  // Sync unread count to global store
  useEffect(() => {
    if (data?.unreadCount !== undefined) {
      setUnreadCount(data.unreadCount);
    }
  }, [data?.unreadCount, setUnreadCount]);

  // Mark all as read on visit
  useEffect(() => {
    if (user?.id && data?.unreadCount && data.unreadCount > 0) {
      markNotificationsRead(user.id).then(() => {
        refetch();
        setUnreadCount(0);
      });
    }
  }, [user?.id, data?.unreadCount, refetch, setUnreadCount]);

  const handleDelete = useCallback(async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationId }),
      });
      // Find the deleted notification to check if it was unread
      const deleted = notifications.find((n) => n.id === notificationId);
      if (deleted && !deleted.isRead) {
        setUnreadCount(Math.max(0, (data?.unreadCount || 1) - 1));
      }
      refetch();
    } catch (e) {
      console.error("Failed to delete notification:", e);
    }
  }, [notifications, data?.unreadCount, refetch, setUnreadCount]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="w-16" />
          <h1 className="text-sm font-bold">Notifications</h1>
          <Button variant="ghost" size="sm" onClick={() => refetch()}><Bell className="h-4 w-4" /></Button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-teal-500/10 to-primary/10 border-teal-500/20">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-1">Deal Updates</h4>
              <p className="text-xs text-muted-foreground mb-2">{notifications.filter(n => n.type === "deal").length} deals</p>
              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => router.push("/customer/deals")}>View Deals</Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-500/10 to-amber-500/10 border-rose-500/20">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-1">Shop Updates</h4>
              <p className="text-xs text-muted-foreground mb-2">{notifications.filter(n => n.type === "shop").length} shop alerts</p>
              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => router.push("/customer/locations")}>Browse Shops</Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Recent Activity</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-32" /><Skeleton className="h-2 w-full" /></div>
                    <Skeleton className="h-2 w-10 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const Icon = iconMap[n.type] || MapPin;
                return (
                  <Card key={n.id} className={`bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors ${!n.isRead ? "border-primary/20" : ""}`} onClick={() => { if (n.actionUrl) router.push(n.actionUrl); }}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${colorMap[n.type] || "text-muted-foreground bg-muted"}`}><Icon className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-medium truncate">{n.title}</h4>
                            <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(n.createdAt)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {notifications.length === 0 && <div className="text-center py-8 text-muted-foreground"><Bell className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No notifications yet</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
