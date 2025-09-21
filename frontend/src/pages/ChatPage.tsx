import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MoreVertical,
  Send,
  Image as ImageIcon,
  Paperclip,
  CheckCircle,
  XCircle,
} from "lucide-react";
import MessageBubble from "../components/MessageBubble";
import type { Deal, Message } from "../types/deals";

function ChatPage() {
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();
  const location = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get deal data from navigation state
  const dealData = location.state as {
    deal: Deal;
    shopId: string;
    shopName: string;
    shopOwner: string;
    shopAvatar?: string;
    productId?: string;
    productName?: string;
    productImage?: string;
  };

  // Sample messages for the selected deal
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg1",
      dealId: dealId || "1",
      senderId: "customer1",
      senderName: "You",
      senderRole: "customer",
      message:
        dealData?.deal?.message || "Hello, I'm interested in this product.",
      timestamp: dealData?.deal?.timestamp || "2024-01-15T10:30:00Z",
      isRead: true,
    },
    {
      id: "msg2",
      dealId: dealId || "1",
      senderId: dealData?.shopId || "shop1",
      senderName: dealData?.shopOwner || "Shop Owner",
      senderRole: "shop_owner",
      message: "Hello! Yes, the product is available. What's your budget?",
      timestamp: "2024-01-15T11:00:00Z",
      isRead: true,
    },
    {
      id: "msg3",
      dealId: dealId || "1",
      senderId: "customer1",
      senderName: "You",
      senderRole: "customer",
      message: "I was thinking around K4,000. Is that possible?",
      timestamp: "2024-01-15T11:15:00Z",
      isRead: true,
    },
    {
      id: "msg4",
      dealId: dealId || "1",
      senderId: dealData?.shopId || "shop1",
      senderName: dealData?.shopOwner || "Shop Owner",
      senderRole: "shop_owner",
      message:
        dealData?.deal?.lastMessage || "I can offer K4,200. What do you think?",
      timestamp: dealData?.deal?.lastMessageTime || "2024-01-15T14:20:00Z",
      isRead: false,
    },
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        dealId: dealId || "1",
        senderId: "customer1",
        senderName: "You",
        senderRole: "customer",
        message: newMessage,
        timestamp: new Date().toISOString(),
        isRead: true,
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      // Auto-scroll to bottom after sending message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDealAction = (action: string) => {
    console.log(`Deal ${action} for deal:`, dealId);
    // Here you would handle deal actions (confirm, cancel, etc.)
  };

  // If no deal data, redirect to deals list
  useEffect(() => {
    if (!dealData) {
      navigate("/deals");
    }
  }, [dealData, navigate]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!dealData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-dark">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-1 sm:space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 justify-center">
              <img
                src={
                  dealData.shopAvatar ||
                  `https://ui-avatars.com/api/?name=${dealData.shopOwner}&background=random`
                }
                alt={dealData.shopOwner}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0 text-center sm:text-left">
                <h1 className="text-sm sm:text-lg font-bold text-slate-100 truncate">
                  {dealData.shopName}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm truncate">
                  {dealData.shopOwner}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Product Info (if available) */}
          {dealData.productName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-4 mb-4 sm:mb-6"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img
                  src={dealData.productImage}
                  alt={dealData.productName}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-100 text-sm sm:text-lg mb-1 truncate">
                    {dealData.productName}
                  </h3>
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
                    {dealData.deal?.finalPrice && (
                      <span className="text-amber-golden font-bold text-sm sm:text-lg">
                        K{dealData.deal.finalPrice.toLocaleString()}
                      </span>
                    )}
                    {dealData.deal?.initialPrice &&
                      dealData.deal?.finalPrice &&
                      dealData.deal.initialPrice !==
                        dealData.deal.finalPrice && (
                        <span className="text-slate-500 text-xs sm:text-sm line-through">
                          K{dealData.deal.initialPrice.toLocaleString()}
                        </span>
                      )}
                    <span className="text-slate-400 text-xs sm:text-sm">
                      Qty: {dealData.deal?.quantity || 1}
                    </span>
                  </div>
                </div>
                {dealData.deal?.status === "negotiating" && (
                  <div className="flex flex-col space-y-1.5 sm:space-y-2 flex-shrink-0">
                    <button
                      onClick={() => handleDealAction("confirm")}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm rounded-lg transition-colors duration-200 flex items-center space-x-1 sm:space-x-2"
                    >
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleDealAction("cancel")}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm rounded-lg transition-colors duration-200 flex items-center space-x-1 sm:space-x-2"
                    >
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Chat Area */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Messages */}
            <div className="h-[400px] sm:h-[500px] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-slate-700 bg-slate-800/50">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-full transition-colors duration-200 flex-shrink-0">
                  <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-full transition-colors duration-200 flex-shrink-0">
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-full text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent text-sm resize-none min-h-[44px] sm:min-h-[48px] max-h-[120px] leading-5"
                    style={{
                      height: "44px",
                      overflow: "hidden",
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "44px";
                      target.style.height =
                        Math.min(target.scrollHeight, 120) + "px";
                    }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-amber-golden hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full transition-colors duration-200 flex-shrink-0"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
