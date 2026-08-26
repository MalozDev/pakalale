"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, MapPin, Store, Star, Loader2, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Feed from "@/components/Feed";
import { useAuthStore } from "@/store/authStore";
import { useShops, useLocations } from "@/hooks/useApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function CustomerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("home");
  const [showWelcome, setShowWelcome] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const { data: shopsData, loading: shopsLoading } = useShops();
  const { data: locationsData } = useLocations();

  const trendingShops = shopsData?.shops || [];
  const allLocations = locationsData?.locations || [];

  // Show welcome only once per login session
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem("pakalale_welcome_seen");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      sessionStorage.setItem("pakalale_welcome_seen", "1");
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Infinite horizontal auto-scroll for trending shops
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || trendingShops.length === 0) return;

    let scrollPos = 0;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused && container) {
        scrollPos += speed;
        // Reset when we've scrolled through half (since we duplicate items)
        if (scrollPos >= container.scrollWidth / 2) {
          scrollPos = 0;
        }
        container.scrollLeft = scrollPos;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPaused, trendingShops.length]);

  // Duplicate shops for seamless loop
  const loopShops = [...trendingShops, ...trendingShops];

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} userId={user?.id} />
      <main className="p-3 sm:p-4 space-y-4 max-w-2xl mx-auto">

        {/* ── Welcome Section (animated in, fades out) ── */}
        {showWelcome && (
          <div className="text-center py-4 animate-fade-in">
            <h2 className="text-lg font-bold animate-slide-up">
              Hey, {user?.firstName} 👋
            </h2>
            <p className="text-xs text-muted-foreground mt-1 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              Discover deals from shops near you
            </p>
          </div>
        )}

        {/* ── Trending Shops (infinite auto-scroll) ── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trending Shops
            </h3>
            <button
              onClick={() => router.push("/customer/locations")}
              className="text-[11px] text-primary flex items-center gap-0.5 hover:underline"
            >
              See all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {shopsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-hidden pb-2"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {loopShops.map((shop, idx) => (
                <Card
                  key={`${shop.id}-${idx}`}
                  className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer shrink-0 min-w-[160px] max-w-[180px]"
                  onClick={() => router.push(`/customer/locations/${shop.locationId || "soweto"}?shopId=${shop.id}`)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-9 w-9 bg-gradient-to-br from-teal-500 to-primary rounded-lg flex items-center justify-center shrink-0">
                        <Store className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-medium text-xs truncate">{shop.name}</h4>
                          {shop.status === "verified" && <VerifiedBadge size="sm" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{shop.locationId || "Lusaka"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-medium">{shop.rating || "—"}</span>
                      </div>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1">
                        {shop.specialties?.[0] || ""}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Locations (with real shop counts) ── */}
        {allLocations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                Markets
              </h3>
              <button
                onClick={() => router.push("/customer/locations")}
                className="text-[11px] text-primary flex items-center gap-0.5 hover:underline"
              >
                See all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {allLocations.map((loc) => {
                const shopCount = trendingShops.filter((s) => s.locationId === loc.slug || s.locationId === loc.id).length;
                return (
                  <button
                    key={loc.id}
                    onClick={() => router.push(`/customer/locations/${loc.slug || loc.id}`)}
                    className="shrink-0 px-3 py-2 bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="h-3 w-3" />
                    {loc.name}
                    <span className="text-[9px] opacity-60">({shopCount})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Community Feed ── */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            Community Feed
          </h3>
          <Feed />
        </div>
      </main>
    </div>
  );
}
