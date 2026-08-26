"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, PhoneCall, Wifi, WifiOff, Loader2 } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import ChatListSimple from "@/components/ChatListSimple";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useChats, useChatMessages, sendMessage, type ChatData, type MessageData } from "@/hooks/useApi";
import { useSocket, type SocketMessage } from "@/hooks/useSocket";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get("chatId");
  const { user } = useAuthStore();
  const [showChatList, setShowChatList] = useState(!chatIdFromUrl);
  const [activeChat, setActiveChat] = useState<ChatData | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ messageId: string; content: string; senderName: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolledOnOpen = useRef(false);

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
      }
    }
  }, [chatIdFromUrl, chats, activeChat]);

  const { data: messagesData, refetch: refetchMessages } = useChatMessages(activeChat?.id || null);
  const messages: MessageData[] = messagesData?.messages || [];

  // Calculate unread divider position
  const unreadDividerIndex = useMemo(() => {
    if (!user?.id || messages.length === 0) return -1;
    // Find the first message that is unread and not sent by current user
    const idx = messages.findIndex((m) => !m.isRead && m.senderId !== user.id);
    return idx;
  }, [messages, user?.id]);

  const hasUnread = unreadDividerIndex >= 0;

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

  const { isConnected, sendMessage: sendSocketMessage, startTyping, stopTyping } = useSocket({
    userId: user?.id,
    chatId: activeChat?.id || undefined,
    onMessage: handleNewMessage,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
  });

  // Scroll to bottom on first load, then smooth on new messages
  useEffect(() => {
    if (!messagesEndRef.current || messages.length === 0) return;

    if (!hasScrolledOnOpen.current) {
      // On first load: scroll to unread divider if exists, otherwise bottom
      if (unreadDividerRef.current) {
        setTimeout(() => {
          unreadDividerRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
        }, 50);
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
      }
      hasScrolledOnOpen.current = true;
    } else {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, hasUnread]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!activeChat?.id || !user?.id) return;
    fetch("/api/chat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", chatId: activeChat.id, senderId: user.id }),
    }).catch(() => {});
  }, [activeChat?.id, user?.id, messages.length]);

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

  const handleSendMessage = async (content: string, type?: "text" | "image" | "file" | "voice") => {
    if (!content.trim() || !activeChat || !user) return;

    const senderName = `${user.firstName} ${user.lastName}`;

    // Include replyTo if present
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

    // Broadcast via WebSocket to other users only
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

    // Save to database via REST API
    try {
      await sendMessage(payload as Parameters<typeof sendMessage>[0]);
      refetchMessages();
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  };

  const handleReply = (message: MessageData) => {
    setReplyTo({
      messageId: message.id,
      content: message.type === "voice" ? "🎤 Voice message" : message.content,
      senderName: message.senderName,
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
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
    try {
      await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", messageId, content: newContent }),
      });
      refetchMessages();
    } catch (e) {
      console.error("Failed to edit message:", e);
    }
  };

  const handleChatSelect = (chat: ChatData) => {
    setActiveChat(chat);
    setTypingUser(null);
    setReplyTo(null);
    setShowChatList(false);
    hasScrolledOnOpen.current = false;
    window.history.replaceState(null, "", `/customer/chat?chatId=${chat.id}`);
  };

  // Show loading when navigating directly to a chat via URL
  if (chatIdFromUrl && !activeChat && chats.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (showChatList) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="sm" onClick={() => { setShowChatList(true); setActiveChat(null); setReplyTo(null); window.history.replaceState(null, "", "/customer/chat"); }}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
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
              {activeChat?.dealInfo ? `Deal: ${activeChat.dealInfo.productName}` : typingUser ? `${typingUser} is typing...` : "Chat"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <PhoneCall className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, idx) => (
          <div key={message.id}>
            {/* Unread divider */}
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
              showAvatar={idx === 0 || messages[idx - 1]?.senderId !== message.senderId}
              isConsecutive={idx > 0 && messages[idx - 1]?.senderId === message.senderId}
            />
          </div>
        ))}
        {typingUser && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span>{typingUser} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          placeholder={`Message ${otherName}...`}
        />
      </div>
    </div>
  );
}
