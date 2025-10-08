import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  PhoneCall,
} from "lucide-react";
import MessageBubble from "../../components/MessageBubble";
import MessageInput from "../../components/MessageInput";
import ChatListSimple from "../../components/ChatListSimple";
import type { Deal } from "../../types/deals";
import type { Message } from "../../types/chat";

function ChatPage() {
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();
  const location = useLocation();
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
  } | null;

  const [showChatList, setShowChatList] = useState(!dealData); // Show chat list by default if no deal data
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample messages for the selected deal
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg1",
      chatId: dealId || "1",
      senderId: "customer1",
      senderName: "You",
      senderRole: "customer",
      content: dealData?.deal?.message || "Hello, I'm interested in this product.",
      type: "text",
      timestamp: dealData?.deal?.timestamp || "2024-01-15T10:30:00Z",
      isRead: true,
      readBy: []
    },
    {
      id: "msg2",
      chatId: dealId || "1",
      senderId: dealData?.shopId || "shop1",
      senderName: dealData?.shopOwner || "Shop Owner",
      senderRole: "shop_owner",
      content: "Hello! Yes, the product is available. What's your budget?",
      type: "text",
      timestamp: "2024-01-15T11:00:00Z",
      isRead: true,
      readBy: ["customer1"]
    },
    {
      id: "msg3",
      chatId: dealId || "1",
      senderId: "customer1",
      senderName: "You",
      senderRole: "customer",
      content: "I was thinking around K4,000. Is that possible?",
      type: "text",
      timestamp: "2024-01-15T11:15:00Z",
      isRead: true,
      readBy: []
    },
    {
      id: "msg4",
      chatId: dealId || "1",
      senderId: dealData?.shopId || "shop1",
      senderName: dealData?.shopOwner || "Shop Owner",
      senderRole: "shop_owner",
      content: dealData?.deal?.lastMessage || "I can offer K4,200. What do you think?",
      type: "text",
      timestamp: dealData?.deal?.lastMessageTime || "2024-01-15T14:20:00Z",
      isRead: false,
      readBy: []
    },
  ]);

  const handleSendMessage = (content: string, type?: "text" | "image" | "file") => {
    if (content.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        chatId: dealId || "1",
        senderId: "customer1",
        senderName: "You",
        senderRole: "customer",
        content: content,
        type: type || "text",
        timestamp: new Date().toISOString(),
        isRead: true,
        readBy: []
      };

      setMessages((prev) => [...prev, newMsg]);

      // Auto-scroll to bottom after sending message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleSendFile = (file: File) => {
    console.log("Sending file:", file.name);
    // Handle file upload
  };

  const handleSendImage = (file: File) => {
    console.log("Sending image:", file.name);
    // Handle image upload
  };

  const handleDealAction = (action: string) => {
    console.log(`Deal ${action} for deal:`, dealId);
    // Here you would handle deal actions (confirm, cancel, etc.)
  };

  const handleOfflineCall = () => {
    // Simple phone call - open phone dialer directly
    const phoneNumber = "+260977123456"; // Default number
    window.open(`tel:${phoneNumber}`, '_self');
  };


  // Handle chat selection
  const handleChatSelect = () => {
    setShowChatList(false);
  };

  const handleNewChat = () => {
    console.log("Starting new chat");
    // Handle new chat creation
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show chat list if showChatList is true
  if (showChatList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-dark">
        <ChatListSimple 
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onBack={() => navigate(-1)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-dark">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                // Go back to chat list
                setShowChatList(true);
              }}
              className="flex items-center space-x-1 sm:space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            
            {/* Centered party info */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 justify-center">
              <img
                src={
                  dealData?.shopAvatar ||
                  `https://ui-avatars.com/api/?name=${dealData?.shopOwner || 'Contact'}&background=random`
                }
                alt={dealData?.shopOwner || 'Contact'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0 text-center">
                <h1 className="text-sm sm:text-lg font-bold text-slate-100 truncate">
                  {dealData?.shopOwner || 'Contact'}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm truncate">
                  {dealData?.shopName || 'Chat'}
                </p>
              </div>
            </div>
            
            {/* Offline call button on the far right */}
            <button 
              onClick={() => handleOfflineCall()}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200 flex-shrink-0"
              title="Offline Call"
            >
              <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Product Info (if available) */}
          {dealData?.productName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-4 mb-4 sm:mb-6"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img
                  src={dealData?.productImage}
                  alt={dealData?.productName}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-100 text-sm sm:text-lg mb-1 truncate">
                    {dealData?.productName}
                  </h3>
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
                    {dealData?.deal?.finalPrice && (
                      <span className="text-amber-golden font-bold text-sm sm:text-lg">
                        K{dealData?.deal?.finalPrice.toLocaleString()}
                      </span>
                    )}
                    {dealData?.deal?.initialPrice &&
                      dealData?.deal?.finalPrice &&
                      dealData?.deal?.initialPrice !==
                        dealData?.deal?.finalPrice && (
                        <span className="text-slate-500 text-xs sm:text-sm line-through">
                          K{dealData?.deal?.initialPrice.toLocaleString()}
                        </span>
                      )}
                    <span className="text-slate-400 text-xs sm:text-sm">
                      Qty: {dealData?.deal?.quantity || 1}
                    </span>
                  </div>
                </div>
                {dealData?.deal?.status === "negotiating" && (
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
            <MessageInput
              onSendMessage={handleSendMessage}
              onSendFile={handleSendFile}
              onSendImage={handleSendImage}
              placeholder={`Message ${dealData?.shopOwner}...`}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default ChatPage;
