import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  Settings,
  Store,
  Home,
  Package,
  ShoppingBag,
  BarChart3,
  DollarSign,
} from "lucide-react";

function ShopNav() {
  return (
    <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Single line on mobile */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="bg-primary-500 p-2 rounded-lg flex-shrink-0">
              <Store className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold text-slate-100 truncate">
              Pakalale Shop
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
            <NavLink
              to="/shop/messages"
              className={({ isActive }) =>
                `p-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                }`
              }
            >
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
            </NavLink>
            <NavLink
              to="/shop/analytics"
              className={({ isActive }) =>
                `p-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                }`
              }
            >
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
            </NavLink>
            <NavLink
              to="/shop/settings"
              className={({ isActive }) =>
                `p-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                }`
              }
            >
              <Settings className="h-4 w-4 md:h-5 md:w-5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 pb-3">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { to: "/shop/overview", label: "Overview", icon: Home },
            { to: "/shop/virtual-shop", label: "Virtual Shop", icon: Store },
            { to: "/shop/products", label: "Products", icon: Package },
            { to: "/shop/orders", label: "Orders", icon: ShoppingBag },
            { to: "/shop/sales", label: "Sales", icon: DollarSign },
            { to: "/shop/feed", label: "Feed", icon: MessageSquare },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                  }`
                }
                end
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ShopNav;

