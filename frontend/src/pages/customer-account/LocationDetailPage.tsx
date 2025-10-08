import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Store,
  Star,
  Search,
  Grid,
  List,
  ArrowLeft,
  Clock,
  Users,
  Phone,
  Heart,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";

interface Shop {
  id: string;
  name: string;
  description: string;
  owner: {
    name: string;
    avatar?: string;
  };
  category: string;
  rating: number;
  reviews: number;
  products: number;
  image: string;
  verified: boolean;
  specialties: string[];
  hours: string;
  contact: string;
}

interface Location {
  id: string;
  name: string;
  description: string;
  image: string;
  shopCount: number;
  userCount: number;
  rating: number;
  specialties: string[];
  hours: string;
  contact: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

function LocationDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Sample location data
  const location: Location = {
    id: locationId || "soweto",
    name: "Soweto Market",
    description:
      "Lusaka's largest and most diverse market with electronics, clothing, and fresh produce. A bustling hub of commerce and culture.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    shopCount: 45,
    userCount: 1200,
    rating: 4.6,
    specialties: ["Electronics", "Clothing", "Fresh Produce", "Accessories"],
    hours: "6:00 AM - 8:00 PM",
    contact: "+260 97 123 4567",
    coordinates: { lat: -15.4167, lng: 28.2833 },
  };

  // Sample shops data
  const shops: Shop[] = [
    {
      id: "1",
      name: "Tech Hub Electronics",
      description:
        "Your one-stop shop for all electronics, gadgets, and tech accessories",
      owner: {
        name: "John Mwamba",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      },
      category: "Electronics",
      rating: 4.8,
      reviews: 156,
      products: 45,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
      verified: true,
      specialties: ["Mobile Phones", "Laptops", "Accessories"],
      hours: "8:00 AM - 8:00 PM",
      contact: "+260 97 123 4567",
    },
    {
      id: "2",
      name: "Fashion Forward",
      description: "Trendy clothing and accessories for men and women",
      owner: {
        name: "Sarah Chanda",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      },
      category: "Clothing",
      rating: 4.5,
      reviews: 89,
      products: 120,
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
      verified: true,
      specialties: ["Women's Fashion", "Men's Fashion", "Accessories"],
      hours: "9:00 AM - 7:00 PM",
      contact: "+260 97 234 5678",
    },
    {
      id: "3",
      name: "Fresh Market Produce",
      description: "Fresh fruits, vegetables, and local produce daily",
      owner: {
        name: "Peter Banda",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      },
      category: "Fresh Produce",
      rating: 4.7,
      reviews: 203,
      products: 80,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      verified: true,
      specialties: ["Fresh Fruits", "Vegetables", "Local Produce"],
      hours: "6:00 AM - 6:00 PM",
      contact: "+260 97 345 6789",
    },
    {
      id: "4",
      name: "Gadget World",
      description: "Latest gadgets, gaming equipment, and tech accessories",
      owner: {
        name: "Mike Tembo",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      },
      category: "Electronics",
      rating: 4.6,
      reviews: 134,
      products: 65,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
      verified: false,
      specialties: ["Gaming", "Gadgets", "Tech Accessories"],
      hours: "8:30 AM - 8:30 PM",
      contact: "+260 97 456 7890",
    },
    {
      id: "5",
      name: "Style Studio",
      description: "Professional styling services and fashion consulting",
      owner: {
        name: "Grace Mwila",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      },
      category: "Clothing",
      rating: 4.9,
      reviews: 67,
      products: 35,
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
      verified: true,
      specialties: ["Styling Services", "Fashion Consulting", "Custom Design"],
      hours: "10:00 AM - 6:00 PM",
      contact: "+260 97 567 8901",
    },
    {
      id: "6",
      name: "Organic Corner",
      description: "Organic and natural products for healthy living",
      owner: {
        name: "David Phiri",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      },
      category: "Fresh Produce",
      rating: 4.4,
      reviews: 92,
      products: 50,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      verified: true,
      specialties: ["Organic Products", "Natural Foods", "Health Supplements"],
      hours: "7:00 AM - 7:00 PM",
      contact: "+260 97 678 9012",
    },
  ];

  const categories = [
    "all",
    ...Array.from(new Set(shops.map((shop) => shop.category))),
  ];

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || shop.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedShops = [...filteredShops].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviews - a.reviews;
      case "products":
        return b.products - a.products;
      default:
        return b.rating - a.rating;
    }
  });

  const handleShopClick = (shopId: string) => {
    navigate(`/shop/${shopId}`);
  };

  const handleContactShop = (shopId: string) => {
    // Open contact modal or navigate to chat
    console.log("Contact shop:", shopId);
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
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Location Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8"
        >
          {/* Location Image */}
          <div className="relative h-48 md:h-64">
            <img
              src={location.image}
              alt={location.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Location Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-3xl font-bold text-white mb-2">
                {location.name}
              </h1>
              <div className="flex items-center space-x-6 text-white">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>{location.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Store className="h-4 w-4" />
                  <span>{location.shopCount} shops</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{location.userCount} users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Description */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  About
                </h3>
                <p className="text-slate-400 mb-4">{location.description}</p>

                {/* Specialties */}
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {location.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-amber-golden/20 text-amber-golden text-sm rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">
                    Location Info
                  </h4>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{location.hours}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{location.contact}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Lusaka, Zambia</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shops Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Shops Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100">
              Shops ({sortedShops.length})
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
                    placeholder="Search shops..."
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
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="products">Most Products</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shops Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedShops.map((shop, index) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors duration-200 group"
                >
                  {/* Shop Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center space-x-1 bg-amber-golden/90 text-white px-2 py-1 rounded-full text-sm font-medium">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{shop.rating}</span>
                      </div>
                    </div>
                    {shop.verified && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Verified
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shop Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-golden transition-colors duration-200">
                        {shop.name}
                      </h3>
                    </div>

                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {shop.description}
                    </p>

                    {/* Owner */}
                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={shop.owner.avatar}
                        alt={shop.owner.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-slate-400">
                        {shop.owner.name}
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {shop.specialties.slice(0, 2).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {shop.specialties.length > 2 && (
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                          +{shop.specialties.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                      <span>{shop.reviews} reviews</span>
                      <span>{shop.products} products</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShopClick(shop.id)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 py-2 px-3 rounded-lg font-medium transition-colors duration-200 text-sm"
                      >
                        Visit Shop
                      </button>
                      <button
                        onClick={() => handleContactShop(shop.id)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors duration-200"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleMakeDeal}
                        className="p-2 bg-amber-golden hover:bg-amber-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedShops.map((shop, index) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {shop.verified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 p-1 rounded-full">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-100 group-hover:text-amber-golden transition-colors duration-200">
                          {shop.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-400">
                            {shop.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mb-2 line-clamp-1">
                        {shop.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span>{shop.category}</span>
                        <span>{shop.reviews} reviews</span>
                        <span>{shop.products} products</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleContactShop(shop.id)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors duration-200"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleMakeDeal}
                        className="p-2 bg-amber-golden hover:bg-amber-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleShopClick(shop.id)}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-100 py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
                      >
                        Visit
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {sortedShops.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Store className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-100 mb-2">
                No shops found
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

export default LocationDetailPage;
