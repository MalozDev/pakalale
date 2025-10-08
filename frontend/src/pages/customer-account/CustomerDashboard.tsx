import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Header from "../../components/Header";
import NotificationsModal from "../../components/NotificationsModal";
import ChatModal from "../../components/ChatModal";
import SettingsModal from "../../components/SettingsModal";
import WelcomeSection from "../../components/WelcomeSection";
import Feed from "../../components/Feed";
import {
  TrendingUp,
  Star,
  MapPin,
  Store,
  Heart,
  MessageSquare,
} from "lucide-react";

function CustomerDashboard() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Navigate to search results or filter current view
  };

  const trendingShops = [
    {
      id: 1,
      name: "Tech Hub Electronics",
      location: "Soweto Market",
      rating: 4.8,
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200",
    },
    {
      id: 2,
      name: "Fashion Forward",
      location: "Munyaule",
      rating: 4.6,
      category: "Clothing",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200",
    },
    {
      id: 3,
      name: "Fresh Market",
      location: "City Market",
      rating: 4.9,
      category: "Food",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200",
    },
    {
      id: 4,
      name: "Home Solutions",
      location: "Kamwala",
      rating: 4.7,
      category: "Furniture",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-4">
            {/* Welcome Section */}
            <WelcomeSection />

            {/* Feed Section - Now First Priority */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-amber-golden" />
                Community Feed
              </h3>
              <Feed />
            </div>

            {/* Compact Trending Shops */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-amber-golden" />
                Trending Shops
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {trendingShops.map((shop, index) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-dark to-amber-golden rounded-lg flex items-center justify-center">
                        <Store className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-100 text-sm truncate">
                          {shop.name}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {shop.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-yellow-400">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="ml-1 text-xs font-medium">
                            {shop.rating}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {shop.category}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/shop/${shop.id}`)}
                        className="bg-amber-golden hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200"
                      >
                        Visit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case "deals":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Your Deals & Messages
              </h2>
              <p className="text-slate-400">
                Manage your conversations and deals with shop owners
              </p>
            </div>

            {/* Active Deals */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-amber-golden" />
                Active Conversations
              </h3>
              <div className="space-y-3">
                {[
                  {
                    shop: "Tech Hub Electronics",
                    lastMessage: "iPhone 15 Pro Max available for K8,500",
                    time: "2m ago",
                    unread: 2,
                  },
                  {
                    shop: "Fashion Forward",
                    lastMessage: "New arrivals in stock! Check them out",
                    time: "1h ago",
                    unread: 0,
                  },
                  {
                    shop: "Fresh Market",
                    lastMessage: "Your order is ready for pickup",
                    time: "3h ago",
                    unread: 1,
                  },
                ].map((deal, index) => (
                  <motion.div
                    key={deal.shop}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors duration-200 cursor-pointer"
                    onClick={() => setShowChat(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-golden to-red-deep rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-100">
                            {deal.shop}
                          </h4>
                          <p className="text-sm text-slate-400">
                            {deal.lastMessage}
                          </p>
                          <p className="text-xs text-slate-500">{deal.time}</p>
                        </div>
                      </div>
                      {deal.unread > 0 && (
                        <div className="bg-red-deep text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                          {deal.unread}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-teal-dark to-amber-golden rounded-xl p-4 text-white"
              >
                <h4 className="font-semibold mb-2">Start New Deal</h4>
                <p className="text-sm opacity-90 mb-3">
                  Browse shops and start negotiating
                </p>
                <button
                  onClick={() => setActiveTab("locations")}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Browse Shops
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-red-deep to-cream-light rounded-xl p-4 text-white"
              >
                <h4 className="font-semibold mb-2">Deal History</h4>
                <p className="text-sm opacity-90 mb-3">
                  View your completed transactions
                </p>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                  View History
                </button>
              </motion.div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Notifications
              </h2>
              <p className="text-slate-400">
                Stay updated with your latest activities
              </p>
            </div>

            {/* Notification Categories */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-teal-dark to-amber-golden rounded-xl p-4 text-white"
              >
                <h4 className="font-semibold mb-2">Deal Updates</h4>
                <p className="text-sm opacity-90 mb-3">3 new messages</p>
                <button
                  onClick={() => setActiveTab("deals")}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  View Deals
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-red-deep to-cream-light rounded-xl p-4 text-white"
              >
                <h4 className="font-semibold mb-2">Shop Updates</h4>
                <p className="text-sm opacity-90 mb-3">2 new shops</p>
                <button
                  onClick={() => setActiveTab("locations")}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Browse Shops
                </button>
              </motion.div>
            </div>

            {/* Recent Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-amber-golden" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    type: "deal",
                    title: "New Deal Available",
                    message:
                      "Tech Hub Electronics has a new iPhone 15 Pro deal",
                    time: "2m ago",
                    unread: true,
                  },
                  {
                    type: "message",
                    title: "New Message",
                    message: "Fashion Forward replied to your inquiry",
                    time: "15m ago",
                    unread: true,
                  },
                  {
                    type: "shop",
                    title: "New Shop Nearby",
                    message: "Electronics Plus opened in Soweto Market",
                    time: "2h ago",
                    unread: false,
                  },
                  {
                    type: "review",
                    title: "Review Request",
                    message: "Rate your recent purchase from Fresh Market",
                    time: "1d ago",
                    unread: false,
                  },
                ].map((notification, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors duration-200 ${
                      notification.unread ? "bg-slate-700/30" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          notification.type === "deal"
                            ? "bg-amber-golden/20"
                            : notification.type === "message"
                            ? "bg-teal-dark/20"
                            : notification.type === "shop"
                            ? "bg-cream-light/20"
                            : "bg-red-deep/20"
                        }`}
                      >
                        {notification.type === "deal" && (
                          <MessageSquare className="h-5 w-5 text-amber-golden" />
                        )}
                        {notification.type === "message" && (
                          <MessageSquare className="h-5 w-5 text-teal-dark" />
                        )}
                        {notification.type === "shop" && (
                          <Store className="h-5 w-5 text-cream-light" />
                        )}
                        {notification.type === "review" && (
                          <Heart className="h-5 w-5 text-red-deep" />
                        )}
                      </div>
                      <div className="flex-1">
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
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-amber-golden rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case "locations":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Browse Locations
              </h2>
              <p className="text-slate-400">
                Discover shops across Lusaka's major trading areas
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  name: "Soweto Market",
                  shops: 45,
                  specialties: ["Electronics", "Clothing", "Food"],
                  color: "from-teal-dark to-amber-golden",
                },
                {
                  name: "Kamwala",
                  shops: 32,
                  specialties: ["Furniture", "Home Goods", "Services"],
                  color: "from-amber-golden to-red-deep",
                },
                {
                  name: "City Market",
                  shops: 28,
                  specialties: ["Fresh Produce", "Meat", "Spices"],
                  color: "from-red-deep to-cream-light",
                },
                {
                  name: "COMESA",
                  shops: 15,
                  specialties: ["Electronics", "Computers", "Accessories"],
                  color: "from-cream-light to-teal-dark",
                },
                {
                  name: "Munyaule",
                  shops: 22,
                  specialties: ["Clothing", "Shoes", "Accessories"],
                  color: "from-teal-dark to-red-deep",
                },
                {
                  name: "Kulima Tower",
                  shops: 18,
                  specialties: ["Office Supplies", "Services", "Food"],
                  color: "from-amber-golden to-cream-light",
                },
                {
                  name: "West Gate",
                  shops: 25,
                  specialties: ["Electronics", "Clothing", "Home Goods"],
                  color: "from-red-deep to-teal-dark",
                },
                {
                  name: "Town Center",
                  shops: 35,
                  specialties: ["Fashion", "Electronics", "Services"],
                  color: "from-cream-light to-amber-golden",
                },
              ].map((location, index) => (
                <motion.div
                  key={location.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${location.color} rounded-xl flex items-center justify-center`}
                      >
                        <MapPin className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100">
                          {location.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {location.shops} shops available
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {location.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(
                          `/location/${location.name
                            .toLowerCase()
                            .replace(" ", "-")}`
                        )
                      }
                      className="bg-amber-golden hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      Browse
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        onSearch={handleSearch}
        onNotificationsClick={() => setShowNotifications(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div className="p-4">{renderContent()}</div>

      {/* Modals */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <ChatModal isOpen={showChat} onClose={() => setShowChat(false)} />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default CustomerDashboard;
