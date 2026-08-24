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
