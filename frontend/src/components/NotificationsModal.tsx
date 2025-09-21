import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  ShoppingBag,
  Star,
  MessageSquare,
  MapPin,
} from "lucide-react";

interface Notification {
  id: string;
  type: "deal" | "message" | "review" | "location";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  action?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "deal",
      title: "New Deal Available",
      message: "Tech Hub Electronics has a new iPhone 15 Pro deal",
      time: "2m ago",
      isRead: false,
      action: "View Deal",
    },
    {
      id: "2",
      type: "message",
      title: "New Message",
      message: "Fashion Forward replied to your inquiry",
      time: "15m ago",
      isRead: false,
      action: "Reply",
    },
    {
      id: "3",
      type: "review",
      title: "Review Request",
      message: "Rate your recent purchase from Fresh Market",
      time: "1h ago",
      isRead: true,
      action: "Rate",
    },
    {
      id: "4",
      type: "location",
      title: "New Shop Nearby",
      message: "Electronics Plus opened in Soweto Market",
      time: "2h ago",
      isRead: true,
      action: "Visit",
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deal":
        return <ShoppingBag className="h-5 w-5 text-amber-golden" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-teal-dark" />;
      case "review":
        return <Star className="h-5 w-5 text-red-deep" />;
      case "location":
        return <MapPin className="h-5 w-5 text-cream-light" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "deal":
        return "bg-amber-golden/10 border-amber-golden/20";
      case "message":
        return "bg-teal-dark/10 border-teal-dark/20";
      case "review":
        return "bg-red-deep/10 border-red-deep/20";
      case "location":
        return "bg-cream-light/10 border-cream-light/20";
      default:
        return "bg-slate-700/50 border-slate-600";
    }
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
            className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-amber-golden" />
                <h3 className="text-lg font-semibold text-slate-100">
                  Notifications
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[60vh]">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors duration-200 ${
                    !notification.isRead ? "bg-slate-700/30" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg border ${getNotificationBg(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-100 text-sm">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mt-1">
                        {notification.message}
                      </p>
                      {notification.action && (
                        <button className="mt-2 text-amber-golden hover:text-amber-400 text-sm font-medium transition-colors duration-200">
                          {notification.action}
                        </button>
                      )}
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-amber-golden rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
              <button className="w-full text-center text-amber-golden hover:text-amber-400 text-sm font-medium transition-colors duration-200">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationsModal;
