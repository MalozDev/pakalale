import { useState } from "react";
import { motion } from "framer-motion";
import ShopNav from "../components/ShopNav";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

interface Transaction {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "completed" | "pending" | "cancelled" | "refunded";
  date: string;
  time: string;
  paymentMethod: string;
  orderId: string;
}

interface SalesData {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingProduct: string;
  revenueGrowth: number;
  transactionGrowth: number;
}

function SalesPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7d");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sample sales data
  const salesData: SalesData = {
    totalRevenue: 15680,
    totalTransactions: 89,
    averageOrderValue: 176,
    conversionRate: 12.5,
    topSellingProduct: "iPhone 15 Pro Max",
    revenueGrowth: 15.2,
    transactionGrowth: 8.7,
  };

  // Sample transactions
  const transactions: Transaction[] = [
    {
      id: "1",
      customer: "John Doe",
      product: "iPhone 15 Pro Max",
      amount: 8500,
      status: "completed",
      date: "2024-01-15",
      time: "2:30 PM",
      paymentMethod: "Mobile Money",
      orderId: "ORD-001",
    },
    {
      id: "2",
      customer: "Jane Smith",
      product: "Samsung Galaxy S24",
      amount: 7800,
      status: "pending",
      date: "2024-01-15",
      time: "1:45 PM",
      paymentMethod: "Bank Transfer",
      orderId: "ORD-002",
    },
    {
      id: "3",
      customer: "Mike Johnson",
      product: "AirPods Pro",
      amount: 450,
      status: "completed",
      date: "2024-01-14",
      time: "4:20 PM",
      paymentMethod: "Cash",
      orderId: "ORD-003",
    },
    {
      id: "4",
      customer: "Sarah Wilson",
      product: "MacBook Air M2",
      amount: 12000,
      status: "cancelled",
      date: "2024-01-14",
      time: "11:15 AM",
      paymentMethod: "Mobile Money",
      orderId: "ORD-004",
    },
    {
      id: "5",
      customer: "David Brown",
      product: "PlayStation 5",
      amount: 3500,
      status: "refunded",
      date: "2024-01-13",
      time: "3:00 PM",
      paymentMethod: "Bank Transfer",
      orderId: "ORD-005",
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
      case "refunded":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "refunded":
        return <Activity className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (statusFilter === "all") return true;
    return transaction.status === statusFilter;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-100">
                K{salesData.totalRevenue.toLocaleString()}
              </p>
              <p className="text-green-400 text-sm flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{salesData.revenueGrowth}%
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-100">
                {salesData.totalTransactions}
              </p>
              <p className="text-green-400 text-sm flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{salesData.transactionGrowth}%
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-slate-100">
                K{salesData.averageOrderValue}
              </p>
              <p className="text-slate-400 text-sm">Per transaction</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-100">
                {salesData.conversionRate}%
              </p>
              <p className="text-slate-400 text-sm">Visitors to buyers</p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">
              Recent Transactions
            </h3>
            <button className="text-primary-500 hover:text-primary-400 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-700">
          {filteredTransactions.slice(0, 5).map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-6 hover:bg-slate-700/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-700 p-2 rounded-lg">
                    {getStatusIcon(transaction.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-100">
                      {transaction.customer}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {transaction.product} • {transaction.orderId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {transaction.date} at {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-100">
                    K{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">
                    {transaction.paymentMethod}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions - Responsive: cards on mobile, table on md+ */}
      {/* Mobile Cards */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 md:hidden">
        <div className="divide-y divide-slate-700">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-slate-100 font-medium truncate">{transaction.customer}</div>
                  <div className="text-slate-400 text-sm truncate">{transaction.product} • {transaction.orderId}</div>
                  <div className="text-slate-500 text-xs mt-1">{transaction.date} at {transaction.time}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-slate-100 font-semibold">K{transaction.amount.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">{transaction.paymentMethod}</div>
                  <span className={`inline-flex items-center mt-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">
            All Transactions ({filteredTransactions.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-700/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-100">{transaction.customer}</div>
                      <div className="text-sm text-slate-400">{transaction.orderId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-100">{transaction.product}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-100">K{transaction.amount.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">{transaction.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-100">{transaction.date}</div>
                    <div className="text-sm text-slate-400">{transaction.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-primary-500 hover:text-primary-400 text-sm font-medium">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Revenue Trend
          </h3>
          <div className="h-64 bg-slate-700/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400">Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Sales by Category
          </h3>
          <div className="h-64 bg-slate-700/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400">Category breakdown chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Top Selling Products
        </h3>
        <div className="space-y-4">
          {[
            { name: "iPhone 15 Pro Max", sales: 12, revenue: 102000 },
            { name: "Samsung Galaxy S24", sales: 8, revenue: 62400 },
            { name: "MacBook Air M2", sales: 3, revenue: 36000 },
            { name: "AirPods Pro", sales: 15, revenue: 6750 },
            { name: "PlayStation 5", sales: 2, revenue: 7000 },
          ].map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-slate-100">{product.name}</p>
                <p className="text-sm text-slate-400">{product.sales} units sold</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-100">K{product.revenue.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      <ShopNav />
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Sales & Analytics</h1>
          <p className="text-slate-400">Track your sales performance and business metrics</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 -mx-4 px-4">
          <div className="flex space-x-1 overflow-x-auto whitespace-nowrap no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "transactions", label: "Transactions", icon: ShoppingBag },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
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

        {/* Content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "transactions" && renderTransactions()}
        {activeTab === "analytics" && renderAnalytics()}
      </div>
    </div>
  );
}

export default SalesPage;