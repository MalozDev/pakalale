import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  ShoppingBag,
  Star,
  MapPin,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "shop";
  content: string;
  timestamp: string;
  type: "text" | "deal" | "product";
  product?: {
    name: string;
    price: number;
    image: string;
  };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName?: string;
  shopLocation?: string;
  shopRating?: number;
}

function ChatModal({
  isOpen,
  onClose,
  shopName = "Tech Hub Electronics",
  shopLocation = "Soweto Market",
  shopRating = 4.8,
}: ChatModalProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "shop",
      content: "Hello! Welcome to our shop. How can I help you today?",
      timestamp: "10:30 AM",
      type: "text",
    },
    {
      id: "2",
      sender: "user",
      content:
        "Hi! I'm interested in the iPhone 15 Pro Max. Is it still available?",
      timestamp: "10:32 AM",
      type: "text",
    },
    {
      id: "3",
      sender: "shop",
      content: "Yes, it's available! Here are the details:",
      timestamp: "10:33 AM",
      type: "product",
      product: {
        name: "iPhone 15 Pro Max 256GB",
        price: 8500,
        image:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200",
      },
    },
    {
      id: "4",
      sender: "shop",
      content:
        "Would you like to make a deal? I can offer you a 5% discount if you buy today!",
      timestamp: "10:35 AM",
      type: "deal",
    },
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text",
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-golden to-red-deep rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{shopName}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>{shopLocation}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span>{shopRating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  <Video className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.sender === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    {message.type === "text" && (
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.sender === "user"
                            ? "bg-amber-golden text-white"
                            : "bg-slate-700 text-slate-100"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}

                    {message.type === "product" && message.product && (
                      <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-100 text-sm">
                              {message.product.name}
                            </h4>
                            <p className="text-amber-golden font-semibold">
                              K{message.product.price}
                            </p>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm mt-2">
                          {message.content}
                        </p>
                      </div>
                    )}

                    {message.type === "deal" && (
                      <div className="bg-gradient-to-r from-amber-golden/20 to-red-deep/20 border border-amber-golden/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <ShoppingBag className="h-4 w-4 text-amber-golden" />
                          <span className="text-amber-golden font-medium text-sm">
                            Deal Offer
                          </span>
                        </div>
                        <p className="text-slate-100 text-sm">
                          {message.content}
                        </p>
                        <button className="mt-2 bg-amber-golden hover:bg-amber-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors duration-200">
                          Accept Deal
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  <Paperclip className="h-4 w-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
                  />
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  <Smile className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-amber-golden hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ChatModal;
