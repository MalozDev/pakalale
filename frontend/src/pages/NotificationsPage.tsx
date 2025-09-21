import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, Trash2, Filter } from "lucide-react";

interface Notification {
  id: string;
  type: "deal" | "message" | "review" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  action?: string;
}

function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Sample notifications data
  const notifications: Notification[] = [
    {
      id: "1",
      type: "deal",
      title: "New Deal Request",
      message: "John Mwamba wants to negotiate on Samsung Galaxy S23",
      time: "2 minutes ago",
      isRead: false,
      action: "View Deal",
    },
    {
      id: "2",
      type: "message",
      title: "New Message",
      message: "Sarah Chanda sent you a message about the handbag",
      time: "15 minutes ago",
      isRead: false,
      action: "Reply",
    },
    {
      id: "3",
      type: "review",
      title: "New Review",
      message: "You received a 5-star review from Peter Banda",
      time: "1 hour ago",
      isRead: true,
      action: "View Review",
    },
    {
      id: "4",
      type: "system",
      title: "Welcome to Pakalale!",
      message: "Your account has been successfully created",
      time: "2 days ago",
      isRead: true,
    },
    {
      id: "5",
      type: "deal",
      title: "Deal Completed",
      message: "Your deal with Fashion Forward has been completed",
      time: "3 days ago",
      isRead: true,
      action: "View Details",
    },
    {
      id: "6",
      type: "message",
      title: "Message from Tech Hub",
      message: "Your order is ready for pickup",
      time: "4 hours ago",
      isRead: false,
      action: "View Message",
    },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.isRead;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deal":
        return "🛒";
      case "message":
        return "💬";
      case "review":
        return "⭐";
      case "system":
        return "🔔";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "deal":
        return "bg-amber-golden/20 border-amber-golden/30";
      case "message":
        return "bg-blue-500/20 border-blue-500/30";
      case "review":
        return "bg-yellow-500/20 border-yellow-500/30";
      case "system":
        return "bg-slate-500/20 border-slate-500/30";
      default:
        return "bg-slate-500/20 border-slate-500/30";
    }
  };

  const deleteNotification = (id: string) => {
    // In a real app, this would delete the notification
    console.log("Delete notification:", id);
  };

  const markAllAsRead = () => {
    // In a real app, this would mark all notifications as read
    console.log("Mark all as read");
  };

  const handleNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case "deal":
        // Navigate to deals page
        navigate("/deals");
        break;
      case "message":
        // Navigate to deals page (messages are part of deals)
        navigate("/deals");
        break;
      case "review":
        // Navigate to shop profile or reviews section
        // For now, just go to home
        navigate("/");
        break;
      case "system":
        // System notifications don't have actions
        break;
      default:
        break;
    }
  };

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
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-amber-golden" />
              <h1 className="text-base sm:text-lg font-bold text-slate-100">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="bg-red-deep text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={markAllAsRead}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                title="Mark all as read"
              >
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-4 mb-4 sm:mb-6"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === "all"
                    ? "bg-amber-golden text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === "unread"
                    ? "bg-amber-golden text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">
                No notifications
              </h3>
              <p className="text-slate-400">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  notification.action && handleNotificationAction(notification)
                }
                className={`bg-slate-800 rounded-xl border p-3 sm:p-4 transition-colors duration-200 ${
                  notification.isRead
                    ? "border-slate-700"
                    : "border-amber-golden/50 bg-amber-golden/5"
                } ${
                  notification.action
                    ? "cursor-pointer hover:bg-slate-700/50"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Notification Icon */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3
                        className={`font-semibold text-sm sm:text-base ${
                          notification.isRead
                            ? "text-slate-300"
                            : "text-slate-100"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-amber-golden rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>

                    <p className="text-slate-400 text-xs sm:text-sm mb-2 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {notification.time}
                      </span>

                      <div className="flex items-center space-x-2">
                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationAction(notification);
                            }}
                            className="text-amber-golden hover:text-amber-600 text-xs sm:text-sm font-medium transition-colors duration-200"
                          >
                            {notification.action}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
