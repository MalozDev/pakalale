import { motion } from "framer-motion";
import { Store, TrendingUp, Users, MapPin } from "lucide-react";
import { useAuthStore } from "../store/authStore";

function WelcomeSection() {
  const { user } = useAuthStore();

  const stats = [
    {
      icon: Store,
      value: "200+",
      label: "Shops",
      color: "text-teal-dark",
      bgColor: "bg-teal-dark/10",
    },
    {
      icon: MapPin,
      value: "8",
      label: "Locations",
      color: "text-cream-light",
      bgColor: "bg-cream-light/10",
    },
    {
      icon: Users,
      value: "5K+",
      label: "Users",
      color: "text-amber-golden",
      bgColor: "bg-amber-golden/10",
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Satisfied",
      color: "text-red-deep",
      bgColor: "bg-red-deep/10",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Compact Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-golden to-red-deep rounded-lg p-4 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-1">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-amber-100 text-sm">
            Discover amazing local shops and find what you need
          </p>
        </div>
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </motion.div>

      {/* Compact Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors duration-200"
            >
              <div className="text-center">
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} mx-auto mb-2 w-fit`}
                >
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-slate-100">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default WelcomeSection;
