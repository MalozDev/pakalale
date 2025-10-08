import { motion } from "framer-motion";
import { useState } from "react";
import { 
  MoreVertical, 
  Reply, 
  Forward, 
  Copy, 
  Trash2, 
  Check,
  CheckCheck
} from "lucide-react";
import type { Message } from "../types/chat";

interface MessageBubbleProps {
  message: Message;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  showAvatar?: boolean;
  isConsecutive?: boolean;
}

function MessageBubble({ 
  message, 
  onReply, 
  onForward, 
  onDelete, 
  showAvatar = false,
  isConsecutive = false 
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  const getMessageStatus = () => {
    if (message.senderRole === "customer") {
      if (message.isRead && message.readBy.length > 0) {
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      } else if (message.isRead) {
        return <CheckCheck className="h-3 w-3 text-slate-400" />;
      } else {
        return <Check className="h-3 w-3 text-slate-400" />;
      }
    }
    return null;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  const handleReply = () => {
    onReply?.(message);
    setShowMenu(false);
  };

  const handleForward = () => {
    onForward?.(message);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete?.(message);
    setShowMenu(false);
  };

  const isOwnMessage = message.senderRole === "customer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group relative`}
    >
      <div className={`flex items-end space-x-2 max-w-[70%] ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}>
        {/* Avatar */}
        {showAvatar && !isOwnMessage && (
          <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0 mb-1">
            <img 
              src={`https://ui-avatars.com/api/?name=${message.senderName}&background=random`}
              alt={message.senderName}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        )}
        
        {/* Message Container */}
        <div className="relative">
          {/* Reply Context */}
          {message.replyTo && (
            <div className={`mb-2 p-2 rounded-lg border-l-4 ${
              isOwnMessage ? "bg-amber-500/20 border-amber-500" : "bg-slate-600/50 border-slate-500"
            }`}>
              <p className="text-xs text-slate-400 mb-1">Replying to {message.replyTo.senderName}</p>
              <p className="text-sm text-slate-300 truncate">{message.replyTo.content}</p>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`relative p-3 rounded-2xl ${
              isOwnMessage
                ? "bg-amber-golden text-white rounded-br-md"
                : "bg-slate-700 text-slate-100 rounded-bl-md"
            } ${isConsecutive ? (isOwnMessage ? "rounded-tr-md" : "rounded-tl-md") : ""}`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            
            {/* Message Footer */}
            <div className={`flex items-center justify-end space-x-1 mt-1 ${
              isOwnMessage ? "text-amber-100" : "text-slate-400"
            }`}>
              <span className="text-xs">{formatTime(message.timestamp)}</span>
              {getMessageStatus()}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <span key={index} className="text-xs bg-slate-600/50 px-2 py-1 rounded-full">
                    {reaction.emoji} {reaction.userName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Message Menu */}
          <div className={`absolute top-0 ${isOwnMessage ? "right-full mr-2" : "left-full ml-2"} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            <div className="flex space-x-1">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 hover:text-white transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className={`absolute top-0 ${isOwnMessage ? "right-full mr-2" : "left-full ml-2"} bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10`}>
          <div className="py-1">
            <button
              onClick={handleReply}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 w-full text-left"
            >
              <Reply className="h-4 w-4" />
              <span>Reply</span>
            </button>
            <button
              onClick={handleForward}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 w-full text-left"
            >
              <Forward className="h-4 w-4" />
              <span>Forward</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 w-full text-left"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
            {isOwnMessage && (
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 w-full text-left"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default MessageBubble;
