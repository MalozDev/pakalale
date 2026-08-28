"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PhoneCall,
  Wifi,
  WifiOff,
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  Handshake,
  Tag,
} from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import ChatListSimple from "@/components/ChatListSimple";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  useChats,
  useChatMessages,
  sendMessage,
  updateDealStatus,
  type ChatData,
  type MessageData,
} from "@/hooks/useApi";
import { useSocket, type SocketMessage } from "@/hooks/useSocket";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get("chatId");
  const { user } = useAuthStore();
  const [showChatList, setShowChatList] = useState(!chatIdFromUrl);
  const [activeChat, setActiveChat] = useState<ChatData | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{
    messageId: string;
    content: string;
    senderName: string;
  } | null>(null);

  // Pending messages — messages sent locally but not yet confirmed by server
  const [pendingMessages, setPendingMessages] = useState<MessageData[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolledOnOpen = useRef(false);
  const isUserScrolledUp = useRef(false);

  // Fetch chat list to auto-select from URL
  const { data: chatsData } = useChats(user?.id || null);
  const chats = chatsData?.chats || [];

  // Auto-select chat from URL param
  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0 && !activeChat) {
      const found = chats.find((c) => c.id === chatIdFromUrl);
      if (found) {
        setActiveChat(found);
        setShowChatList(false);
        hasScrolledOnOpen.current = false;
        isUserScrolledUp.current = false;
        setPendingMessages([]);
      }
    }
  }, [chatIdFromUrl, chats, activeChat]);

  const {
    data: messagesData,
    refetch: refetchMessages,
  } = useChatMessages(activeChat?.id || null);
  const messages: MessageData[] = messagesData?.messages || [];

  // Combine server messages with pending messages
  const allMessages = useMemo(() => {
    const serverIds = new Set(messages.map((m) => m.id));
    const stillPending = pendingMessages.filter((m) => !serverIds.has(m.id));
    return [...messages, ...stillPending];
  }, [messages, pendingMessages]);

  // Calculate unread divider position
  const unreadDividerIndex = useMemo(() => {
    if (!user?.id || allMessages.length === 0) return -1;
    const idx = allMessages.findIndex(
      (m) => !m.isRead && m.senderId !== user.id
    );
    return idx;
  }, [allMessages, user?.id]);

  const hasUnread = unreadDividerIndex >= 0;

  // Track if user scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    isUserScrolledUp.current = !isAtBottom;
  }, []);

  // ── Native back handling ──
  // When entering a chat, push state so native back goes to chatlist
  const goToChatList = useCallback(() => {
    setActiveChat(null);
    setReplyTo(null);
    setPendingMessages([]);
    setTypingUser(null);
    setShowChatList(true);
    hasScrolledOnOpen.current = false;
    isUserScrolledUp.current = false;
    window.history.replaceState(null, "", "/customer/chat");
  }, []);

  const enterChat = useCallback((chat: ChatData) => {
    setActiveChat(chat);
    setTypingUser(null);
    setReplyTo(null);
    setPendingMessages([]);
    setShowChatList(false);
    hasScrolledOnOpen.current = false;
    isUserScrolledUp.current = false;
    // Push a new history entry so native back returns to chatlist
    window.history.pushState(
      { chatId: chat.id },
      "",
      `/customer/chat?chatId=${chat.id}`
    );
  }, []);

  // Listen for native back button
  useEffect(() => {
    const handlePopState = () => {
      // If we're in a chat and user presses back, go to chatlist
      if (activeChat) {
        setActiveChat(null);
        setReplyTo(null);
        setPendingMessages([]);
        setTypingUser(null);
        setShowChatList(true);
        hasScrolledOnOpen.current = false;
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeChat]);

  // Socket.IO: receive messages from OTHER users only
  const handleNewMessage = useCallback(
    (msg: SocketMessage) => {
      if (msg.chatId !== activeChat?.id) return;
      refetchMessages();
    },
    [activeChat?.id, refetchMessages]
  );

  const handleTyping = useCallback(
    (data: { chatId: string; userId: string; userName: string }) => {
      if (data.chatId !== activeChat?.id || data.userId === user?.id) return;
      setTypingUser(data.userName);
    },
    [activeChat?.id, user?.id]
  );

  const handleStopTyping = useCallback(
    (data: { chatId: string; userId: string }) => {
      if (data.chatId !== activeChat?.id) return;
      setTypingUser(null);
    },
    [activeChat?.id]
  );

  const {
    isConnected,
    sendMessage: sendSocketMessage,
  } = useSocket({
    userId: user?.id,
    chatId: activeChat?.id || undefined,
    onMessage: handleNewMessage,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
  });

  // Scroll to bottom on first load, then smooth on new messages
  useEffect(() => {
    if (!messagesEndRef.current || allMessages.length === 0) return;

    if (!hasScrolledOnOpen.current) {
      // On first load: scroll to unread divider if exists, otherwise bottom
      if (unreadDividerRef.current) {
        setTimeout(() => {
          unreadDividerRef.current?.scrollIntoView({
            behavior: "instant",
            block: "start",
          });
        }, 50);
      } else {
        // Scroll to absolute bottom so last message is above the input
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
      }
      hasScrolledOnOpen.current = true;
    } else if (!isUserScrolledUp.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, hasUnread]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!activeChat?.id || !user?.id) return;
    fetch("/api/chat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "markRead",
        chatId: activeChat.id,
        senderId: user.id,
      }),
    }).catch(() => {});
  }, [activeChat?.id, user?.id, allMessages.length]);

  // Clear typing indicator after 3 seconds
  useEffect(() => {
    if (typingUser) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [typingUser]);

  const handleSendMessage = async (
    content: string,
    type?: "text" | "image" | "file" | "voice"
  ) => {
    if (!content.trim() || !activeChat || !user) return;

    const senderName = `${user.firstName} ${user.lastName}`;
    const tempId = `pending-${Date.now()}`;

    const pendingMsg: MessageData = {
      id: tempId,
      chatId: activeChat.id,
      senderId: user.id,
      senderName,
      senderRole: "customer",
      content,
      type: type || "text",
      isRead: false,
      readBy: [],
      replyTo: replyTo || undefined,
      timestamp: new Date().toISOString(),
    };

    setPendingMessages((prev) => [...prev, pendingMsg]);

    // Scroll to bottom immediately for sent messages
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isUserScrolledUp.current = false;
    }, 50);

    const payload: Record<string, unknown> = {
      chatId: activeChat.id,
      senderId: user.id,
      senderName,
      senderRole: "customer",
      content,
      type: type || "text",
    };
    if (replyTo) {
      payload.replyTo = replyTo;
      setReplyTo(null);
    }

    if (isConnected) {
      sendSocketMessage({
        chatId: activeChat.id,
        senderId: user.id,
        senderName,
        senderRole: "customer",
        content,
        type: type || "text",
      });
    }

    try {
      await sendMessage(
        payload as Parameters<typeof sendMessage>[0]
      );
      setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
      refetchMessages();
    } catch (e) {
      console.error("Failed to send message:", e);
      setPendingMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, content: `${content} (failed)` } : m
        )
      );
    }
  };

  const handleReply = (message: MessageData) => {
    setReplyTo({
      messageId: message.id,
      content:
        message.type === "voice" ? "🎤 Voice message" : message.content,
      senderName: message.senderName,
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (messageId.startsWith("pending-")) {
      setPendingMessages((prev) => prev.filter((m) => m.id !== messageId));
      return;
    }
    try {
      await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", messageId }),
      });
      refetchMessages();
    } catch (e) {
      console.error("Failed to delete message:", e);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (messageId.startsWith("pending-")) {
      setPendingMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: newContent } : m
        )
      );
      return;
    }
    try {
      await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          messageId,
          content: newContent,
        }),
      });
      refetchMessages();
    } catch (e) {
      console.error("Failed to edit message:", e);
    }
  };

  const handleChatSelect = (chat: ChatData) => {
    enterChat(chat);
  };

  // ── Deal status actions ──
  const handleDealAction = async (status: "pending" | "negotiating" | "confirmed" | "completed" | "cancelled") => {
    if (!activeChat || !user) return;
    try {
      await updateDealStatus(activeChat.id, status, user.id);
      setActiveChat((prev) =>
        prev ? { ...prev, dealInfo: prev.dealInfo ? { ...prev.dealInfo, status } : undefined }
          : prev
      );
      refetchMessages();
    } catch (e) {
      console.error("Failed to update deal status:", e);
    }
  };

  const dealStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Clock },
    negotiating: { label: "Negotiating", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Handshake },
    confirmed: { label: "Confirmed", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
    completed: { label: "Completed", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
  };

  // Show chat skeleton when navigating directly to a chat via URL
  if (chatIdFromUrl && !activeChat && chats.length === 0) {
    return (
      <div className="h-[100dvh] bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border shrink-0">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="text-center space-y-1">
              <div className="h-3 w-24 bg-muted rounded animate-pulse mx-auto" />
              <div className="h-2 w-16 bg-muted rounded animate-pulse mx-auto" />
            </div>
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </header>
        <div className="flex-1 p-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <div
                className="bg-muted rounded-2xl px-4 py-2.5 space-y-1"
                style={{ width: `${60 + Math.random() * 30}%` }}
              >
                <div className="h-3 w-full bg-background/30 rounded animate-pulse" />
                <div className="h-2 w-12 bg-background/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="shrink-0 p-3 border-t border-border">
          <div className="h-10 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (showChatList) {
    return (
      <div className="h-[100dvh] bg-background flex flex-col">
        <ChatListSimple
          userId={user?.id || ""}
          onChatSelect={handleChatSelect}
          onNewChat={() => {}}
          onBack={() => router.push("/customer")}
        />
      </div>
    );
  }

  const otherName = activeChat?.otherParticipant?.name || "Shop Owner";

  return (
    <>
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={goToChatList}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-0">
            <div className="flex items-center gap-2 justify-center">
              <h1 className="text-sm font-bold truncate">{otherName}</h1>
              {isConnected ? (
                <Wifi className="h-3 w-3 text-emerald-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {typingUser
                ? `${typingUser} is typing...`
                : activeChat?.type === "deal"
                  ? (activeChat?.dealInfo?.productName || "Deal")
                  : "Chat"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <PhoneCall className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ── Pinned Deal Banner ── */}
      {activeChat?.type === "deal" && activeChat?.dealInfo && (
        <div className="sticky top-14 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
          <div className="px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{activeChat.dealInfo.productName}</p>
                  <div className="flex items-center gap-1.5">
                    {activeChat.dealInfo.initialPrice && (
                      <span className="text-[10px] text-primary font-bold">K{activeChat.dealInfo.initialPrice.toLocaleString()}</span>
                    )}
                    {activeChat.dealInfo.finalPrice && activeChat.dealInfo.finalPrice !== activeChat.dealInfo.initialPrice && (
                      <>
                        <span className="text-[10px] text-muted-foreground">→</span>
                        <span className="text-[10px] text-emerald-400 font-bold">K{activeChat.dealInfo.finalPrice.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {(() => {
                const cfg = dealStatusConfig[activeChat.dealInfo.status] || dealStatusConfig.pending;
                const StatusIcon = cfg.icon;
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                );
              })()}
            </div>

            {/* ── Deal action buttons — role-aware ── */}
            {(() => {
              const isShopOwner = activeChat.otherParticipant?.role !== "shop_owner";
              const dealStatus = activeChat.dealInfo.status;

              // Shop owner: pending deal → Accept / Decline / Negotiate
              if (isShopOwner && dealStatus === "pending") {
                return (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="h-7 text-[10px] flex-1 bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => handleDealAction("confirmed" as const)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" onClick={() => handleDealAction("negotiating" as const)}>
                      <Handshake className="h-3 w-3 mr-1" /> Negotiate
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDealAction("cancelled" as const)}>
                      <XCircle className="h-3 w-3 mr-1" /> Decline
                    </Button>
                  </div>
                );
              }

              // Customer: pending deal → waiting for shop owner
              if (!isShopOwner && dealStatus === "pending") {
                return (
                  <p className="text-[10px] text-muted-foreground mt-1.5">Awaiting shop owner&apos;s response...</p>
                );
              }

              // Both: negotiating → send messages to discuss, confirm or cancel
              if (dealStatus === "negotiating") {
                return (
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[10px] text-blue-400">Negotiating — send a message with your counter-offer</p>
                    <div className="flex gap-1.5 shrink-0 ml-2">
                      <Button size="sm" className="h-6 text-[9px] px-2 bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => handleDealAction("confirmed" as const)}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-[9px] px-2 text-destructive border-destructive/30" onClick={() => handleDealAction("cancelled" as const)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                );
              }

              // Both: confirmed → mark complete or cancel
              if (dealStatus === "confirmed") {
                return (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="h-7 text-[10px] flex-1 bg-primary text-primary-foreground" onClick={() => handleDealAction("completed" as const)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Complete
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDealAction("cancelled" as const)}>
                      <XCircle className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  </div>
                );
              }

              return null;
            })()}
          </div>
        </div>
      )}

      {/* ── No deal banner for general chats ── */}
      {activeChat?.type === "general" && (
        <div className="sticky top-14 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
          <div className="px-3 py-2 flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">No deal — just chatting</p>
          </div>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto flex flex-col p-3 pb-[90px] sm:pb-[60px]"
        onScroll={handleScroll}
      >
        {/* Spacer pushes messages to the bottom — they grow upward from here */}
        <div className="flex-1" />
        {allMessages.map((message, idx) => (
          <div key={message.id} className="mb-3">
            {idx === unreadDividerIndex && (
              <div ref={unreadDividerRef} className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Unread messages
                </span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
            )}
            <MessageBubble
              message={message}
              currentUserId={user?.id}
              onReply={handleReply}
              onDelete={handleDeleteMessage}
              onEdit={handleEditMessage}
              showAvatar={
                idx === 0 ||
                allMessages[idx - 1]?.senderId !== message.senderId
              }
              isConsecutive={
                idx > 0 &&
                allMessages[idx - 1]?.senderId === message.senderId
              }
              isPending={message.id.startsWith("pending-")}
            />
          </div>
        ))}
        {typingUser && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span>{typingUser} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} className="h-0" />
      </div>
    </div>

    {/* Input — truly fixed, never moves */}
    <div className="fixed left-0 right-0 bottom-14 sm:bottom-0 z-40 bg-background border-t border-border safe-area-bottom">
      <MessageInput
        onSendMessage={handleSendMessage}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        placeholder={`Message ${otherName}...`}
      />
    </div>
    </>
  );
}
