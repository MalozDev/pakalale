"use client";

import { useState } from "react";
import { Search, MessageSquare, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChats, type ChatData } from "@/hooks/useApi";

interface ChatListSimpleProps {
  userId: string;
  onChatSelect: (chat: ChatData) => void;
  onNewChat: () => void;
  onBack?: () => void;
}

export default function ChatListSimple({ userId, onChatSelect, onNewChat, onBack }: ChatListSimpleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading } = useChats(userId);

  const allChats = data?.chats || [];
  const filteredChats = allChats.filter(
    (chat) =>
      chat.participants.some((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60);
    if (diff < 1) return "Now";
    if (diff < 24) return `${Math.floor(diff)}h`;
    if (diff < 48) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b border-border space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Messages</h2>
            <Badge variant="secondary" className="text-[10px]">
              {filteredChats.length} chats
            </Badge>
          </div>
          <Button size="sm" onClick={onNewChat} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 border-b border-border">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-2 w-40" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredChats.map((chat) => {
              const other = chat.otherParticipant;
              return (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className="w-full p-3 border-b border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-muted text-xs">
                          {other?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm font-semibold truncate">{other?.name || "Unknown"}</h3>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ""}
                        </span>
                      </div>

                      {chat.dealInfo && (
                        <Badge variant="secondary" className="text-[9px] h-4 mb-1 bg-primary/10 text-primary">
                          Deal: {chat.dealInfo.productName}
                        </Badge>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate">{chat.lastMessage?.content || "No messages yet"}</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredChats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">No chats found</p>
                <p className="text-xs">{searchQuery ? "Try a different search" : "Start a new conversation"}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
