import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Settings,
  Store,
  Search,
  Home,
  Plus,
  TrendingUp,
  ShoppingBag,
  Users,
  Star,
  Eye,
  Edit,
  BarChart3,
  Package,
  Calendar,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Feed from "../components/Feed";

function ShopDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const shopStats = {
    totalViews: 1247,
    totalOrders: 89,
    totalRevenue: 15680,
    rating: 4.8,
    totalReviews: 23,
  };

  const recentOrders = [
    {
      id: 1,
      customer: "John Doe",
      product: "iPhone 15 Pro",
      amount: 850,
      status: "pending",
      time: "2h ago",
    },
    {
      id: 2,
      customer: "Jane Smith",
      product: "Samsung Galaxy S24",
      amount: 750,
      status: "confirmed",
      time: "4h ago",
    },
    {
      id: 3,
      customer: "Mike Johnson",
      product: "AirPods Pro",
      amount: 250,
      status: "completed",
      time: "6h ago",
    },
  ];

  const products = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      price: 1200,
      stock: 5,
      category: "Electronics",
      views: 45,
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      price: 800,
      stock: 8,
      category: "Electronics",
      views: 32,
    },
    {
      id: 3,
      name: "AirPods Pro",
      price: 250,
      stock: 12,
      category: "Accessories",
      views: 28,
    },
    {
      id: 4,
      name: "MacBook Pro M3",
      price: 2000,
      stock: 2,
      category: "Computers",
      views: 67,
    },
  ];

  const recentMessages = [
    {
      id: 1,
      customer: "John Doe",
      message: "Is the iPhone 15 Pro available?",
      time: "1h ago",
      unread: true,
    },
    {
      id: 2,
      customer: "Jane Smith",
      message: "What are your business hours?",
      time: "3h ago",
      unread: false,
    },
    {
      id: 3,
      customer: "Mike Johnson",
      message: "Do you offer delivery?",
      time: "5h ago",
      unread: true,
    },
  ];

  // const _feedPosts = [
  //   {
  //     id: 1,
  //     content: "New iPhone 15 Pro Max just arrived! Best prices in town!",
  //     likes: 24,
  //     comments: 8,
  //     time: "2h ago",
  //   },
  //   {
  //     id: 2,
  //     content: "Special weekend discount on all Samsung products!",
  //     likes: 18,
  //     comments: 5,
  //     time: "1d ago",
  //   },
  // ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white"
            >
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.firstName}! 🏪
              </h2>
              <p className="text-primary-100">
                Manage your shop and grow your business
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-100">
                      {shopStats.totalViews}
                    </p>
                    <p className="text-sm text-slate-400">Total Views</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-100">
                      {shopStats.totalOrders}
                    </p>
                    <p className="text-sm text-slate-400">Total Orders</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-100">
                      K{shopStats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-400">Revenue</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-100">
                      {shopStats.rating}
                    </p>
                    <p className="text-sm text-slate-400">
                      Rating ({shopStats.totalReviews})
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Orders */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-primary-500" />
                Recent Orders
              </h3>
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-100">
                          {order.customer}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {order.product}
                        </p>
                        <p className="text-xs text-slate-500">{order.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-100">
                          K{order.amount}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : order.status === "confirmed"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case "products":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">
                Product Management
              </h2>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {product.category}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-primary-500 font-medium">
                          K{product.price}
                        </span>
                        <span className="text-slate-400">
                          Stock: {product.stock}
                        </span>
                        <span className="text-slate-400">
                          Views: {product.views}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                        <Package className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-100">
              Order Management
            </h2>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border-b border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-100">
                        {order.customer}
                      </h4>
                      <p className="text-sm text-slate-400">{order.product}</p>
                      <p className="text-xs text-slate-500">{order.time}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-slate-100">
                        K{order.amount}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : order.status === "confirmed"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {order.status}
                      </span>
                      <button className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200">
                        Update
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-100">
              Customer Messages
            </h2>

            <div className="space-y-4">
              {recentMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-slate-800 rounded-lg p-4 border border-slate-700 ${
                    message.unread
                      ? "border-primary-500/50 bg-primary-500/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary-500 p-2 rounded-full">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-100">
                          {message.customer}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500">
                            {message.time}
                          </span>
                          {message.unread && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-300 mt-1">{message.message}</p>
                      <button className="mt-2 text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors duration-200">
                        Reply
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-100">Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary-500" />
                  Performance Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Shop Views</span>
                    <span className="text-slate-100 font-medium">
                      +12% this week
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Orders</span>
                    <span className="text-slate-100 font-medium">
                      +8% this week
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Revenue</span>
                    <span className="text-slate-100 font-medium">
                      +15% this week
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-300">
                      New order received
                    </span>
                    <span className="text-xs text-slate-500 ml-auto">
                      2h ago
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-300">
                      Product viewed 15 times
                    </span>
                    <span className="text-xs text-slate-500 ml-auto">
                      4h ago
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-slate-300">
                      New review received
                    </span>
                    <span className="text-xs text-slate-500 ml-auto">
                      6h ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "feed":
        return <Feed />;

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-100">
              Shop Settings
            </h2>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-medium text-slate-100 mb-4">
                Shop Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Tech Hub Electronics"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Location
                  </label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-100">Soweto Market</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Your trusted electronics store with the latest gadgets and best prices in town."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                    Save Changes
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-100">
                Pakalale Shop
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, orders..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab("messages")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeTab === "messages"
                    ? "bg-primary-500 text-white"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeTab === "analytics"
                    ? "bg-primary-500 text-white"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                }`}
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeTab === "settings"
                    ? "bg-primary-500 text-white"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: Home },
              { id: "products", label: "Products", icon: Package },
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "feed", label: "Feed", icon: MessageSquare },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary-500 text-white"
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">{renderContent()}</div>
    </div>
  );
}

export default ShopDashboard;
