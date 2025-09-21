import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Store,
  ShoppingBag,
  Users,
  MapPin,
  ArrowRight,
  Star,
} from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Store,
      title: "Local Shops",
      description: "Discover shops in Soweto, Kamwala, City Market, and more",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: ShoppingBag,
      title: "Easy Shopping",
      description: "Browse products, compare prices, and connect with vendors",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Users,
      title: "Community",
      description: "Join the community feed for real-time market updates",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const locations = [
    "Soweto Market",
    "Kamwala",
    "City Market",
    "COMESA",
    "Munyaule",
    "Kulima Tower",
    "West Gate",
    "Town Center",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-100">Pakalale</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-300 hover:text-slate-100 transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-slate-100 mb-6">
            Your Local
            <span className="text-primary-500"> Trading</span>
            <br />
            Platform
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Connect with local shops across Lusaka's major trading areas. Find
            products, compare prices, and support your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => navigate("/signup")}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
            <motion.button
              onClick={() => navigate("/login")}
              className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-slate-100 text-center mb-12">
            Why Choose Pakalale?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center hover:border-slate-600 transition-colors duration-200"
                >
                  <div
                    className={`bg-gradient-to-r ${feature.color} p-3 rounded-full w-fit mx-auto mb-4`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Locations Section */}
      <div className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-slate-100 text-center mb-8">
            Available Locations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locations.map((location, index) => (
              <motion.div
                key={location}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-center hover:border-primary-500/50 transition-colors duration-200"
              >
                <MapPin className="h-6 w-6 text-primary-500 mx-auto mb-2" />
                <p className="text-slate-100 font-medium">{location}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">
                200+
              </div>
              <div className="text-slate-400">Local Shops</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">8</div>
              <div className="text-slate-400">Trading Areas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">
                1000+
              </div>
              <div className="text-slate-400">Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">
                4.8
              </div>
              <div className="text-slate-400 flex items-center justify-center">
                <Star className="h-4 w-4 fill-current text-primary-500 mr-1" />
                Rating
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-300 mb-8">
            Join thousands of customers and shop owners already using Pakalale
          </p>
          <motion.button
            onClick={() => navigate("/signup")}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Create Account</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 border-t border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-100">Pakalale</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2024 Pakalale. Connecting Lusaka's local businesses.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
