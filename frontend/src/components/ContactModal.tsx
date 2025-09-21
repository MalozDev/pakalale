import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  MapPin,
  Phone,
  Mail,
  Star,
  Store,
  MessageSquare,
  ShoppingBag,
  Calendar,
} from "lucide-react";

interface ContactInfo {
  id: string;
  name: string;
  role: "customer" | "shop_owner";
  avatar?: string;
  location?: string;
  phone?: string;
  email?: string;
  rating?: number;
  shopName?: string;
  joinDate?: string;
  totalPosts?: number;
  verified?: boolean;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactInfo;
  onMessageClick?: () => void;
  onDealClick?: () => void;
}

function ContactModal({
  isOpen,
  onClose,
  contact,
  onMessageClick,
  onDealClick,
}: ContactModalProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "shop_owner":
        return "bg-amber-golden/20 text-amber-golden border-amber-golden/30";
      case "customer":
        return "bg-teal-dark/20 text-teal-dark border-teal-dark/30";
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "shop_owner":
        return <Store className="h-4 w-4" />;
      case "customer":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

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
              <h3 className="text-lg font-semibold text-slate-100">
                Contact Info
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contact Content */}
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-golden to-red-deep rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">
                    {contact.name.charAt(0)}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-slate-100 mb-1">
                  {contact.name}
                </h4>
                <div
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border text-sm ${getRoleColor(
                    contact.role
                  )}`}
                >
                  {getRoleIcon(contact.role)}
                  <span className="capitalize">
                    {contact.role.replace("_", " ")}
                  </span>
                </div>
                {contact.verified && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs ml-2">
                    <span>✓</span>
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                {contact.shopName && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Store className="h-5 w-5 text-amber-golden" />
                    <div>
                      <p className="text-sm text-slate-400">Shop</p>
                      <p className="text-slate-100 font-medium">
                        {contact.shopName}
                      </p>
                    </div>
                  </div>
                )}

                {contact.location && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-teal-dark" />
                    <div>
                      <p className="text-sm text-slate-400">Location</p>
                      <p className="text-slate-100 font-medium">
                        {contact.location}
                      </p>
                    </div>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Phone className="h-5 w-5 text-cream-light" />
                    <div>
                      <p className="text-sm text-slate-400">Phone</p>
                      <p className="text-slate-100 font-medium">
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                )}

                {contact.email && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Mail className="h-5 w-5 text-red-deep" />
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="text-slate-100 font-medium">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                )}

                {contact.rating && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <div>
                      <p className="text-sm text-slate-400">Rating</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-100 font-medium">
                          {contact.rating}
                        </span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(contact.rating || 0)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {contact.joinDate && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Member since</p>
                      <p className="text-slate-100 font-medium">
                        {contact.joinDate}
                      </p>
                    </div>
                  </div>
                )}

                {contact.totalPosts && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Posts</p>
                      <p className="text-slate-100 font-medium">
                        {contact.totalPosts} posts
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-slate-700 space-y-3">
              {contact.role === "shop_owner" && onDealClick && (
                <button
                  onClick={onDealClick}
                  className="w-full bg-amber-golden hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Make Deal</span>
                </button>
              )}

              <button
                onClick={onMessageClick}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Send Message</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ContactModal;
