import { motion } from "framer-motion";
import { BarChart3, TrendingUp, PieChart, Eye, ShoppingBag, DollarSign } from "lucide-react";
import ShopNav from "../components/ShopNav";

function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <ShopNav />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-2 flex items-center"><BarChart3 className="h-5 w-5 mr-2" /> Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-slate-100">12,470</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg"><Eye className="h-6 w-6 text-blue-400" /></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-slate-100">892</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg"><ShoppingBag className="h-6 w-6 text-green-400" /></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-slate-100">K 156,800</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg"><DollarSign className="h-6 w-6 text-yellow-400" /></div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center"><TrendingUp className="h-5 w-5 mr-2" /> Revenue Trend</h3>
            <div className="h-64 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <div className="text-slate-400">Revenue chart placeholder</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center"><PieChart className="h-5 w-5 mr-2" /> Sales by Category</h3>
            <div className="h-64 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <div className="text-slate-400">Category pie chart placeholder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
