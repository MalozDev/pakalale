import { motion } from "framer-motion";
import type { Message } from "../types/deals";

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${
        message.senderRole === "customer" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          message.senderRole === "customer"
            ? "bg-amber-golden text-white"
            : "bg-slate-700 text-slate-100"
        }`}
      >
        <p className="text-sm">{message.message}</p>
        <p
          className={`text-xs mt-1 ${
            message.senderRole === "customer"
              ? "text-amber-100"
              : "text-slate-400"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
