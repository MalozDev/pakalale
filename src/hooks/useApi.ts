"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ── Client-side cache with stale-while-revalidate ──
const clientCache = new Map<string, { data: unknown; timestamp: number }>();
const STALE_TIME = 60_000; // Data is considered fresh for 60 seconds
const CACHE_MAX = 200; // Max cached entries

function getCachedData<T>(key: string): T | null {
  const entry = clientCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > STALE_TIME * 5) {
    // Expired after 5x stale time
    clientCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCachedData(key: string, data: unknown): void {
  // Evict oldest if at max
  if (clientCache.size >= CACHE_MAX) {
    const oldest = clientCache.keys().next().value;
    if (oldest) clientCache.delete(oldest);
  }
  clientCache.set(key, { data, timestamp: Date.now() });
}

function isStale(key: string): boolean {
  const entry = clientCache.get(key);
  if (!entry) return true;
  return Date.now() - entry.timestamp > STALE_TIME;
}

// Deduplicate in-flight requests across all component instances
const inflight = new Map<string, Promise<unknown>>();
const inflightResolvers = new Map<string, { resolve: (v: unknown) => void; reject: (e: unknown) => void }[]>();

async function fetchWithDedupe<T>(url: string): Promise<T> {
  // If already in-flight, wait for the same request
  const existing = inflight.get(url);
  if (existing) return existing as Promise<T>;

  const promise = fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

  inflight.set(url, promise);

  try {
    const result = await promise;
    return result as T;
  } finally {
    inflight.delete(url);
  }
}

// ── Generic fetch hook with SWR ──
function useFetch<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(() => {
    if (!url) return null;
    return getCachedData<T>(url);
  });
  const [loading, setLoading] = useState(() => {
    if (!url) return false;
    return !getCachedData<T>(url); // Only show loading if no cache
  });
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const urlRef = useRef(url);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Track URL changes
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!url) {
        setLoading(false);
        return;
      }

      // Check cache first
      const cached = getCachedData<T>(url);

      if (cached && !forceRefresh) {
        setData(cached);
        setLoading(false);

        // Only refetch if data is stale
        if (!isStale(url)) return;
      } else if (!cached) {
        setLoading(true);
      }

      try {
        setError(null);
        const json = await fetchWithDedupe<T>(url);

        if (!mountedRef.current || urlRef.current !== url) return;
        setData(json);
        setCachedData(url, json);
      } catch (e) {
        if (!mountedRef.current || urlRef.current !== url) return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, ...deps]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  // Optimistic update — update cache + state instantly
  const setDataOptimistic = useCallback(
    (updater: T | ((prev: T | null) => T)) => {
      setData((prev) => {
        const next = typeof updater === "function" ? (updater as (prev: T | null) => T)(prev) : updater;
        if (url) setCachedData(url, next);
        return next;
      });
    },
    [url]
  );

  return { data, loading, error, refetch, setData: setDataOptimistic };
}

// ── Products ──
export function useProducts(params?: { shopId?: string; search?: string; category?: string; available?: boolean }) {
  const searchParams = new URLSearchParams();
  if (params?.shopId) searchParams.set("shopId", params.shopId);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.category && params.category !== "all") searchParams.set("category", params.category);
  if (params?.available) searchParams.set("available", "true");

  const qs = searchParams.toString();
  const url = `/api/products${qs ? `?${qs}` : ""}`;

  return useFetch<{ products: ProductData[]; total: number; totalPages: number }>(url, [params?.shopId, params?.search, params?.category, params?.available]);
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  stock: number;
  isAvailable: boolean;
  shopId: string | { id: string; name: string; locationId?: string; rating?: number };
  views: number;
  rating: number;
  reviews: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const res = await fetch("/api/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
  return res.json();
}

export async function createProduct(data: Record<string, unknown>) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── Shops ──
export function useShops(params?: { locationId?: string; ownerId?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.locationId) searchParams.set("locationId", params.locationId);
  if (params?.ownerId) searchParams.set("ownerId", params.ownerId);
  if (params?.search) searchParams.set("search", params.search);

  const qs = searchParams.toString();
  const url = `/api/shops${qs ? `?${qs}` : ""}`;

  return useFetch<{ shops: ShopData[] }>(url, [params?.locationId, params?.ownerId, params?.search]);
}

export function useShop(id: string | null) {
  return useFetch<{ shop: ShopData }>(id ? `/api/shops?id=${id}` : null, [id]);
}

export interface ShopData {
  id: string;
  name: string;
  description: string;
  ownerId: string | { id: string; firstName: string; lastName: string; email: string; avatar?: string };
  locationId?: string;
  status: "pending" | "verified" | "rejected";
  contact: { phone: string; email: string; whatsapp?: string };
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  coverImage?: string;
  profileImage?: string;
  images: string[];
  specialties: string[];
  rating?: number;
  totalReviews: number;
  productCount?: number;
  totalViews?: number;
  orderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export async function updateShop(id: string, data: Record<string, unknown>) {
  const res = await fetch("/api/shops", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  return res.json();
}

// ── Orders ──
export function useOrders(params?: { shopId?: string; customerId?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.shopId) searchParams.set("shopId", params.shopId);
  if (params?.customerId) searchParams.set("customerId", params.customerId);
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);

  const qs = searchParams.toString();
  const url = `/api/orders${qs ? `?${qs}` : ""}`;

  return useFetch<{ orders: OrderData[] }>(url, [params?.shopId, params?.customerId, params?.status]);
}

export interface OrderData {
  id: string;
  customerId: string | { id: string; firstName: string; lastName: string };
  shopId: string | { id: string; name: string };
  items: Array<{
    productId: string | { id: string; name: string; images: string[] };
    quantity: number;
    price: number;
  }>;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  total: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function updateOrder(id: string, data: Record<string, unknown>) {
  const res = await fetch("/api/orders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  return res.json();
}

// ── Feed ──
export function useFeed(params?: { filter?: string; locationId?: string; authorId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.filter && params.filter !== "all") searchParams.set("filter", params.filter);
  if (params?.locationId) searchParams.set("locationId", params.locationId);
  if (params?.authorId) searchParams.set("authorId", params.authorId);

  const qs = searchParams.toString();
  const url = `/api/feed${qs ? `?${qs}` : ""}`;

  return useFetch<{ posts: FeedPostData[]; total: number }>(url, [params?.filter, params?.locationId, params?.authorId]);
}

export interface FeedPostData {
  id: string;
  content: string;
  images?: string[];
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    role: "customer" | "shop_owner";
    shopId?: string | null;
    shopLocationId?: string | null;
    isShopVerified?: boolean;
  };
  locationId?: string;
  likes: number;
  likedBy?: string[];
  comments: Array<{
    authorId?: string;
    authorName?: string;
    content: string;
    createdAt: string;
  }>;
  commentsCount: number;
  shares: number;
  isPromotion: boolean;
  product?: {
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    shopId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function createFeedPost(data: Record<string, unknown>) {
  const res = await fetch("/api/feed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function likeFeedPost(postId: string, userId: string) {
  const res = await fetch("/api/feed", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: postId, action: "like", userId }),
  });
  return res.json();
}

export async function commentFeedPost(postId: string, userId: string, authorName: string, content: string) {
  const res = await fetch("/api/feed", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: postId, action: "comment", userId, comment: { authorName, content } }),
  });
  return res.json();
}

// ── Chat ──
export function useChats(userId: string | null) {
  return useFetch<{ chats: ChatData[]; totalUnread: number; totalDeals: number }>(userId ? `/api/chat?userId=${userId}` : null, [userId]);
}

export function useChatMessages(chatId: string | null) {
  return useFetch<{ messages: MessageData[] }>(chatId ? `/api/chat?chatId=${chatId}` : null, [chatId]);
}

export interface ChatData {
  id: string;
  type: "deal" | "general";
  participants: Array<{ id: string; name: string; avatar?: string; role: string }>;
  otherParticipant?: { id: string; name: string; avatar?: string; role: string } | null;
  lastMessage?: { id: string; content: string; senderId: string; timestamp: string } | null;
  lastMessageTime: string;
  unreadCount?: number;
  dealInfo?: {
    productName?: string;
    initialPrice?: number;
    finalPrice?: number;
    status: "pending" | "negotiating" | "confirmed" | "completed" | "cancelled";
  };
  isActive: boolean;
  createdAt: string;
}

export interface MessageData {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "shop_owner";
  content: string;
  type: "text" | "image" | "file" | "voice" | "deal_update" | "system";
  isRead: boolean;
  readBy: string[];
  replyTo?: { messageId: string; content: string; senderName: string };
  timestamp: string;
}

export async function sendMessage(data: {
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "shop_owner";
  content: string;
  type?: string;
  replyTo?: { messageId: string; content: string; senderName: string };
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createChat(data: {
  type?: string;
  participants: string[];
  dealInfo?: Record<string, unknown>;
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateDealStatus(chatId: string, dealStatus: string, senderId: string) {
  const res = await fetch("/api/chat", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updateDealStatus", chatId, dealStatus, senderId }),
  });
  return res.json();
}

// ── Locations ──
export function useLocations(params?: { search?: string; specialty?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.specialty && params.specialty !== "all") searchParams.set("specialty", params.specialty);

  const qs = searchParams.toString();
  const url = `/api/locations${qs ? `?${qs}` : ""}`;

  return useFetch<{ locations: LocationData[] }>(url, [params?.search, params?.specialty]);
}

export function useLocation(slugOrId: string | null) {
  const param = slugOrId?.includes("-") ? "slug" : "id";
  return useFetch<{ location: LocationData }>(slugOrId ? `/api/locations?${param}=${slugOrId}` : null, [slugOrId]);
}

export interface LocationData {
  id: string;
  name: string;
  slug?: string;
  description: string;
  image: string;
  shopCount: number;
  userCount: number;
  rating: number;
  specialties: string[];
  hours: string;
  contact: string;
  coordinates?: { lat: number; lng: number };
}

// ── Search ──
export function useSearch(query: string) {
  const url = query.trim().length > 0 ? `/api/search?q=${encodeURIComponent(query)}` : null;
  return useFetch<{ products: Array<{ id: string; name: string; price: number; shopName: string; shopId: string }>; shops: Array<{ id: string; name: string; specialties: string[] }>; locations: Array<{ id: string; name: string; slug: string }> }>(url, [query]);
}

// ── Notifications ──
export function useNotifications(userId: string | null) {
  return useFetch<{ notifications: NotificationData[]; unreadCount: number }>(
    userId ? `/api/notifications?userId=${userId}` : null,
    [userId]
  );
}

export interface NotificationData {
  id: string;
  userId: string;
  type: "deal" | "message" | "review" | "shop" | "order" | "system";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export async function markNotificationsRead(userId: string) {
  const res = await fetch("/api/notifications", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, action: "markAllRead" }),
  });
  return res.json();
}

// ── Analytics ──
export function useAnalytics(shopId: string | null) {
  return useFetch<AnalyticsData>(shopId ? `/api/analytics?shopId=${shopId}` : null, [shopId]);
}

export interface AnalyticsData {
  stats: {
    totalProducts: number;
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    conversionRate: number;
    totalStock: number;
  };
  ordersByStatus: Record<string, number>;
  recentOrders: Array<{
    id: string;
    customer: string;
    products: string;
    total: number;
    status: string;
    paymentMethod?: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    price: number;
    views: number;
    stock: number;
    rating: number;
    reviews: number;
  }>;
}

// ── Auth helpers ──
export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  location?: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
