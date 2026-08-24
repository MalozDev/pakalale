"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Image, MapPin, Tag, TrendingUp, Star, Loader2, X, Search } from "lucide-react";
import FeedPost from "./FeedPost";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFeed, useShops, createFeedPost, createChat, type FeedPostData, type ShopData } from "@/hooks/useApi";

type FilterType = "all" | "promotions" | "nearby";

interface FeedProps {
  authorId?: string;
}

interface PostOverrides {
  likes?: number;
  likedBy?: string[];
  comments?: FeedPostData["comments"];
}

export default function Feed({ authorId }: FeedProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [newPostContent, setNewPostContent] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [posting, setPosting] = useState(false);

  // Create post extras
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postLocation, setPostLocation] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [taggedShops, setTaggedShops] = useState<ShopData[]>([]);
  const [tagSearch, setTagSearch] = useState("");

  const { data: feedData, loading } = useFeed({ filter, authorId });
  const serverPosts = feedData?.posts || [];
  const { data: shopsData } = useShops();
  const allShops = shopsData?.shops || [];

  const [localPosts, setLocalPosts] = useState<FeedPostData[]>([]);
  const [overrides, setOverrides] = useState<Record<string, PostOverrides>>({});

  const serverPostsWithOverrides = serverPosts.map((post) => {
    const ov = overrides[post.id];
    if (!ov) return post;
    return { ...post, likes: ov.likes ?? post.likes, likedBy: ov.likedBy ?? post.likedBy, comments: ov.comments ?? post.comments };
  });

  const feedPosts = [...localPosts, ...serverPostsWithOverrides];

  // ── Like ──
  const handleLike = useCallback(async (postId: string) => {
    if (!user?.id) return;
    setOverrides((prev) => {
      const current = prev[postId] || {};
      const serverPost = serverPosts.find((p) => p.id === postId);
      const baseLikedBy = current.likedBy ?? serverPost?.likedBy ?? [];
      const baseLikes = current.likes ?? serverPost?.likes ?? 0;
      const isLiked = baseLikedBy.includes(user.id);
      return {
        ...prev,
        [postId]: {
          ...current,
          likes: isLiked ? baseLikes - 1 : baseLikes + 1,
          likedBy: isLiked ? baseLikedBy.filter((id) => id !== user.id) : [...baseLikedBy, user.id],
        },
      };
    });
    fetch("/api/feed", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: postId, action: "like", userId: user.id }) }).catch(() => {});
  }, [user?.id, serverPosts]);

  // ── Comment ──
  const handleComment = useCallback((postId: string, authorName: string, content: string) => {
    if (!user?.id) return;
    const newComment = { authorId: user.id, authorName, content, createdAt: new Date().toISOString() };
    setOverrides((prev) => {
      const current = prev[postId] || {};
      const baseComments = current.comments ?? serverPosts.find((p) => p.id === postId)?.comments ?? [];
      return { ...prev, [postId]: { ...current, comments: [newComment, ...baseComments] } };
    });
    fetch("/api/feed", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: postId, action: "comment", userId: user.id, comment: { authorName, content } }) }).catch(() => {});
  }, [user?.id, serverPosts]);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (navigator.share) { navigator.share({ title: "Pakalale Post", url }).catch(() => {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(url); }
  };

  // ── Location picker ──
  const handleLocationPick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPostLocation(`Lusaka (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setShowLocationPicker(false);
        },
        () => {
          setPostLocation("Lusaka, Zambia");
          setShowLocationPicker(false);
        }
      );
    } else {
      setPostLocation("Lusaka, Zambia");
      setShowLocationPicker(false);
    }
  };

  // ── Photo picker ──
  const handlePhotoPick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPostImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ── Tag shops ──
  const filteredShops = allShops.filter((s) =>
    s.name.toLowerCase().includes(tagSearch.toLowerCase()) && !taggedShops.some((t) => t.id === s.id)
  );

  // ── Create Post ──
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;
    setPosting(true);
    try {
      const tagNames = taggedShops.map((s) => `@${s.name}`).join(" ");
      const locationText = postLocation ? `\n📍 ${postLocation}` : "";
      const fullContent = `${newPostContent}${tagNames ? "\n" + tagNames : ""}${locationText}`;

      const result = await createFeedPost({
        content: fullContent,
        authorId: user.id,
        locationId: postLocation || user.location,
        images: postImages,
      });
      if (result?.post) {
        setLocalPosts((prev) => [{
          ...result.post,
          author: { id: user.id, name: `${user.firstName} ${user.lastName}`, avatar: user.avatar, role: user.role as "customer" | "shop_owner" },
          likes: 0, likedBy: [], comments: [], commentsCount: 0, shares: 0,
        }, ...prev]);
      }
      setNewPostContent("");
      setPostImages([]);
      setPostLocation("");
      setTaggedShops([]);
      setShowCreatePost(false);
    } catch (e) {
      console.error("Failed to create post:", e);
    } finally {
      setPosting(false);
    }
  };

  // ── Deal ──
  const handleMakeDeal = async (productName: string, shopOwnerId: string, dealData?: { quantity: number; suggestedPrice: number; message: string }) => {
    if (!user?.id) return;
    try {
      const chatsRes = await fetch(`/api/chat?userId=${user.id}`);
      const chatsData = await chatsRes.json();
      const existingChat = (chatsData.chats || []).find((c: { participants: { id: string }[]; type: string }) => c.type === "deal" && c.participants.some((p: { id: string }) => p.id === shopOwnerId));
      let chatId = existingChat?.id;
      if (!chatId) {
        const res = await createChat({ type: "deal", participants: [user.id, shopOwnerId], dealInfo: { productName, quantity: dealData?.quantity, initialPrice: dealData?.suggestedPrice, status: "pending" } });
        chatId = res?.chat?.id;
      }
      if (chatId && dealData) {
        const { sendMessage: sendMsg } = await import("@/hooks/useApi");
        await sendMsg({ chatId, senderId: user.id, senderName: `${user.firstName} ${user.lastName}`, senderRole: "customer", content: dealData.message, type: "deal_update" });
      }
      router.push(chatId ? `/customer/chat?chatId=${chatId}` : "/customer/chat");
    } catch (e) { console.error("Failed to create deal chat:", e); }
  };

  const handleContactShop = async (shopOwnerId: string) => {
    if (!user?.id) return;
    try {
      const chatsRes = await fetch(`/api/chat?userId=${user.id}`);
      const chatsData = await chatsRes.json();
      const existingChat = (chatsData.chats || []).find((c: { participants: { id: string }[] }) => c.participants.some((p: { id: string }) => p.id === shopOwnerId));
      if (existingChat) { router.push(`/customer/chat?chatId=${existingChat.id}`); return; }
      const res = await createChat({ type: "general", participants: [user.id, shopOwnerId] });
      router.push(res?.chat?.id ? `/customer/chat?chatId=${res.chat.id}` : "/customer/chat");
    } catch (e) { console.error("Failed to create chat:", e); }
  };

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={user?.avatar} alt={user?.firstName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-amber-golden text-primary-foreground text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="flex-1 justify-start text-muted-foreground text-sm h-9" onClick={() => setShowCreatePost(true)}>
              What&apos;s on your mind, {user?.firstName}?
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={handlePhotoPick}>
              <Image className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Photo</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={() => setShowLocationPicker(true)}>
              <MapPin className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Location</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={() => setShowTagPicker(true)}>
              <Tag className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Tag</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
        {([ { id: "all" as const, label: "All", icon: TrendingUp }, { id: "promotions" as const, label: "Promos", icon: Star }, { id: "nearby" as const, label: "Nearby", icon: MapPin } ]).map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 justify-center", filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            <f.icon className="h-3.5 w-3.5" /><span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {feedPosts.length === 0 ? (
            <div className="text-center py-12"><TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm font-medium">No posts yet</p><p className="text-xs text-muted-foreground">Be the first to share something!</p></div>
          ) : (
            feedPosts.map((post) => (
              <FeedPost key={post.id} post={post} onLike={handleLike} onComment={handleComment} onShare={handleShare} onMakeDeal={handleMakeDeal} onContactShop={handleContactShop} currentUserId={user?.id} currentUserName={user ? `${user.firstName} ${user.lastName}` : undefined} />
            ))
          )}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-0">
          <DialogHeader className="p-3 border-b border-border"><DialogTitle className="text-sm font-bold">Create Post</DialogTitle></DialogHeader>
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8"><AvatarImage src={user?.avatar} /><AvatarFallback className="bg-primary text-xs text-primary-foreground">{user?.firstName?.[0]}</AvatarFallback></Avatar>
              <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <Textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="What's on your mind?" rows={4} className="resize-none" />

            {/* Selected images preview */}
            {postImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">{postImages.map((img, i) => (
                <div key={i} className="relative shrink-0"><img src={img} className="h-20 w-20 object-cover rounded-lg" alt="" /><button onClick={() => setPostImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-black/60 rounded-full p-0.5"><X className="h-3 w-3 text-white" /></button></div>
              ))}</div>
            )}

            {/* Location tag */}
            {postLocation && (
              <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 rounded-lg px-2 py-1.5"><MapPin className="h-3 w-3" />{postLocation}<button onClick={() => setPostLocation("")}><X className="h-3 w-3" /></button></div>
            )}

            {/* Tagged shops */}
            {taggedShops.length > 0 && (
              <div className="flex flex-wrap gap-1">{taggedShops.map((shop) => (
                <span key={shop.id} className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-1">@{shop.name}<button onClick={() => setTaggedShops((prev) => prev.filter((s) => s.id !== shop.id))}><X className="h-3 w-3" /></button></span>
              ))}</div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handlePhotoPick}><Image className="h-4 w-4 mr-1" />Photo</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowLocationPicker(true)}><MapPin className="h-4 w-4 mr-1" />Location</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowTagPicker(true)}><Tag className="h-4 w-4 mr-1" />Tag</Button>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim() || posting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Picker Dialog */}
      <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-sm p-4">
          <DialogTitle className="text-sm font-bold mb-3">Add Location</DialogTitle>
          <Button onClick={handleLocationPick} className="w-full justify-start mb-2"><MapPin className="h-4 w-4 mr-2" />Use Current Location</Button>
          <Button variant="outline" onClick={() => { setPostLocation("Lusaka, Zambia"); setShowLocationPicker(false); }} className="w-full justify-start"><MapPin className="h-4 w-4 mr-2" />Lusaka, Zambia</Button>
        </DialogContent>
      </Dialog>

      {/* Tag Picker Dialog */}
      <Dialog open={showTagPicker} onOpenChange={setShowTagPicker}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-sm p-0">
          <DialogHeader className="p-3 border-b border-border"><DialogTitle className="text-sm font-bold">Tag a Shop</DialogTitle></DialogHeader>
          <div className="p-3 space-y-2">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search shops..." value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} className="pl-10" /></div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredShops.map((shop) => (
                <button key={shop.id} onClick={() => { setTaggedShops((prev) => [...prev, shop]); setTagSearch(""); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left">
                  <div className="h-7 w-7 bg-primary/10 rounded flex items-center justify-center shrink-0"><Tag className="h-3.5 w-3.5 text-primary" /></div>
                  <div><p className="text-xs font-medium">{shop.name}</p><p className="text-[10px] text-muted-foreground">{shop.specialties?.[0] || ""}</p></div>
                </button>
              ))}
              {filteredShops.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No shops found</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
