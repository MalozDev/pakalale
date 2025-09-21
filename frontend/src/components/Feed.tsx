import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Image, MapPin, Tag, TrendingUp, Star } from "lucide-react";
import FeedPost from "./FeedPost";
import { useAuthStore } from "../store/authStore";

interface FeedPost {
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
}

function Feed() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filter, setFilter] = useState<"all" | "promotions" | "nearby">("all");

  // Sample feed data
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    {
      id: "1",
      author: {
        id: "shop1",
        name: "Tech Hub Electronics",
        role: "shop_owner",
        shopName: "Tech Hub Electronics",
        location: "Soweto Market",
        rating: 4.8,
      },
      content:
        "🔥 NEW ARRIVAL! iPhone 15 Pro Max 256GB in Space Black! Best prices in Lusaka! 📱✨\n\n✅ Genuine Apple products\n✅ 1-year warranty\n✅ Free screen protector\n✅ Same-day delivery available\n\nVisit us at Soweto Market or call for delivery!",
      images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
      ],
      location: "Soweto Market",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      isPromotion: true,
      product: {
        id: "prod1",
        name: "iPhone 15 Pro Max 256GB",
        price: 8500,
        originalPrice: 9500,
        discount: 11,
        image:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200",
        shopId: "shop1",
      },
    },
    {
      id: "2",
      author: {
        id: "user1",
        name: "John Mwamba",
        role: "customer",
        location: "Kamwala",
      },
      content:
        "Just got my new laptop from Tech Hub Electronics! Amazing service and great prices. Highly recommend! 🎉\n\n#Pakalale #TechHub #HappyCustomer",
      images: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
      ],
      location: "Kamwala",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      likes: 12,
      comments: 5,
      shares: 1,
      isLiked: true,
    },
    {
      id: "3",
      author: {
        id: "shop2",
        name: "Fashion Forward",
        role: "shop_owner",
        shopName: "Fashion Forward",
        location: "Munyaule",
        rating: 4.6,
      },
      content:
        "Summer Collection is here! 🌞👗\n\nBeautiful dresses, trendy tops, and stylish accessories for the season. Come check out our latest arrivals!\n\n📍 Munyaule Market\n⏰ Open 8AM - 6PM daily",
      images: [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500",
      ],
      location: "Munyaule",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      likes: 18,
      comments: 7,
      shares: 4,
      isLiked: false,
      isPromotion: true,
    },
    {
      id: "4",
      author: {
        id: "user2",
        name: "Sarah Chanda",
        role: "customer",
        location: "City Market",
      },
      content:
        "Looking for a good electronics shop in City Market. Any recommendations? Need to buy a new phone charger and some accessories. Thanks! 🙏",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      likes: 6,
      comments: 12,
      shares: 0,
      isLiked: false,
    },
    {
      id: "5",
      author: {
        id: "shop3",
        name: "Fresh Market",
        role: "shop_owner",
        shopName: "Fresh Market",
        location: "City Market",
        rating: 4.9,
      },
      content:
        "Fresh vegetables and fruits delivered daily! 🥬🍎\n\nToday's specials:\n• Fresh tomatoes - K15/kg\n• Green vegetables - K10/bunch\n• Mangoes - K8/kg\n• Bananas - K12/kg\n\nOrder now for same-day delivery!",
      images: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
      ],
      location: "City Market",
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
      likes: 31,
      comments: 15,
      shares: 8,
      isLiked: true,
      isPromotion: true,
    },
  ]);

  const handleLike = (postId: string) => {
    setFeedPosts((posts) =>
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    setFeedPosts((posts) =>
      posts.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );
  };

  const handleShare = (postId: string) => {
    setFeedPosts((posts) =>
      posts.map((post) =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post
      )
    );
  };

  const handleMakeDeal = (productId: string, shopId: string) => {
    // Find the post with the matching product and shop
    const post = feedPosts.find(
      (p) => p.product?.id === productId && p.author.id === shopId
    );

    if (!post || !post.product) return;

    // Create a new deal and navigate to chat
    const newDealId = Date.now().toString();
    navigate(`/chat/${newDealId}`, {
      state: {
        deal: {
          id: newDealId,
          shopId: shopId,
          shopName: post.author.shopName || post.author.name,
          shopOwner: post.author.name,
          shopAvatar: post.author.avatar,
          productId: productId,
          productName: post.product.name,
          productImage: post.product.image,
          status: "pending",
          message:
            "I'm interested in this product. Can we discuss the details?",
          timestamp: new Date().toISOString(),
          lastMessage:
            "I'm interested in this product. Can we discuss the details?",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          location: post.author.location || "Location",
          isActive: true,
        },
        shopId: shopId,
        shopName: post.author.shopName || post.author.name,
        shopOwner: post.author.name,
        shopAvatar: post.author.avatar,
        productId: productId,
        productName: post.product.name,
        productImage: post.product.image,
      },
    });
  };

  const handleContactShop = (shopId: string) => {
    // This will be handled by the FeedPost component's contact modal
    console.log("Contacting shop:", shopId);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: FeedPost = {
      id: Date.now().toString(),
      author: {
        id: user?.id || "current_user",
        name: user?.firstName + " " + user?.lastName || "Current User",
        role: (user?.role === "admin" ? "customer" : user?.role) || "customer",
        location: user?.location,
      },
      content: newPostContent,
      images: newPostImages,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };

    setFeedPosts([newPost, ...feedPosts]);
    setNewPostContent("");
    setNewPostImages([]);
    setShowCreatePost(false);
  };

  const filteredPosts = feedPosts.filter((post) => {
    switch (filter) {
      case "promotions":
        return post.isPromotion;
      case "nearby":
        return post.location === user?.location;
      default:
        return true;
    }
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl border border-slate-700 p-4"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-golden to-red-deep rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-600 transition-colors duration-200"
          >
            What's on your mind, {user?.firstName}?
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
              <Image className="h-5 w-5" />
              <span className="text-sm">Photo</span>
            </button>
            <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Location</span>
            </button>
            <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
              <Tag className="h-5 w-5" />
              <span className="text-sm">Tag</span>
            </button>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="bg-amber-golden hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Post
          </button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1 border border-slate-700"
      >
        {[
          { id: "all", label: "All Posts", icon: TrendingUp },
          { id: "promotions", label: "Promotions", icon: Star },
          { id: "nearby", label: "Nearby", icon: MapPin },
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === tab.id
                  ? "bg-amber-golden text-white"
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FeedPost
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onMakeDeal={handleMakeDeal}
              onContactShop={handleContactShop}
            />
          </motion.div>
        ))}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreatePost(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">
                Create Post
              </h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
                    <Image className="h-5 w-5" />
                    <span className="text-sm">Photo</span>
                  </button>
                  <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm">Location</span>
                  </button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="bg-amber-golden hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Feed;
