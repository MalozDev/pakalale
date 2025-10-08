import { useState } from "react";
import { motion } from "framer-motion";
import ShopNav from "../../components/ShopNav";
import { ShoppingBag, Filter, CheckCircle, XCircle, Clock } from "lucide-react";

interface Order {
  id: number;
  customer: string;
  product: string;
  amount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  time: string;
}

const ordersSeed: Order[] = [
  { id: 1, customer: "John Doe", product: "iPhone 15 Pro", amount: 850, status: "pending", time: "2h ago" },
  { id: 2, customer: "Jane Smith", product: "Samsung Galaxy S24", amount: 750, status: "confirmed", time: "4h ago" },
  { id: 3, customer: "Mike Johnson", product: "AirPods Pro", amount: 250, status: "completed", time: "6h ago" },
  { id: 4, customer: "Sarah Lee", product: "MacBook Air M2", amount: 1200, status: "cancelled", time: "1d ago" },
];

function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusPill = (status: Order["status"]) => {
    const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border";
    if (status === "completed") return `${base} bg-green-500/20 text-green-400 border-green-500/30`;
    if (status === "confirmed") return `${base} bg-blue-500/20 text-blue-400 border-blue-500/30`;
    if (status === "pending") return `${base} bg-yellow-500/20 text-yellow-400 border-yellow-500/30`;
    if (status === "cancelled") return `${base} bg-red-500/20 text-red-400 border-red-500/30`;
    return base;
  };

  const getIcon = (status: Order["status"]) => {
    if (status === "completed") return <CheckCircle className="h-4 w-4" />;
    if (status === "confirmed") return <CheckCircle className="h-4 w-4" />;
    if (status === "pending") return <Clock className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const orders = ordersSeed.filter(o => (statusFilter === "all" ? true : o.status === statusFilter));

  return (
    <div className="min-h-screen bg-slate-900">
      <ShopNav />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center"><ShoppingBag className="h-5 w-5 mr-2" /> Orders</h1>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 border-b border-slate-700 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-100">{order.customer}</h4>
                  <p className="text-sm text-slate-400">{order.product}</p>
                  <p className="text-xs text-slate-500">{order.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-100">K{order.amount}</p>
                  <span className={getStatusPill(order.status)}>
                    {getIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
