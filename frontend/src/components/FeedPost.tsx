import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageSquare,
  Share,
  ThumbsUp,
  ShoppingBag,
  MapPin,
  Clock,
  User,
  Store,
  Star,
  CheckCircle,
  Phone,
} from "lucide-react";
import ContactModal from "./ContactModal";

interface FeedPostProps {
  post: {
    id: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
      role: "customer" | "shop_owner";
      shopName?: string;
      location?: string;
      rating?: number;
    };
    content: string;
    images?: string[];
    location?: string;
    timestamp: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    isPromotion?: boolean;
    product?: {
      id: string;
      name: string;
      price: number;
      originalPrice?: number;
      discount?: number;
      image: string;
      shopId: string;
    };
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onMakeDeal: (productId: string, shopId: string) => void;
  onContactShop: (shopId: string) => void;
}

function FeedPost({
  post,
  onLike,
  onComment,
  onShare,
  onMakeDeal,
  onContactShop,
}: FeedPostProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [comments, setComments] = useState([
    {
      id: "1",
      author: "John Doe",
      content: "Great deal! Is this still available?",
      timestamp: "2h ago",
      avatar: "blue",
    },
    {
      id: "2",
      author: "Jane Smith",
      content: "I'm interested! Can you deliver to Kamwala?",
      timestamp: "1h ago",
      avatar: "green",
    },
  ]);

  const handleLike = () => {
    onLike(post.id);
  };

  const handleComment = () => {
    setShowComments(!showComments);
    onComment(post.id);
  };

  const handlePostComment = () => {
    if (newComment.trim()) {
      // Add new comment to the list
      const newCommentObj = {
        id: Date.now().toString(),
        author: "You",
        content: newComment.trim(),
        timestamp: "Just now",
        avatar: "primary",
      };
      setComments((prev) => [...prev, newCommentObj]);
      setNewComment("");
    }
  };

  const handleShare = () => {
    onShare(post.id);
  };

  const handleMakeDeal = () => {
    if (post.product) {
      onMakeDeal(post.product.id, post.author.id);
    }
  };

  const handleContactShop = () => {
    setShowContactModal(true);
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - postTime.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return postTime.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
    >
      {/* Post Header */}
      <div className="p-3 sm:p-4 border-b border-slate-700">
        <div className="flex items-start space-x-2 sm:space-x-3">
          {/* Avatar - Clickable */}
          <button
            onClick={() => {
              if (post.author.role === "shop_owner") {
                window.location.href = `/shop/${post.author.id}`;
              }
            }}
            className="relative hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-golden to-red-deep rounded-full flex items-center justify-center">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-sm sm:text-lg">
                  {post.author.name.charAt(0)}
                </span>
              )}
            </div>
            {post.author.role === "shop_owner" && (
              <div className="absolute -top-0 -left-0 bg-blue-500 p-1 rounded-full">
                <Store className="h-3 w-3 text-white" />
              </div>
            )}
          </button>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 flex-wrap">
              <button
                onClick={() => {
                  if (post.author.role === "shop_owner") {
                    window.location.href = `/shop/${post.author.id}`;
                  }
                }}
                className="hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
              >
                <h3 className="font-semibold text-slate-100 truncate text-sm sm:text-base">
                  {post.author.name}
                </h3>
              </button>
              {post.author.role === "shop_owner" && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className="px-1.5 py-0.5 bg-amber-golden/20 text-amber-golden text-xs rounded-full">
                    Shop
                  </span>
                  <CheckCircle className="h-3 w-3 text-green-400" />
                </div>
              )}
              {post.isPromotion && (
                <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full flex-shrink-0">
                  Promo
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 text-xs sm:text-sm text-slate-400 flex-wrap">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{formatTime(post.timestamp)}</span>
              </div>
              {post.location && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{post.location}</span>
                  </div>
                </>
              )}
            </div>

            {/* Shop Rating for Shop Owners */}
            {post.author.role === "shop_owner" && post.author.rating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current flex-shrink-0" />
                <span className="text-xs text-slate-400 truncate">
                  {post.author.rating} ({post.author.shopName})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-3 sm:p-4">
        <p className="text-slate-100 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
          {post.content}
        </p>

        {/* Product Card (if it's a product post) */}
        {post.product && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 mb-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-slate-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-100">
                  {post.product.name}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg font-bold text-primary-500">
                    K{post.product.price}
                  </span>
                  {post.product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      K{post.product.originalPrice}
                    </span>
                  )}
                  {post.product.discount && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      -{post.product.discount}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            {post.images.length === 1 ? (
              <div className="relative">
                <img
                  src={post.images[0]}
                  alt="Post image"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={post.images[imageIndex]}
                  alt="Post image"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {post.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImageIndex(
                          imageIndex > 0
                            ? imageIndex - 1
                            : (post.images?.length || 1) - 1
                        )
                      }
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setImageIndex(
                          imageIndex < (post.images?.length || 1) - 1
                            ? imageIndex + 1
                            : 0
                        )
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                    >
                      →
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                      {post.images?.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            index === imageIndex ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-4">
            {post.likes > 0 && (
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-4 w-4 text-blue-400" />
                <span>{post.likes}</span>
              </div>
            )}
            {post.comments > 0 && <span>{post.comments} comments</span>}
            {post.shares > 0 && <span>{post.shares} shares</span>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-3 sm:px-4 py-2 border-t border-slate-700">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 flex-1 justify-center min-w-0 ${
              post.isLiked
                ? "text-red-400 hover:bg-red-500/10"
                : "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            }`}
          >
            <Heart
              className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${
                post.isLiked ? "fill-current" : ""
              }`}
            />
            <span className="text-xs sm:text-sm font-medium truncate">
              Like
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleComment}
            className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors duration-200 flex-1 justify-center min-w-0"
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Comment
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-colors duration-200 flex-1 justify-center min-w-0"
          >
            <Share className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Share
            </span>
          </button>

          {/* Contact Button - Always Visible */}
          <button
            onClick={handleContactShop}
            className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-slate-400 hover:text-teal-dark hover:bg-teal-dark/10 rounded-lg transition-colors duration-200 flex-1 justify-center min-w-0"
            title="Contact"
          >
            <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Contact
            </span>
          </button>

          {/* Deal Button - Only for Shop Owners with Products */}
          {post.author.role === "shop_owner" && post.product && (
            <button
              onClick={handleMakeDeal}
              className="bg-amber-golden hover:bg-amber-600 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-1 flex-1 justify-center min-w-0"
            >
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">
                Deal
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-700"
          >
            <div className="p-3 sm:p-4">
              {/* Comment Input */}
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 flex items-center space-x-2 min-w-0">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base min-w-0"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim()}
                    className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex-shrink-0"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start space-x-2 sm:space-x-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        comment.avatar === "blue"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : comment.avatar === "green"
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : "bg-gradient-to-r from-primary-500 to-primary-600"
                      }`}
                    >
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-slate-100 text-sm">
                            {comment.author}
                          </span>
                          <span className="text-xs text-slate-500">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contact={{
          id: post.author.id,
          name: post.author.name,
          role: post.author.role,
          location: post.author.location,
          shopName: post.author.shopName,
          rating: post.author.rating,
          phone: "+260 97 123 4567",
          email: `${post.author.name
            .toLowerCase()
            .replace(" ", ".")}@pakalale.com`,
          joinDate: "Jan 2024",
          totalPosts: 15,
          verified: true,
        }}
        onMessageClick={() => {
          setShowContactModal(false);
          onContactShop(post.author.id);
        }}
        onDealClick={() => {
          setShowContactModal(false);
          handleMakeDeal();
        }}
      />
    </motion.div>
  );
}

export default FeedPost;
