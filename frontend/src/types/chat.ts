export interface Chat {
  id: string;
  type: "deal" | "general";
  participants: ChatParticipant[];
  lastMessage?: Message;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  dealInfo?: {
    dealId: string;
    productName: string;
    productImage?: string;
    initialPrice?: number;
    finalPrice?: number;
    status: "pending" | "negotiating" | "confirmed" | "completed" | "cancelled";
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: "customer" | "shop_owner";
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "shop_owner";
  content: string;
  type: "text" | "image" | "file" | "deal_update" | "system";
  timestamp: string;
  isRead: boolean;
  readBy: string[];
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ChatSettings {
  notifications: boolean;
  soundEnabled: boolean;
  theme: "light" | "dark";
  fontSize: "small" | "medium" | "large";
}
