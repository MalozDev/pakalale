import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Filter, Search } from "lucide-react";
import type { Deal } from "../../types/deals";

function DealsListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sample deals data
  const deals: Deal[] = [
    {
      id: "1",
      shopId: "shop1",
      shopName: "Tech Hub Electronics",
      shopOwner: "John Mwamba",
      shopAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      productId: "prod1",
      productName: "Samsung Galaxy S23",
      productImage:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200",
      status: "negotiating",
      initialPrice: 4500,
      finalPrice: 4200,
      quantity: 1,
      message: "Interested in this phone. Can we negotiate the price?",
      timestamp: "2024-01-15T10:30:00Z",
      lastMessage: "I can offer K4,200. What do you think?",
      lastMessageTime: "2024-01-15T14:20:00Z",
      unreadCount: 2,
      location: "Soweto Market",
      isActive: true,
    },
    {
      id: "2",
      shopId: "shop2",
      shopName: "Fashion Forward",
      shopOwner: "Sarah Chanda",
      shopAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
      productId: "prod2",
      productName: "Designer Handbag",
      productImage:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200",
      status: "confirmed",
      initialPrice: 800,
      finalPrice: 750,
      quantity: 1,
      message: "Love this bag! Is it still available?",
      timestamp: "2024-01-14T16:45:00Z",
      lastMessage: "Great! I'll have it ready for pickup tomorrow.",
      lastMessageTime: "2024-01-14T17:30:00Z",
      unreadCount: 0,
      location: "City Market",
      isActive: true,
    },
    {
      id: "3",
      shopId: "shop3",
      shopName: "Fresh Produce Co",
      shopOwner: "Peter Banda",
      shopAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      productId: "prod3",
      productName: "Fresh Vegetables Bundle",
      productImage:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200",
      status: "completed",
      initialPrice: 150,
      finalPrice: 150,
      quantity: 2,
      message: "Need fresh vegetables for the week.",
      timestamp: "2024-01-13T09:15:00Z",
      lastMessage: "Thank you for your purchase!",
      lastMessageTime: "2024-01-13T11:00:00Z",
      unreadCount: 0,
      location: "Kamwala Market",
      isActive: false,
    },
  ];

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || deal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      case "negotiating":
        return "text-blue-400 bg-blue-400/20";
      case "confirmed":
        return "text-green-400 bg-green-400/20";
      case "completed":
        return "text-slate-400 bg-slate-400/20";
      case "cancelled":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-slate-400 bg-slate-400/20";
    }
  };

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

  const handleDealClick = (deal: Deal) => {
    navigate(`/chat/${deal.id}`, {
      state: {
        deal,
        shopId: deal.shopId,
        shopName: deal.shopName,
        shopOwner: deal.shopOwner,
        shopAvatar: deal.shopAvatar,
        productId: deal.productId,
        productName: deal.productName,
        productImage: deal.productImage,
      },
    });
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
            <h1 className="text-base sm:text-lg font-bold text-slate-100">
              My Deals
            </h1>
            <button className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-4 mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent text-sm appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Deals List */}
        <div className="space-y-4">
          {filteredDeals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">
                No deals found
              </h3>
              <p className="text-slate-400">
                Start a conversation with a shop owner to create your first deal
              </p>
            </motion.div>
          ) : (
            filteredDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleDealClick(deal)}
                className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-4 hover:border-slate-600 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  {/* Shop Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        deal.shopAvatar ||
                        `https://ui-avatars.com/api/?name=${deal.shopOwner}&background=random`
                      }
                      alt={deal.shopOwner}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                    {deal.isActive && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-slate-800"></div>
                    )}
                  </div>

                  {/* Deal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-slate-100 text-sm sm:text-lg truncate">
                        {deal.shopName}
                      </h3>
                      <span
                        className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(
                          deal.status
                        )}`}
                      >
                        {deal.status.charAt(0).toUpperCase() +
                          deal.status.slice(1)}
                      </span>
                    </div>

                    {deal.productName && (
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                        <img
                          src={deal.productImage}
                          alt={deal.productName}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-300 text-xs sm:text-sm font-medium truncate">
                            {deal.productName}
                          </p>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                            {deal.finalPrice && (
                              <span className="text-amber-golden font-semibold text-xs sm:text-sm">
                                K{deal.finalPrice.toLocaleString()}
                              </span>
                            )}
                            {deal.initialPrice &&
                              deal.finalPrice &&
                              deal.initialPrice !== deal.finalPrice && (
                                <span className="text-slate-500 text-xs line-through">
                                  K{deal.initialPrice.toLocaleString()}
                                </span>
                              )}
                            <span className="text-slate-400 text-xs">
                              Qty: {deal.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-slate-400 text-xs sm:text-sm mb-2 line-clamp-2 leading-relaxed">
                      {deal.lastMessage}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {formatTime(deal.lastMessageTime)}
                      </span>
                      {deal.unreadCount > 0 && (
                        <span className="bg-red-deep text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center min-w-[16px] sm:min-w-[20px]">
                          {deal.unreadCount}
                        </span>
                      )}
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

export default DealsListPage;
