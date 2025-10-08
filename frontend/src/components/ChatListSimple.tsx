import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MessageSquare, 
  Phone,
  ArrowLeft
} from "lucide-react";
import type { Chat } from "../types/chat";

interface ChatListSimpleProps {
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
  onBack?: () => void;
}

// Sample chats for demonstration
const sampleChats: Chat[] = [
  {
    id: "1",
    type: "deal",
    participants: [
      {
        id: "shop1",
        name: "Tech Store",
        role: "shop_owner",
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: "customer1",
        name: "John Doe",
        role: "customer",
        isOnline: true,
        lastSeen: new Date().toISOString()
      }
    ],
    lastMessage: {
      id: "msg1",
      chatId: "1",
      senderId: "customer1",
      senderName: "John Doe",
      senderRole: "customer",
      content: "Is the iPhone 15 Pro available?",
      type: "text",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
      readBy: []
    },
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 2,
    isActive: true,
    dealInfo: {
      dealId: "deal1",
      productName: "iPhone 15 Pro",
      productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop",
      initialPrice: 4500,
      finalPrice: 4200,
      status: "negotiating"
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "2",
    type: "general",
    participants: [
      {
        id: "shop1",
        name: "Tech Store",
        role: "shop_owner",
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: "customer2",
        name: "Jane Smith",
        role: "customer",
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    lastMessage: {
      id: "msg2",
      chatId: "2",
      senderId: "customer2",
      senderName: "Jane Smith",
      senderRole: "customer",
      content: "What are your business hours?",
      type: "text",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      isRead: true,
      readBy: ["shop1"]
    },
    lastMessageTime: new Date(Date.now() - 10800000).toISOString(),
    unreadCount: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString()
  }
];

function ChatListSimple({ onChatSelect, onNewChat, onBack }: ChatListSimpleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Calculate total messages for a participant (mock data for now)
  const getTotalMessages = (participantId: string) => {
    // In a real app, this would come from your API
    // For now, we'll use a simple calculation based on participant ID
    const baseCount = participantId === "customer1" ? 15 : participantId === "customer2" ? 8 : 12;
    return baseCount + Math.floor(Math.random() * 10);
  };

  const filteredChats = sampleChats.filter(chat => 
    chat.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat);
    onChatSelect(chat);
  };

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-100">Messages</h2>
              <span className="text-sm text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                {filteredChats.length} chats
              </span>
            </div>
          </div>
          <button
            onClick={onNewChat}
            className="p-2 bg-amber-golden hover:bg-amber-600 text-white rounded-lg transition-colors shadow-lg"
            title="Start new chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredChats.map((chat, index) => {
            const otherParticipant = chat.participants.find(p => p.role === "customer");
            const isSelected = selectedChat?.id === chat.id;
            const isOnline = otherParticipant?.isOnline;

            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-5 border-b border-slate-700 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? "bg-slate-700 border-l-4 border-l-amber-golden shadow-lg" 
                    : "hover:bg-slate-800 hover:shadow-md"
                }`}
                onClick={() => handleChatClick(chat)}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=random`}
                      alt={otherParticipant?.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-600"
                    />
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-100 truncate text-base">
                          {otherParticipant?.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                            {getTotalMessages(otherParticipant?.id || "")} messages
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {!isOnline && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle offline call
                            }}
                            className="p-2 text-slate-400 hover:text-amber-golden hover:bg-slate-700 rounded-full transition-colors"
                            title="Call when offline"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Deal Info */}
                    {chat.dealInfo && (
                      <div className="mb-1">
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                          Deal: {chat.dealInfo.productName}
                        </span>
                      </div>
                    )}

                    {/* Last Message */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-300 truncate flex-1 pr-2">
                        {chat.lastMessage?.content || "No messages yet"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <div className="bg-amber-golden text-white text-xs rounded-full min-w-[22px] h-6 flex items-center justify-center px-2 font-semibold shadow-lg">
                          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No chats found</p>
            <p className="text-sm text-center">
              {searchQuery ? "Try adjusting your search" : "Start a new conversation"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatListSimple;
