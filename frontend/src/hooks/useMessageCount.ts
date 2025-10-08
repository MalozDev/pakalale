import { useState, useEffect } from "react";
import type { Message } from "../types/chat";

interface MessageCounts {
  customerCount: number;
  shopCount: number;
  totalCount: number;
  unreadCount: number;
}

export function useMessageCount(messages: Message[] = []): MessageCounts {
  const [counts, setCounts] = useState<MessageCounts>({
    customerCount: 0,
    shopCount: 0,
    totalCount: 0,
    unreadCount: 0,
  });

  useEffect(() => {
    const customerCount = messages.filter(msg => msg.senderRole === "customer").length;
    const shopCount = messages.filter(msg => msg.senderRole === "shop_owner").length;
    const totalCount = customerCount + shopCount;
    const unreadCount = messages.filter(msg => !msg.isRead).length;

    setCounts({
      customerCount,
      shopCount,
      totalCount,
      unreadCount,
    });
  }, [messages]);

  return counts;
}
