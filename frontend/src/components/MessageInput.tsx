import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Mic,
  X,
  Camera,
  FileText
} from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string, type?: "text" | "image" | "file") => void;
  onSendFile?: (file: File) => void;
  onSendImage?: (file: File) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isRecording?: boolean;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

function MessageInput({
  onSendMessage,
  onSendFile,
  onSendImage,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  replyTo,
  onCancelReply,
  placeholder = "Type a message...",
  disabled = false
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        onSendImage?.(file);
      } else {
        onSendFile?.(file);
      }
    }
  };


  const handleAttachmentClick = (type: "file" | "image" | "camera") => {
    setShowAttachmentMenu(false);
    if (type === "file") {
      fileInputRef.current?.click();
    } else if (type === "image") {
      imageInputRef.current?.click();
    } else if (type === "camera") {
      // Handle camera access
      console.log("Camera access requested");
    }
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-4">
      {/* Reply Context */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 bg-slate-700 rounded-lg border-l-4 border-amber-golden"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-1">Replying to {replyTo.senderName}</p>
                <p className="text-sm text-slate-300 truncate">{replyTo.content}</p>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex items-center space-x-3">
        {/* Attachment Button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            disabled={disabled}
            className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Attachment Menu */}
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10"
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleAttachmentClick("image")}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 w-full text-left rounded"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Photo</span>
                  </button>
                  <button
                    onClick={() => handleAttachmentClick("camera")}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 w-full text-left rounded"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Camera</span>
                  </button>
                  <button
                    onClick={() => handleAttachmentClick("file")}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 w-full text-left rounded"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Document</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-full text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent text-sm resize-none h-[44px] max-h-[120px] leading-5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              height: "44px",
              overflow: "hidden",
            }}
          />
        </div>


        {/* Send/Record Button */}
        {message.trim() || isRecording ? (
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="p-2 bg-amber-golden hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled}
            className={`p-2 rounded-full transition-colors ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-300">Recording...</span>
              <button
                onClick={onStopRecording}
                className="ml-auto px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
              >
                Stop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MessageInput;
