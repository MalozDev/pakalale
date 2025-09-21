import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, ShoppingBag, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [selectedAccountType, setSelectedAccountType] = useState<
    "customer" | "shop_owner" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const accountTypes = [
    {
      id: "customer" as const,
      title: "Customer",
      description: "Shop from local businesses",
      icon: ShoppingBag,
      features: ["Browse products", "Make purchases", "Connect with shops"],
      color: "from-teal-dark to-amber-golden",
      bgColor: "bg-teal-dark/10",
      borderColor: "border-teal-dark",
    },
    {
      id: "shop_owner" as const,
      title: "Shop Owner",
      description: "Sell to your community",
      icon: Store,
      features: ["List products", "Manage orders", "Grow your business"],
      color: "from-amber-golden to-red-deep",
      bgColor: "bg-amber-golden/10",
      borderColor: "border-amber-golden",
    },
  ];

  const handleGoogleSignUp = async () => {
    if (!selectedAccountType) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to appropriate dashboard
      if (selectedAccountType === "customer") {
        navigate("/customer-dashboard");
      } else {
        navigate("/shop-dashboard");
      }
    }, 1500);
  };

  const handleSignInRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Store className="h-8 w-8 text-white" />
              </motion.div>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              Join Pakalale
            </h1>
            <p className="text-slate-400">
              Choose your account type and get started
            </p>
          </motion.div>

          {/* Account Type Selection */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-sm font-medium text-slate-300 mb-4">
              Account Type
            </h3>
            <div className="space-y-3">
              {accountTypes.map((type, index) => {
                const IconComponent = type.icon;
                const isSelected = selectedAccountType === type.id;

                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                      isSelected
                        ? `${type.borderColor} ${type.bgColor} shadow-lg`
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700/70"
                    }`}
                    onClick={() => setSelectedAccountType(type.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-3">
                      <motion.div
                        className={`p-2 rounded-full ${
                          isSelected
                            ? `bg-gradient-to-r ${type.color} text-white`
                            : "bg-slate-600 text-slate-300"
                        }`}
                        animate={
                          isSelected
                            ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, 10, -10, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 0.5 }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-medium ${
                              isSelected ? "text-slate-100" : "text-slate-200"
                            }`}
                          >
                            {type.title}
                          </h4>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                              >
                                <CheckCircle className="h-5 w-5 text-primary-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {type.description}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {type.features.map((feature, featureIndex) => (
                            <motion.li
                              key={featureIndex}
                              className="text-xs text-slate-400 flex items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + featureIndex * 0.05 }}
                            >
                              <div className="w-1 h-1 bg-slate-500 rounded-full mr-2"></div>
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Terms Checkbox */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                defaultChecked
              />
              <span className="ml-3 text-sm text-slate-300 leading-relaxed">
                I agree to the{" "}
                <button className="text-primary-500 hover:text-primary-400 underline">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-primary-500 hover:text-primary-400 underline">
                  Privacy Policy
                </button>
              </span>
            </label>
          </motion.div>

          {/* Google Sign Up Button */}
          <motion.button
            onClick={handleGoogleSignUp}
            disabled={isLoading || !selectedAccountType}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg border border-gray-300 flex items-center justify-center space-x-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ scale: selectedAccountType ? 1.02 : 1 }}
            whileTap={{ scale: selectedAccountType ? 0.98 : 1 }}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-900"></div>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
                {selectedAccountType && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                )}
              </>
            )}
          </motion.button>

          {/* Sign In Link */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="text-slate-400">
              Already have an account?{" "}
              <button
                onClick={handleSignInRedirect}
                className="text-primary-500 hover:text-primary-400 font-medium transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;
