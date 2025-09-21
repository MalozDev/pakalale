import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  Store,
  Star,
  MapPin,
  Phone,
  Mail,
  Heart,
  ShoppingBag,
  ArrowLeft,
  Search,
  Grid,
  List,
  Share2,
  MessageCircle,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  isAvailable: boolean;
}

interface Shop {
  id: string;
  name: string;
  description: string;
  owner: {
    name: string;
    avatar?: string;
    phone: string;
    email: string;
  };
  location: string;
  address: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  rating: number;
  totalReviews: number;
  totalProducts: number;
  joinedDate: string;
  verified: boolean;
  coverImage: string;
  profileImage: string;
  specialties: string[];
}

function VirtualShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Sample shop data
  const shop: Shop = {
    id: shopId || "1",
    name: "Tech Hub Electronics",
    description:
      "Your one-stop shop for all electronics, gadgets, and tech accessories. We provide genuine products with warranty and excellent customer service.",
    owner: {
      name: "John Mwamba",
      phone: "+260 97 123 4567",
      email: "john@techhub.com",
    },
    location: "Soweto Market",
    address: "Block A, Shop 15, Soweto Market, Lusaka",
    hours: {
      monday: "8:00 AM - 8:00 PM",
      tuesday: "8:00 AM - 8:00 PM",
      wednesday: "8:00 AM - 8:00 PM",
      thursday: "8:00 AM - 8:00 PM",
      friday: "8:00 AM - 9:00 PM",
      saturday: "9:00 AM - 9:00 PM",
      sunday: "10:00 AM - 6:00 PM",
    },
    rating: 4.8,
    totalReviews: 156,
    totalProducts: 45,
    joinedDate: "January 2024",
    verified: true,
    coverImage:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    specialties: ["Electronics", "Mobile Phones", "Accessories", "Gaming"],
  };

  // Sample products data
  const products: Product[] = [
    {
      id: "1",
      name: "iPhone 15 Pro Max 256GB",
      description: "Latest iPhone with advanced camera system and A17 Pro chip",
      price: 8500,
      originalPrice: 9500,
      discount: 11,
      images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
      ],
      category: "Mobile Phones",
      stock: 5,
      rating: 4.9,
      reviews: 23,
      isAvailable: true,
    },
    {
      id: "2",
      name: "Samsung Galaxy S24 Ultra",
      description:
        "Premium Android smartphone with S Pen and advanced AI features",
      price: 7800,
      originalPrice: 8200,
      discount: 5,
      images: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
      ],
      category: "Mobile Phones",
      stock: 3,
      rating: 4.7,
      reviews: 18,
      isAvailable: true,
    },
    {
      id: "3",
      name: "MacBook Air M2 13-inch",
      description: "Ultra-thin laptop with M2 chip and all-day battery life",
      price: 12000,
      images: [
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
      ],
      category: "Laptops",
      stock: 2,
      rating: 4.8,
      reviews: 12,
      isAvailable: true,
    },
    {
      id: "4",
      name: "AirPods Pro 2nd Gen",
      description: "Active noise cancellation with spatial audio",
      price: 450,
      images: [
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400",
      ],
      category: "Accessories",
      stock: 15,
      rating: 4.6,
      reviews: 34,
      isAvailable: true,
    },
    {
      id: "5",
      name: "PlayStation 5 Console",
      description: "Next-gen gaming console with 4K gaming and ray tracing",
      price: 3500,
      images: [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
      ],
      category: "Gaming",
      stock: 0,
      rating: 4.9,
      reviews: 28,
      isAvailable: false,
    },
  ];

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleProductClick = (productId: string) => {
    // Navigate to product detail page
    console.log("Navigate to product:", productId);
  };

  const handleContactShop = () => {
    // Open contact modal or navigate to chat
    console.log("Contact shop");
  };

  const handleMakeDeal = () => {
    // Navigate to deals page
    navigate("/deals");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-dark">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Shop Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8"
        >
          {/* Cover Image */}
          <div className="relative h-48 md:h-64">
            <img
              src={shop.coverImage}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Shop Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-end space-x-4">
                {/* Profile Image */}
                <div className="relative">
                  <img
                    src={shop.profileImage}
                    alt={shop.owner.name}
                    className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  />
                  {shop.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full">
                      <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Shop Details */}
                <div className="flex-1 text-white">
                  <h1 className="text-2xl font-bold mb-1">{shop.name}</h1>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span>{shop.rating}</span>
                      <span className="text-slate-300">
                        ({shop.totalReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Store className="h-4 w-4" />
                      <span>{shop.totalProducts} products</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Description */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  About
                </h3>
                <p className="text-slate-400 mb-4">{shop.description}</p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2">
                  {shop.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-amber-golden/20 text-amber-golden text-sm rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact & Hours */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">Contact</h4>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{shop.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{shop.owner.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{shop.owner.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">Hours</h4>
                  <div className="text-sm text-slate-400 space-y-1">
                    <div>Mon-Thu: {shop.hours.monday}</div>
                    <div>Fri: {shop.hours.friday}</div>
                    <div>Sat: {shop.hours.saturday}</div>
                    <div>Sun: {shop.hours.sunday}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleContactShop}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact</span>
                  </button>
                  <button
                    onClick={handleMakeDeal}
                    className="flex-1 bg-amber-golden hover:bg-amber-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Deal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Products Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100">
              Products ({sortedProducts.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "grid"
                    ? "bg-amber-golden text-white"
                    : "bg-slate-700 text-slate-400 hover:text-slate-300"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "list"
                    ? "bg-amber-golden text-white"
                    : "bg-slate-700 text-slate-400 hover:text-slate-300"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="md:w-40">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors duration-200 cursor-pointer group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount && (
                      <div className="absolute top-2 left-2 bg-red-deep text-white px-2 py-1 rounded-full text-xs font-medium">
                        -{product.discount}%
                      </div>
                    )}
                    {!product.isAvailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-slate-800 text-slate-100 px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-amber-golden transition-colors duration-200">
                      {product.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-slate-100">
                          K{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-slate-500 line-through">
                            K{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-slate-400">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{product.category}</span>
                      <span>{product.stock} in stock</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors duration-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {product.discount && (
                        <div className="absolute -top-1 -right-1 bg-red-deep text-white px-1 py-0.5 rounded-full text-xs">
                          -{product.discount}%
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-100 mb-1 group-hover:text-amber-golden transition-colors duration-200">
                        {product.name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-slate-400">
                            {product.rating}
                          </span>
                        </div>
                        <span className="text-slate-400">
                          {product.category}
                        </span>
                        <span className="text-slate-400">
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-100 mb-1">
                        K{product.price.toLocaleString()}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-slate-500 line-through">
                          K{product.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {sortedProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Store className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-100 mb-2">
                No products found
              </h3>
              <p className="text-slate-400">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default VirtualShopPage;
