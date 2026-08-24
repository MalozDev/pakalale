"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, PhoneCall } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import ChatListSimple from "@/components/ChatListSimple";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useChatMessages, sendMessage, type ChatData, type MessageData } from "@/hooks/useApi";

export default function ShopChatPage() {
  const { user } = useAuthStore();
  const [showChatList, setShowChatList] = useState(true);
  const [activeChat, setActiveChat] = useState<ChatData | null>(null);
  const [replyTo, setReplyTo] = useState<{ messageId: string; content: string; senderName: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const hasScrolledOnOpen = useRef(false);

  const { data: messagesData, refetch: refetchMessages } = useChatMessages(activeChat?.id || null);
  const messages: MessageData[] = messagesData?.messages || [];

  const unreadDividerIndex = useMemo(() => {
    if (!user?.id || messages.length === 0) return -1;
    return messages.findIndex((m) => !m.isRead && m.senderId !== user.id);
  }, [messages, user?.id]);

  const hasUnread = unreadDividerIndex >= 0;

  useEffect(() => {
    if (!messagesEndRef.current || messages.length === 0) return;
    if (!hasScrolledOnOpen.current) {
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

  // Mark messages as read
  useEffect(() => {
    if (!activeChat?.id || !user?.id) return;
    fetch("/api/chat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", chatId: activeChat.id, senderId: user.id }),
    }).catch(() => {});
  }, [activeChat?.id, user?.id, messages.length]);

  const handleSendMessage = async (content: string, type?: "text" | "image" | "file" | "voice") => {
    if (!content.trim() || !activeChat || !user) return;

    const payload: Record<string, unknown> = {
      chatId: activeChat.id,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: "shop_owner",
      content,
      type: type || "text",
    };
    if (replyTo) {
      payload.replyTo = replyTo;
      setReplyTo(null);
    }

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
    setReplyTo(null);
    setShowChatList(false);
    hasScrolledOnOpen.current = false;
  };

  if (showChatList) {
    return (
      <div className="min-h-screen bg-background">
        <ChatListSimple
          userId={user?.id || ""}
          onChatSelect={handleChatSelect}
          onNewChat={() => {}}
          onBack={() => window.history.back()}
        />
      </div>
    );
  }

  const otherName = activeChat?.otherParticipant?.name || "Customer";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="sm" onClick={() => { setShowChatList(true); setActiveChat(null); setReplyTo(null); }}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <div className="text-center min-w-0">
            <h1 className="text-sm font-bold truncate">{otherName}</h1>
            <p className="text-[10px] text-muted-foreground">
              {activeChat?.dealInfo ? `Deal: ${activeChat.dealInfo.productName}` : "Customer"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <PhoneCall className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, idx) => (
          <div key={message.id}>
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
