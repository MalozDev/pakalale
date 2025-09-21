import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Star,
  Search,
  Filter,
  ArrowRight,
  Clock,
} from "lucide-react";

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

function LocationsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const locations: Location[] = [
    {
      id: "soweto",
      name: "Soweto Market",
      description:
        "Lusaka's largest and most diverse market with electronics, clothing, and fresh produce",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500",
      shopCount: 45,
      userCount: 1200,
      rating: 4.6,
      specialties: ["Electronics", "Clothing", "Fresh Produce", "Accessories"],
      hours: "6:00 AM - 8:00 PM",
      contact: "+260 97 123 4567",
      coordinates: { lat: -15.4167, lng: 28.2833 },
    },
    {
      id: "kamwala",
      name: "Kamwala Market",
      description:
        "Traditional market known for local crafts, textiles, and household items",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
      shopCount: 32,
      userCount: 850,
      rating: 4.4,
      specialties: ["Crafts", "Textiles", "Household Items", "Local Products"],
      hours: "7:00 AM - 7:00 PM",
      contact: "+260 97 234 5678",
      coordinates: { lat: -15.4, lng: 28.3 },
    },
    {
      id: "city-market",
      name: "City Market",
      description: "Modern shopping center with branded stores and restaurants",
      image: "https://images.unsplash.com/photo-1555529902-4d2b0b8b8b8b?w=500",
      shopCount: 28,
      userCount: 950,
      rating: 4.7,
      specialties: ["Branded Stores", "Restaurants", "Electronics", "Fashion"],
      hours: "9:00 AM - 9:00 PM",
      contact: "+260 97 345 6789",
      coordinates: { lat: -15.42, lng: 28.29 },
    },
    {
      id: "comesa",
      name: "COMESA Market",
      description:
        "International trade hub with regional products and services",
      image: "https://images.unsplash.com/photo-1555529902-4d2b0b8b8b8b?w=500",
      shopCount: 38,
      userCount: 1100,
      rating: 4.5,
      specialties: [
        "International Products",
        "Regional Trade",
        "Services",
        "Wholesale",
      ],
      hours: "8:00 AM - 6:00 PM",
      contact: "+260 97 456 7890",
      coordinates: { lat: -15.41, lng: 28.27 },
    },
    {
      id: "munyaule",
      name: "Munyaule Market",
      description:
        "Local neighborhood market with fresh food and daily essentials",
      image: "https://images.unsplash.com/photo-1555529902-4d2b0b8b8b8b?w=500",
      shopCount: 25,
      userCount: 650,
      rating: 4.3,
      specialties: [
        "Fresh Food",
        "Daily Essentials",
        "Local Services",
        "Groceries",
      ],
      hours: "6:00 AM - 7:00 PM",
      contact: "+260 97 567 8901",
      coordinates: { lat: -15.43, lng: 28.31 },
    },
    {
      id: "kulima-tower",
      name: "Kulima Tower",
      description:
        "Business district with professional services and modern shops",
      image: "https://images.unsplash.com/photo-1555529902-4d2b0b8b8b8b?w=500",
      shopCount: 22,
      userCount: 750,
      rating: 4.8,
      specialties: [
        "Professional Services",
        "Modern Shops",
        "Business Supplies",
        "Technology",
      ],
      hours: "8:00 AM - 8:00 PM",
      contact: "+260 97 678 9012",
      coordinates: { lat: -15.4, lng: 28.28 },
    },
    {
      id: "west-gate",
      name: "West Gate Mall",
      description:
        "Shopping mall with entertainment, dining, and retail stores",
      image: "https://images.unsplash.com/photo-1555529902-4d2b0b8b8b8b?w=500",
      shopCount: 35,
      userCount: 1300,
      rating: 4.6,
      specialties: ["Entertainment", "Dining", "Retail", "Fashion"],
      hours: "10:00 AM - 10:00 PM",
      contact: "+260 97 789 0123",
      coordinates: { lat: -15.44, lng: 28.25 },
    },
    {
      id: "town-center",
      name: "Town Center",
      description:
        "Historic downtown area with traditional shops and cultural sites",
      image: "https://images.unsplash.com/photo-1555529902-4d2b0b8b8b8b?w=500",
      shopCount: 30,
      userCount: 900,
      rating: 4.4,
      specialties: [
        "Traditional Shops",
        "Cultural Sites",
        "Local Crafts",
        "History",
      ],
      hours: "8:00 AM - 6:00 PM",
      contact: "+260 97 890 1234",
      coordinates: { lat: -15.42, lng: 28.32 },
    },
  ];

  const allSpecialties = [
    "all",
    ...Array.from(new Set(locations.flatMap((loc) => loc.specialties))),
  ];

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "all" ||
      location.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  const handleLocationClick = (locationId: string) => {
    navigate(`/location/${locationId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-dark">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Trading Locations
          </h1>
          <p className="text-slate-400">
            Discover shops and services across Lusaka's major trading areas
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent appearance-none"
                >
                  {allSpecialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty === "all" ? "All Specialties" : specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              onClick={() => handleLocationClick(location.id)}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors duration-200 cursor-pointer group"
            >
              {/* Location Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <div className="flex items-center space-x-1 bg-amber-golden/90 text-white px-2 py-1 rounded-full text-sm font-medium">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{location.rating}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-slate-800/90 text-slate-100 px-2 py-1 rounded-full text-sm">
                    {location.shopCount} shops
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-golden transition-colors duration-200">
                    {location.name}
                  </h3>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-golden transition-colors duration-200" />
                </div>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {location.description}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {location.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {location.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                      +{location.specialties.length - 3} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{location.userCount} users</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{location.hours}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLocations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              No locations found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default LocationsPage;
