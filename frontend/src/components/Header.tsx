import {
  Store,
  Bell,
  Home,
  MapPin,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedSearch from "./AnimatedSearch";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNotificationsClick?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

function Header({ onSearch, activeTab = "home", onTabChange }: HeaderProps) {
  const navigate = useNavigate();
  const navigationItems = [
    { id: "home", label: "Home", icon: Home, count: 0 },
    { id: "locations", label: "Locations", icon: MapPin, count: 0 },
    { id: "deals", label: "Deals", icon: MessageSquare, count: 3 },
    { id: "notifications", label: "Notifications", icon: Bell, count: 5 },
  ];

  return (
    <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      {/* Top Row - Logo, Search, Settings */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between space-x-3">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-gradient-to-r from-amber-golden to-red-deep p-2 rounded-lg">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-100">Pakalale</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <AnimatedSearch onSearch={onSearch} />
          </div>

          {/* Settings */}
          <button
            onClick={() => navigate("/settings")}
            className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200 flex-shrink-0"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bottom Row - Navigation */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-center space-x-4">
          {navigationItems.map((nav) => {
            const IconComponent = nav.icon;
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => {
                  if (nav.id === "locations") {
                    navigate("/locations");
                  } else if (nav.id === "deals") {
                    navigate("/deals");
                  } else if (nav.id === "notifications") {
                    navigate("/notifications");
                  } else {
                    onTabChange?.(nav.id);
                  }
                }}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors duration-200 relative ${
                  isActive
                    ? "text-amber-golden bg-amber-golden/10"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                }`}
              >
                <div className="relative">
                  <IconComponent className="h-5 w-5" />
                  {nav.count > 0 && (
                    <span className="absolute -top-3 -right-4 bg-red-deep text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                      {nav.count > 9 ? "9+" : nav.count}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{nav.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Header;
