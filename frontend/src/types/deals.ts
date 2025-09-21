export interface Deal {
  id: string;
  shopId: string;
  shopName: string;
  shopOwner: string;
  shopAvatar?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  status: "pending" | "negotiating" | "confirmed" | "completed" | "cancelled";
  initialPrice?: number;
  finalPrice?: number;
  quantity: number;
  message: string;
  timestamp: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  location: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  dealId: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "shop_owner";
  message: string;
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
}
