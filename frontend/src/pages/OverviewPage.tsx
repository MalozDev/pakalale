import { motion } from "framer-motion";
import ShopNav from "../components/ShopNav";
import { useAuthStore } from "../store/authStore";
import {
  Eye,
  ShoppingBag,
  TrendingUp,
  Star,
  User,
  Store,
} from "lucide-react";

interface ShopStats {
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  totalReviews: number;
}

interface RecentOrder {
  id: number;
  customer: string;
  product: string;
  amount: number;
  status: "completed" | "pending" | "cancelled";
  time: string;
}

const OverviewPage = () => {
  const { user } = useAuthStore();
  const shopStats: ShopStats = {
    totalViews: 1247,
    totalOrders: 89,
    totalRevenue: 15680,
    rating: 4.8,
    totalReviews: 23,
  };

  const recentOrders: RecentOrder[] = [
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
      status: "completed",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ShopNav />
      <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <User className="h-6 w-6 mr-2" />
          Welcome back, {user?.firstName}!
          <Store className="h-6 w-6 ml-2" />
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
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
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
  </div>
  );
};

export default OverviewPage;
