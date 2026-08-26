"use client";

import { useState, useEffect, useCallback } from "react";

// ── Generic fetch hook ──
// Shows loading only on first fetch. Subsequent refetches update data silently.
function useFetch<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasData = data !== null;

  const refetch = useCallback(async () => {
    if (!url) { setLoading(false); return; }
    try {
      // Only show loading skeleton on first fetch — keep existing data visible on refetch
      if (!hasData) setLoading(true);
      setError(null);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, setData };
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
  return useFetch<{ chats: ChatData[]; totalUnread: number }>(userId ? `/api/chat?userId=${userId}` : null, [userId]);
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
  dealInfo?: {
    productName?: string;
    initialPrice?: number;
    finalPrice?: number;
    status: string;
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
