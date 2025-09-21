import { motion, AnimatePresence } from "framer-motion";
import { X, User, Bell, Shield, Moon, LogOut, HelpCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

function SettingsModal({ isOpen, onClose, onLogout }: SettingsModalProps) {
  const { user } = useAuthStore();

  const settingsSections = [
    {
      title: "Account",
      icon: User,
      items: [
        { label: "Profile", value: `${user?.firstName} ${user?.lastName}` },
        { label: "Email", value: user?.email },
        { label: "Location", value: user?.location || "Not set" },
        {
          label: "Account Type",
          value: user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "Customer",
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { label: "Push Notifications", value: "Enabled" },
        { label: "Email Notifications", value: "Enabled" },
        { label: "Deal Alerts", value: "Enabled" },
        { label: "New Messages", value: "Enabled" },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        { label: "Profile Visibility", value: "Public" },
        { label: "Location Sharing", value: "Enabled" },
        { label: "Data Usage", value: "Optimized" },
        { label: "Two-Factor Auth", value: "Disabled" },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100">Settings</h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Settings Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {settingsSections.map((section, sectionIndex) => {
                const IconComponent = section.icon;
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                    className="p-4 border-b border-slate-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <IconComponent className="h-5 w-5 text-amber-golden" />
                      <h4 className="font-medium text-slate-100">
                        {section.title}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-slate-300 text-sm">
                            {item.label}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              {/* Quick Actions */}
              <div className="p-4 space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200">
                  <HelpCircle className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-100">Help & Support</span>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200">
                  <Moon className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-100">Dark Mode</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 p-3 bg-red-deep/20 hover:bg-red-deep/30 border border-red-deep/30 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 text-red-deep" />
                  <span className="text-red-deep font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SettingsModal;
