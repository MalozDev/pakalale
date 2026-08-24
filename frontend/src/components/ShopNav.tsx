"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Settings,
  Store,
  Home,
  Package,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: React.ElementType; count?: number };

interface ShopNavProps {
  userId?: string;
}

export default function ShopNav({ userId }: ShopNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    if (!userId) return;
    // Fetch pending order count for this shop owner
    fetch(`/api/analytics?shopId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setPendingOrders(data.ordersByStatus?.pending || 0);
      })
      .catch(() => {});
  }, [userId]);

  const navTabs: NavItem[] = [
    { to: "/shop/overview", label: "Overview", icon: Home },
    { to: "/shop/virtual-shop", label: "My Shop", icon: Store },
    { to: "/shop/products", label: "Products", icon: Package },
    { to: "/shop/orders", label: "Orders", icon: ShoppingBag, count: pendingOrders },
    { to: "/shop/sales", label: "Sales", icon: DollarSign },
    { to: "/shop/feed", label: "Feed", icon: MessageSquare },
  ];

  const secondaryLinks: NavItem[] = [
    { to: "/shop/chat", label: "Chat", icon: MessageSquare },
    { to: "/shop/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/shop/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-primary p-1.5 rounded-lg shrink-0">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold truncate">Pakalale Shop</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {secondaryLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={cn(
                "p-2 rounded-lg transition-colors relative",
                pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.count && link.count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 font-bold">
                  {link.count > 9 ? "9+" : link.count}
                </span>
              )}
            </Link>
          ))}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="sm:hidden" />}>
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <SheetTitle className="px-4 py-4 border-b border-border text-left">
                Navigation
              </SheetTitle>
              <nav className="p-3 space-y-1">
                {[...navTabs, ...secondaryLinks].map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      pathname === link.to
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="flex-1">{link.label}</span>
                    {link.count && link.count > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] text-xs">
                        {link.count}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-none">
        {navTabs.map((tab) => (
          <Link
            key={tab.to}
            href={tab.to}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              pathname === tab.to
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count && tab.count > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-[9px] h-4 min-w-[16px] justify-center px-1 ml-1">
                {tab.count}
              </Badge>
            )}
          </Link>
        ))}
      </div>

      {/* Mobile scrollable tabs */}
      <div className="flex sm:hidden items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-none">
        {navTabs.map((tab) => (
          <Link
            key={tab.to}
            href={tab.to}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0",
              pathname === tab.to
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
}
