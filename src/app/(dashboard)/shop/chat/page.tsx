"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, PhoneCall } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import ChatListSimple from "@/components/ChatListSimple";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  useChatMessages,
  sendMessage,
  type ChatData,
  type MessageData,
} from "@/hooks/useApi";

export default function ShopChatPage() {
  const { user } = useAuthStore();
  const [showChatList, setShowChatList] = useState(true);
  const [activeChat, setActiveChat] = useState<ChatData | null>(null);
  const [replyTo, setReplyTo] = useState<{
    messageId: string;
    content: string;
    senderName: string;
  } | null>(null);

  const [pendingMessages, setPendingMessages] = useState<MessageData[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledOnOpen = useRef(false);
  const isUserScrolledUp = useRef(false);

  const {
    data: messagesData,
    refetch: refetchMessages,
  } = useChatMessages(activeChat?.id || null);
  const messages: MessageData[] = messagesData?.messages || [];

  const allMessages = useMemo(() => {
    const serverIds = new Set(messages.map((m) => m.id));
    const stillPending = pendingMessages.filter((m) => !serverIds.has(m.id));
    return [...messages, ...stillPending];
  }, [messages, pendingMessages]);

  const unreadDividerIndex = useMemo(() => {
    if (!user?.id || allMessages.length === 0) return -1;
    return allMessages.findIndex(
      (m) => !m.isRead && m.senderId !== user.id
    );
  }, [allMessages, user?.id]);

  const hasUnread = unreadDividerIndex >= 0;

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    isUserScrolledUp.current = !isAtBottom;
  }, []);

  useEffect(() => {
    if (!messagesEndRef.current || allMessages.length === 0) return;
    if (!hasScrolledOnOpen.current) {
      if (unreadDividerRef.current) {
        setTimeout(() => {
          unreadDividerRef.current?.scrollIntoView({
            behavior: "instant",
            block: "start",
          });
        }, 50);
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
      }
      hasScrolledOnOpen.current = true;
    } else if (!isUserScrolledUp.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, hasUnread]);

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

  const handleSendMessage = async (
    content: string,
    type?: "text" | "image" | "file" | "voice"
  ) => {
    if (!content.trim() || !activeChat || !user) return;

    const tempId = `pending-${Date.now()}`;
    const senderName = `${user.firstName} ${user.lastName}`;

    const pendingMsg: MessageData = {
      id: tempId,
      chatId: activeChat.id,
      senderId: user.id,
      senderName,
      senderRole: "shop_owner",
      content,
      type: type || "text",
      isRead: false,
      readBy: [],
      replyTo: replyTo || undefined,
      timestamp: new Date().toISOString(),
    };

    setPendingMessages((prev) => [...prev, pendingMsg]);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isUserScrolledUp.current = false;
    }, 50);

    const payload: Record<string, unknown> = {
      chatId: activeChat.id,
      senderId: user.id,
      senderName,
      senderRole: "shop_owner",
      content,
      type: type || "text",
    };
    if (replyTo) {
      payload.replyTo = replyTo;
      setReplyTo(null);
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

  const handleEditMessage = async (
    messageId: string,
    newContent: string
  ) => {
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
    setActiveChat(chat);
    setReplyTo(null);
    setPendingMessages([]);
    setShowChatList(false);
    hasScrolledOnOpen.current = false;
    isUserScrolledUp.current = false;
  };

  if (showChatList) {
    return (
      <div className="h-[100dvh] bg-background flex flex-col">
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
    <>
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowChatList(true);
              setActiveChat(null);
              setReplyTo(null);
              setPendingMessages([]);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="text-center min-w-0">
            <h1 className="text-sm font-bold truncate">{otherName}</h1>
            <p className="text-[10px] text-muted-foreground">
              {activeChat?.dealInfo
                ? `Deal: ${activeChat.dealInfo.productName}`
                : "Customer"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <PhoneCall className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto flex flex-col p-3 pb-[60px]"
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
        <div ref={messagesEndRef} className="h-0" />
      </div>
    </div>

    {/* Input — truly fixed, never moves */}
    <div className="fixed left-0 right-0 bottom-0 z-40 bg-background border-t border-border">
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
