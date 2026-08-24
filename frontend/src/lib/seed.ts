import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pakalale";

// ── Schemas (inline to avoid model registration issues) ──

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatar: { type: String },
    role: { type: String, enum: ["customer", "shop_owner", "admin"], default: "customer" },
    isVerified: { type: Boolean, default: false },
    location: { type: String },
    phone: { type: String },
    bio: { type: String },
  },
  { timestamps: true }
);

const ShopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    locationId: { type: String },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      whatsapp: { type: String },
    },
    hours: { type: mongoose.Schema.Types.Mixed, default: {} },
    coverImage: { type: String },
    profileImage: { type: String },
    images: [{ type: String }],
    specialties: [{ type: String }],
    rating: { type: Number, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    discount: { type: Number },
    images: [{ type: String }],
    category: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const FeedPostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    images: [{ type: String }],
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    locationId: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      authorName: { type: String },
      content: { type: String },
      createdAt: { type: Date, default: Date.now },
    }],
    shares: { type: Number, default: 0 },
    isPromotion: { type: Boolean, default: false },
    product: {
      name: { type: String },
      price: { type: Number },
      originalPrice: { type: Number },
      discount: { type: Number },
      image: { type: String },
      shopId: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "Cash" },
    notes: { type: String },
  },
  { timestamps: true }
);

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    shopCount: { type: Number, default: 0 },
    userCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    specialties: [{ type: String }],
    hours: { type: String, default: "" },
    contact: { type: String, default: "" },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

const ChatMessageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["customer", "shop_owner"], required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "file", "deal_update", "system"], default: "text" },
    isRead: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replyTo: {
      messageId: { type: mongoose.Schema.Types.ObjectId },
      content: { type: String },
      senderName: { type: String },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const ChatSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["deal", "general"], default: "general" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    dealInfo: {
      dealId: { type: mongoose.Schema.Types.ObjectId },
      productName: { type: String },
      productImage: { type: String },
      initialPrice: { type: Number },
      finalPrice: { type: Number },
      status: {
        type: String,
        enum: ["pending", "negotiating", "confirmed", "completed", "cancelled"],
        default: "pending",
      },
    },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    lastMessageTime: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deal", "message", "review", "shop", "order", "system"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// ── Seed Data ──

const LOCATIONS = [
  {
    name: "Soweto Market",
    slug: "soweto",
    description: "Lusaka's largest and most diverse open-air market, famous for electronics, clothing, and fresh produce from across Zambia.",
    shopCount: 0,
    userCount: 0,
    rating: 4.6,
    specialties: ["Electronics", "Clothing", "Fresh Produce", "Accessories"],
    hours: "6:00 AM - 8:00 PM",
    contact: "+260 211 221234",
    coordinates: { lat: -15.4167, lng: 28.2833 },
  },
  {
    name: "Kamwala Market",
    slug: "kamwala",
    description: "A bustling traditional market known for handcrafts, textiles, and affordable household items. The heart of local commerce.",
    shopCount: 0,
    userCount: 0,
    rating: 4.4,
    specialties: ["Crafts", "Textiles", "Household Items", "Fresh Food"],
    hours: "7:00 AM - 7:00 PM",
    contact: "+260 211 232345",
    coordinates: { lat: -15.3833, lng: 28.3167 },
  },
  {
    name: "City Market",
    slug: "city-market",
    description: "Modern shopping center in the heart of Lusaka with branded stores, restaurants, and electronics outlets.",
    shopCount: 0,
    userCount: 0,
    rating: 4.7,
    specialties: ["Branded Stores", "Restaurants", "Electronics", "Fashion"],
    hours: "9:00 AM - 9:00 PM",
    contact: "+260 211 243456",
    coordinates: { lat: -15.4167, lng: 28.2833 },
  },
  {
    name: "COMESA Market",
    slug: "comesa",
    description: "International trade hub at the COMESA grounds. Great for bulk purchases and cross-border products.",
    shopCount: 0,
    userCount: 0,
    rating: 4.5,
    specialties: ["International Products", "Regional Trade", "Bulk Goods"],
    hours: "8:00 AM - 6:00 PM",
    contact: "+260 211 254567",
    coordinates: { lat: -15.4500, lng: 28.3000 },
  },
  {
    name: "Munyaule Market",
    slug: "munyaule",
    description: "Neighborhood market popular for daily essentials, fresh food, and affordable clothing. Great for families.",
    shopCount: 0,
    userCount: 0,
    rating: 4.3,
    specialties: ["Fresh Food", "Daily Essentials", "Clothing", "Shoes"],
    hours: "6:00 AM - 7:00 PM",
    contact: "+260 211 265678",
    coordinates: { lat: -15.3667, lng: 28.3333 },
  },
];

const SHOP_DATA = [
  {
    name: "TechHub Zambia",
    description: "Lusaka's premier electronics destination. We stock genuine phones, laptops, tablets and accessories with full manufacturer warranty. Free delivery within Lusaka for orders over K2,000.",
    locationId: "soweto",
    specialties: ["Electronics", "Mobile Phones", "Laptops", "Accessories"],
    rating: 4.8,
    totalReviews: 156,
    contact: { phone: "+260 97 123 4567", email: "info@techhubzm.com", whatsapp: "+260 97 123 4567" },
    hours: {
      monday: { open: "08:00", close: "19:00", closed: false },
      tuesday: { open: "08:00", close: "19:00", closed: false },
      wednesday: { open: "08:00", close: "19:00", closed: false },
      thursday: { open: "08:00", close: "19:00", closed: false },
      friday: { open: "08:00", close: "20:00", closed: false },
      saturday: { open: "09:00", close: "20:00", closed: false },
      sunday: { open: "10:00", close: "17:00", closed: false },
    },
  },
  {
    name: "FreshBasket Market",
    description: "Farm-fresh vegetables, fruits and local produce sourced directly from Zambian farmers. Open daily with the freshest seasonal selection. Wholesale and retail available.",
    locationId: "city-market",
    specialties: ["Fresh Vegetables", "Fruits", "Grains", "Dairy"],
    rating: 4.9,
    totalReviews: 203,
    contact: { phone: "+260 96 234 5678", email: "hello@freshbasket.co.zm", whatsapp: "+260 96 234 5678" },
    hours: {
      monday: { open: "05:00", close: "18:00", closed: false },
      tuesday: { open: "05:00", close: "18:00", closed: false },
      wednesday: { open: "05:00", close: "18:00", closed: false },
      thursday: { open: "05:00", close: "18:00", closed: false },
      friday: { open: "05:00", close: "18:00", closed: false },
      saturday: { open: "05:00", close: "16:00", closed: false },
      sunday: { open: "06:00", close: "14:00", closed: false },
    },
  },
  {
    name: "StyleVault Fashion",
    description: "Trendy fashion for men and women. From everyday casual to formal wear, we have the latest styles from local and international brands. Alterations available.",
    locationId: "munyaule",
    specialties: ["Fashion", "Clothing", "Shoes", "Accessories"],
    rating: 4.6,
    totalReviews: 89,
    contact: { phone: "+260 95 345 6789", email: "style@stylevault.co.zm", whatsapp: "+260 95 345 6789" },
    hours: {
      monday: { open: "09:00", close: "19:00", closed: false },
      tuesday: { open: "09:00", close: "19:00", closed: false },
      wednesday: { open: "09:00", close: "19:00", closed: false },
      thursday: { open: "09:00", close: "19:00", closed: false },
      friday: { open: "09:00", close: "20:00", closed: false },
      saturday: { open: "09:00", close: "20:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: false },
    },
  },
  {
    name: "HomeComfort Plus",
    description: "One-stop shop for furniture, home décor and appliances. We offer quality pieces at competitive prices. Delivery and assembly services available across Lusaka.",
    locationId: "kamwala",
    specialties: ["Furniture", "Home Decor", "Appliances", "Kitchenware"],
    rating: 4.7,
    totalReviews: 124,
    contact: { phone: "+260 97 456 7890", email: "info@homecomfort.co.zm", whatsapp: "+260 97 456 7890" },
    hours: {
      monday: { open: "08:00", close: "18:00", closed: false },
      tuesday: { open: "08:00", close: "18:00", closed: false },
      wednesday: { open: "08:00", close: "18:00", closed: false },
      thursday: { open: "08:00", close: "18:00", closed: false },
      friday: { open: "08:00", close: "19:00", closed: false },
      saturday: { open: "09:00", close: "19:00", closed: false },
      sunday: { open: "10:00", close: "15:00", closed: false },
    },
  },
  {
    name: "GameZone Zambia",
    description: "Your gaming paradise! Consoles, games, gaming accessories and PCs. We also do repairs and custom builds. Trade-in your old gear for discounts.",
    locationId: "comesa",
    specialties: ["Gaming", "Consoles", "PC Gaming", "Accessories"],
    rating: 4.5,
    totalReviews: 67,
    contact: { phone: "+260 96 567 8901", email: "play@gamezone.co.zm", whatsapp: "+260 96 567 8901" },
    hours: {
      monday: { open: "10:00", close: "21:00", closed: false },
      tuesday: { open: "10:00", close: "21:00", closed: false },
      wednesday: { open: "10:00", close: "21:00", closed: false },
      thursday: { open: "10:00", close: "21:00", closed: false },
      friday: { open: "10:00", close: "22:00", closed: false },
      saturday: { open: "09:00", close: "22:00", closed: false },
      sunday: { open: "10:00", close: "18:00", closed: false },
    },
  },
  {
    name: "PharmaCare Health",
    description: "Lusaka's trusted pharmacy and health store. Genuine medicines, vitamins, baby care and wellness products. Licensed pharmacists on site. Free health consultations every Saturday.",
    locationId: "city-market",
    specialties: ["Pharmacy", "Health", "Baby Care", "Wellness"],
    rating: 4.9,
    totalReviews: 312,
    contact: { phone: "+260 97 888 1234", email: "info@pharmacare.co.zm", whatsapp: "+260 97 888 1234" },
    hours: {
      monday: { open: "07:00", close: "21:00", closed: false },
      tuesday: { open: "07:00", close: "21:00", closed: false },
      wednesday: { open: "07:00", close: "21:00", closed: false },
      thursday: { open: "07:00", close: "21:00", closed: false },
      friday: { open: "07:00", close: "22:00", closed: false },
      saturday: { open: "08:00", close: "20:00", closed: false },
      sunday: { open: "08:00", close: "18:00", closed: false },
    },
  },
];

const PRODUCTS_DATA = [
  // TechHub Zambia products
  { name: "Samsung Galaxy A15", description: "6.5\" Super AMOLED display, 50MP camera, 5000mAh battery. Great value smartphone.", price: 2800, originalPrice: 3200, discount: 12, stock: 24, category: "Mobile Phones", rating: 4.6, reviews: 45, tags: ["samsung", "smartphone", "budget"], shopIndex: 0 },
  { name: "iPhone 15 Pro Max", description: "Apple's flagship with A17 Pro chip, titanium design, 48MP camera system.", price: 18500, originalPrice: 20000, discount: 7, stock: 8, category: "Mobile Phones", rating: 4.9, reviews: 23, tags: ["apple", "iphone", "flagship"], shopIndex: 0 },
  { name: "Tecno Spark 20 Pro", description: "108MP camera, 6.78\" display, MediaTek Helio G99. Perfect for photography.", price: 3200, stock: 30, category: "Mobile Phones", rating: 4.4, reviews: 67, tags: ["tecno", "smartphone", "camera"], shopIndex: 0 },
  { name: "HP Laptop 15s", description: "Intel Core i5, 8GB RAM, 512GB SSD, 15.6\" FHD display. Ideal for work and study.", price: 12000, stock: 6, category: "Laptops", rating: 4.7, reviews: 18, tags: ["hp", "laptop", "work"], shopIndex: 0 },
  { name: "JBL Tune 520BT Headphones", description: "Wireless on-ear headphones with 57H battery life and JBL Pure Bass sound.", price: 650, originalPrice: 850, discount: 23, stock: 40, category: "Accessories", rating: 4.5, reviews: 89, tags: ["jbl", "headphones", "wireless"], shopIndex: 0 },
  { name: "Samsung 43\" Smart TV", description: "Crystal UHD 4K display, Tizen OS, HDR10+. Stunning picture quality.", price: 8500, stock: 4, category: "Electronics", rating: 4.8, reviews: 12, tags: ["samsung", "tv", "smart"], shopIndex: 0 },
  { name: "Anker PowerCore 20000", description: "20000mAh power bank with dual USB ports. Charges 3 devices simultaneously.", price: 450, originalPrice: 550, discount: 18, stock: 55, category: "Accessories", rating: 4.6, reviews: 134, tags: ["anker", "power-bank", "charger"], shopIndex: 0 },
  { name: "MacBook Air M2 13\"", description: "Apple M2 chip, 8GB RAM, 256GB SSD. Ultra-thin and powerful for professionals.", price: 22000, stock: 3, category: "Laptops", rating: 4.9, reviews: 8, tags: ["apple", "macbook", "laptop"], shopIndex: 0 },

  // FreshBasket Market products
  { name: "Fresh Tomatoes (5kg)", description: "Locally grown ripe tomatoes, perfect for cooking and salads. Sourced from Lusaka farms.", price: 85, stock: 100, category: "Vegetables", rating: 4.8, reviews: 234, tags: ["tomatoes", "fresh", "vegetables"], shopIndex: 1 },
  { name: "Green Vegetables Bundle", description: "Mixed leafy greens including rape, cimbuya and nightshade. Washed and ready to cook.", price: 25, stock: 80, category: "Vegetables", rating: 4.7, reviews: 189, tags: ["greens", "vegetables", "fresh"], shopIndex: 1 },
  { name: "Avocados (dozen)", description: "Ripe Hass avocados, creamy and perfect for toast, guacamole or salads.", price: 120, originalPrice: 150, discount: 20, stock: 60, category: "Fruits", rating: 4.9, reviews: 156, tags: ["avocado", "fruit", "fresh"], shopIndex: 1 },
  { name: "Mealie Meal 25kg", description: "Premium white mealie meal from Zambia's finest maize. Perfect for nshima.", price: 280, stock: 200, category: "Grains", rating: 4.6, reviews: 345, tags: ["mealie-meal", "nshima", "grain"], shopIndex: 1 },
  { name: "Fresh Mangoes (3kg)", description: "Sweet Zambian mangoes, in season. Perfect for snacking, juice, or desserts.", price: 65, stock: 45, category: "Fruits", rating: 4.8, reviews: 98, tags: ["mango", "fruit", "seasonal"], shopIndex: 1 },
  { name: "Free-Range Eggs (30)", description: "Farm fresh free-range eggs from local poultry farms. Rich in protein.", price: 95, stock: 70, category: "Dairy & Eggs", rating: 4.7, reviews: 167, tags: ["eggs", "fresh", "protein"], shopIndex: 1 },
  { name: "Bananas (bunch)", description: "Sweet ripe bananas, perfect for breakfast or snacking. Locally sourced.", price: 35, stock: 120, category: "Fruits", rating: 4.5, reviews: 201, tags: ["banana", "fruit", "fresh"], shopIndex: 1 },

  // StyleVault Fashion products
  { name: "Men's Chino Trousers", description: "Classic fit chino trousers in navy, khaki or olive. Stretch cotton for comfort.", price: 350, originalPrice: 450, discount: 22, stock: 35, category: "Men's Wear", rating: 4.5, reviews: 78, tags: ["men", "trousers", "casual"], shopIndex: 2 },
  { name: "Women's Floral Dress", description: "Beautiful floral print sundress, perfect for any occasion. Available in multiple sizes.", price: 480, stock: 20, category: "Women's Wear", rating: 4.7, reviews: 56, tags: ["women", "dress", "fashion"], shopIndex: 2 },
  { name: "Men's Leather Shoes", description: "Genuine leather formal shoes, handcrafted for durability and style.", price: 650, originalPrice: 800, discount: 19, stock: 15, category: "Shoes", rating: 4.6, reviews: 43, tags: ["men", "shoes", "leather"], shopIndex: 2 },
  { name: "Women's Handbag", description: "Premium leather handbag with multiple compartments. Stylish and functional.", price: 550, stock: 25, category: "Accessories", rating: 4.8, reviews: 34, tags: ["women", "bag", "leather"], shopIndex: 2 },
  { name: "Denim Jacket", description: "Classic denim jacket, unisex style. Perfect for the cooler evenings.", price: 420, stock: 18, category: "Outerwear", rating: 4.4, reviews: 29, tags: ["denim", "jacket", "unisex"], shopIndex: 2 },

  // HomeComfort Plus products
  { name: "3-Seater Sofa", description: "Comfortable fabric sofa with solid wood frame. Available in grey, beige and navy.", price: 4500, stock: 8, category: "Living Room", rating: 4.7, reviews: 34, tags: ["sofa", "furniture", "living-room"], shopIndex: 3 },
  { name: "Queen Size Bed Frame", description: "Solid wood bed frame with slat base. Includes headboard. Mattress sold separately.", price: 3200, stock: 5, category: "Bedroom", rating: 4.8, reviews: 22, tags: ["bed", "furniture", "bedroom"], shopIndex: 3 },
  { name: "Dining Table Set (4 chairs)", description: "Wooden dining table with 4 matching chairs. Seats 4 comfortably.", price: 5800, stock: 3, category: "Dining", rating: 4.6, reviews: 18, tags: ["dining", "table", "chairs"], shopIndex: 3 },
  { name: "Microwave Oven 20L", description: "Panasonic 20L microwave with timer and multiple power levels. Sleek black design.", price: 1200, originalPrice: 1500, discount: 20, stock: 12, category: "Appliances", rating: 4.5, reviews: 56, tags: ["microwave", "appliance", "kitchen"], shopIndex: 3 },
  { name: "Standing Fan 16\"", description: "Adjustable standing fan with 3 speed settings. Oscillating function for wider airflow.", price: 380, stock: 30, category: "Appliances", rating: 4.4, reviews: 89, tags: ["fan", "appliance", "cooling"], shopIndex: 3 },

  // GameZone Zambia products
  { name: "PlayStation 5 Console", description: "Sony PS5 with DualSense controller. 825GB SSD. Play the latest AAA games.", price: 9500, stock: 6, category: "Consoles", rating: 4.9, reviews: 28, tags: ["playstation", "console", "gaming"], shopIndex: 4 },
  { name: "Xbox Series X", description: "Microsoft's most powerful console. 1TB SSD, 4K gaming, Game Pass ready.", price: 8800, stock: 4, category: "Consoles", rating: 4.8, reviews: 19, tags: ["xbox", "console", "gaming"], shopIndex: 4 },
  { name: "FIFA 24 (PS5)", description: "The latest FIFA with enhanced HypermotionV, new PlayStyles, and Ultimate Team.", price: 550, originalPrice: 700, discount: 21, stock: 20, category: "Games", rating: 4.5, reviews: 67, tags: ["fifa", "ps5", "game"], shopIndex: 4 },
  { name: "Gaming Mouse Logitech G502", description: "HERO 25K sensor, 11 customizable buttons, adjustable weight. Pro-level precision.", price: 780, stock: 15, category: "PC Gaming", rating: 4.7, reviews: 45, tags: ["mouse", "gaming", "logitech"], shopIndex: 4 },
  { name: "Gaming Chair", description: "Ergonomic gaming chair with lumbar support, adjustable armrests and reclining back.", price: 2800, stock: 7, category: "Accessories", rating: 4.6, reviews: 23, tags: ["chair", "gaming", "ergonomic"], shopIndex: 4 },
  { name: "Nintendo Switch OLED", description: "7-inch OLED screen, enhanced audio, adjustable stand. Perfect for portable gaming.", price: 7200, stock: 5, category: "Consoles", rating: 4.8, reviews: 31, tags: ["nintendo", "switch", "portable"], shopIndex: 4 },

  // PharmaCare Health products
  { name: "Panadol Extra (24 tablets)", description: "Fast relief from headaches, body pain and fever. Paracetamol + Caffeine formula.", price: 45, stock: 150, category: "Medicine", rating: 4.9, reviews: 289, tags: ["panadol", "pain-relief", "medicine"], shopIndex: 5 },
  { name: "Vitamin C 1000mg (60 caps)", description: "High-potency Vitamin C supplement. Boosts immunity and energy. Orange-flavoured.", price: 120, originalPrice: 150, discount: 20, stock: 80, category: "Vitamins", rating: 4.7, reviews: 156, tags: ["vitamin-c", "immunity", "supplement"], shopIndex: 5 },
  { name: "Baby Diapers (Medium 40pc)", description: "Soft and absorbent baby diapers. Size M for 6-11kg babies. Rash-free guarantee.", price: 180, stock: 60, category: "Baby Care", rating: 4.8, reviews: 198, tags: ["diapers", "baby", "care"], shopIndex: 5 },
  { name: "Blood Pressure Monitor", description: "Digital automatic blood pressure monitor. Large display, memory for 2 users. Clinically validated.", price: 650, originalPrice: 800, discount: 19, stock: 25, category: "Wellness", rating: 4.6, reviews: 67, tags: ["blood-pressure", "monitor", "health"], shopIndex: 5 },
  { name: "Multivitamin Gummies (60pc)", description: "Delicious daily multivitamin gummies for the whole family. 13 essential vitamins.", price: 95, stock: 100, category: "Vitamins", rating: 4.8, reviews: 134, tags: ["multivitamin", "gummies", "family"], shopIndex: 5 },
  { name: "Sunscreen SPF50 (100ml)", description: "Broad spectrum UVA/UVB protection. Lightweight, non-greasy. Water resistant 80 mins.", price: 145, stock: 45, category: "Skincare", rating: 4.7, reviews: 89, tags: ["sunscreen", "spf50", "skincare"], shopIndex: 5 },
];

const FEED_POSTS_DATA = [
  {
    content: "🔥 NEW ARRIVAL! Samsung Galaxy A15 now in stock! Only K2,800 — that's K400 off!\n\n✅ 6.5\" Super AMOLED display\n✅ 50MP camera\n✅ 5000mAh battery\n\nVisit us at Soweto Market or order for delivery! 📱",
    isPromotion: true,
    locationId: "soweto",
    product: { name: "Samsung Galaxy A15", price: 2800, originalPrice: 3200, discount: 12 },
    shopIndex: 0,
    likes: 24,
  },
  {
    content: "Avocado season is here! 🥑 Fresh Hass avocados just K120 per dozen. Limited stock — first come first served!\n\nSourced from farms in Lusaka's peri-urban areas. Ripe and ready to eat.",
    isPromotion: true,
    locationId: "city-market",
    product: { name: "Avocados (dozen)", price: 120, originalPrice: 150, discount: 20 },
    shopIndex: 1,
    likes: 31,
  },
  {
    content: "Summer collection is live! 🌞 Floral dresses starting from just K480. Come to Munyaule Market and find your perfect look.\n\nWe have sizes 8-18. Free styling advice included! 👗✨",
    isPromotion: true,
    locationId: "munyaule",
    product: { name: "Women's Floral Dress", price: 480 },
    shopIndex: 2,
    likes: 18,
  },
  {
    content: "PS5 in stock! 🎮 Grab your PlayStation 5 for just K9,500. We also have FIFA 24 for K550 — bundle deal available!\n\n🎮 PS5 + FIFA 24 bundle: K9,800 (save K250)",
    isPromotion: true,
    locationId: "comesa",
    product: { name: "PlayStation 5 Console", price: 9500 },
    shopIndex: 4,
    likes: 42,
  },
  {
    content: "Just got a beautiful 3-seater sofa from HomeComfort Plus in Kamwala! The quality is amazing and the delivery was so smooth. Highly recommend! 🛋️\n\n#Pakalale #HomeDecor #HappyCustomer",
    isPromotion: false,
    locationId: "kamwala",
    shopIndex: 3,
    likes: 12,
  },
  {
    content: "💊 HEALTH TIP: Vitamin C boosts your immune system! Our Vitamin C 1000mg is now 20% off — just K120 for 60 capsules.\n\n✅ Orange-flavoured\n✅ High potency\n✅ Supports immunity\n\nVisit PharmaCare Health at City Market!",
    isPromotion: true,
    locationId: "city-market",
    product: { name: "Vitamin C 1000mg (60 caps)", price: 120, originalPrice: 150, discount: 20 },
    shopIndex: 5,
    likes: 56,
  },
  {
    content: "🎮 GameZone has the new Nintendo Switch OLED in stock! K7,200 — perfect for portable gaming. Bring the kids, we have something for everyone!\n\n📍 COMESA Market\n⏰ Open until 10PM",
    isPromotion: true,
    locationId: "comesa",
    product: { name: "Nintendo Switch OLED", price: 7200 },
    shopIndex: 4,
    likes: 38,
  },
  {
    content: "Baby care essentials at PharmaCare! 🍼 We have diapers, formula, baby lotion and more. All genuine products with expiry dates verified.\n\nWalk-in or order via WhatsApp: +260 97 888 1234",
    isPromotion: true,
    locationId: "city-market",
    product: { name: "Baby Diapers (Medium 40pc)", price: 180 },
    shopIndex: 5,
    likes: 29,
  },
  {
    content: "HP Laptop just K12,000 at TechHub! 💻 Intel Core i5, 8GB RAM, 512GB SSD. Perfect for students and professionals.\n\nFree delivery in Lusaka for orders over K2,000.",
    isPromotion: true,
    locationId: "soweto",
    product: { name: "HP Laptop 15s", price: 12000 },
    shopIndex: 0,
    likes: 45,
  },
  {
    content: "Just picked up fresh mangoes from FreshBasket! 🥭 K65 for 3kg — so sweet and juicy. Best prices in Lusaka for sure.\n\nThank you Grace for the great service! 🙏",
    isPromotion: false,
    locationId: "city-market",
    shopIndex: 1,
    likes: 19,
  },
  {
    content: "Standing fan for just K380 at HomeComfort Plus! 💨 Beat the heat this summer. 3 speed settings, oscillating function.\n\n📍 Kamwala Market\n🚚 Delivery available",
    isPromotion: true,
    locationId: "kamwala",
    product: { name: 'Standing Fan 16"', price: 380 },
    shopIndex: 3,
    likes: 22,
  },
  {
    content: "Blood pressure monitor now at PharmaCare for K650! 🩺 Digital, automatic, stores readings for 2 users. Clinically validated.\n\nYour health matters — check your BP regularly!",
    isPromotion: true,
    locationId: "city-market",
    product: { name: "Blood Pressure Monitor", price: 650, originalPrice: 800, discount: 19 },
    shopIndex: 5,
    likes: 34,
  },
];

const NOTIFICATION_TEMPLATES = [
  { type: "deal", title: "Flash Sale Alert!", message: "TechHub Zambia is running a 24hr sale on all Samsung phones. Up to 25% off!", actionUrl: "/customer/deals" },
  { type: "shop", title: "New Shop Nearby", message: "GameZone Zambia just listed 6 new gaming products. Check them out!", actionUrl: "/customer/locations" },
  { type: "order", title: "Order Confirmed", message: "Your order from FreshBasket Market has been confirmed and is being prepared.", actionUrl: "/customer/deals" },
  { type: "message", title: "New Message", message: "StyleVault Fashion replied to your inquiry about the floral dress.", actionUrl: "/customer/chat" },
  { type: "review", title: "Rate Your Purchase", message: "How was your experience with TechHub Zambia? Leave a review!", actionUrl: "/customer/deals" },
  { type: "system", title: "Welcome to Pakalale!", message: "Start exploring local shops in your area. Discover deals, connect with sellers, and support local businesses.", actionUrl: "/customer" },
];

// ── Main Seed Function ──

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Drop existing collections
    const collections = ["users", "shops", "products", "feedposts", "orders", "locations", "chats", "messages", "notifications"];
    for (const coll of collections) {
      await mongoose.connection.db!.dropCollection(coll).catch(() => {});
    }
    console.log("🗑️  Dropped existing collections\n");

    // Create models
    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const Shop = mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
    const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
    const FeedPost = mongoose.models.FeedPost || mongoose.model("FeedPost", FeedPostSchema);
    const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
    const Location = mongoose.models.Location || mongoose.model("Location", LocationSchema);
    const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
    const Message = mongoose.models.Message || mongoose.model("Message", ChatMessageSchema);
    const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

    // 1. Seed Locations
    console.log("📍 Seeding locations...");
    const locations = await Location.insertMany(LOCATIONS);
    const locationMap = new Map(locations.map((l) => [l.slug, l._id]));
    console.log(`   ✅ ${locations.length} locations created\n`);

    // 2. Create Users
    console.log("👤 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 12);

    const shopOwners = [];
    const shopOwnerNames = [
      { firstName: "John", lastName: "Mwila" },     // TechHub
      { firstName: "Grace", lastName: "Phiri" },     // FreshBasket
      { firstName: "Patricia", lastName: "Banda" },  // StyleVault
      { firstName: "David", lastName: "Tembo" },     // HomeComfort
      { firstName: "Samuel", lastName: "Chileshe" }, // GameZone
      { firstName: "Nancy", lastName: "Chanda" },    // PharmaCare
    ];

    for (let i = 0; i < 6; i++) {
      const user = await User.create({
        email: `shop${i + 1}@pakalale.com`,
        password: hashedPassword,
        firstName: shopOwnerNames[i].firstName,
        lastName: shopOwnerNames[i].lastName,
        role: "shop_owner",
        isVerified: i < 3,
        location: LOCATIONS[i % LOCATIONS.length].name,
        phone: SHOP_DATA[i].contact.phone,
        bio: `Owner of ${SHOP_DATA[i].name}`,
      });
      shopOwners.push(user);
      console.log(`   ✅ ${user.firstName} ${user.lastName} (${user.email}) — shop_owner`);
    }

    const customer = await User.create({
      email: "customer@pakalale.com",
      password: hashedPassword,
      firstName: "Memory",
      lastName: "Zulu",
      role: "customer",
      isVerified: true,
      location: "Lusaka",
      phone: "+260 98 111 2233",
      bio: "Love shopping for deals on Pakalale!",
    });
    console.log(`   ✅ ${customer.firstName} ${customer.lastName} (${customer.email}) — customer`);
    console.log();

    // 3. Create Shops
    console.log("🏪 Creating shops...");
    const shops: Array<{ _id: mongoose.Types.ObjectId; name: string; locationId?: string; [key: string]: unknown }> = [];
    const shopStatuses = ["verified", "verified", "verified", "pending", "pending", "pending"];
    for (let i = 0; i < SHOP_DATA.length; i++) {
      const shop = await Shop.create({
        ...SHOP_DATA[i],
        ownerId: shopOwners[i]._id,
        status: shopStatuses[i],
      });
      shops.push(shop);
      console.log(`   ✅ ${shop.name} (${LOCATIONS[i % LOCATIONS.length].name})`);
    }
    console.log();

    // 4. Create Products
    console.log("📦 Creating products...");
    const products = [];
    for (const pd of PRODUCTS_DATA) {
      const product = await Product.create({
        name: pd.name,
        description: pd.description,
        price: pd.price,
        originalPrice: pd.originalPrice,
        discount: pd.discount,
        stock: pd.stock,
        category: pd.category,
        shopId: shops[pd.shopIndex]._id,
        rating: pd.rating,
        reviews: pd.reviews,
        tags: pd.tags || [],
        isAvailable: pd.stock > 0,
        images: [],
        views: Math.floor(Math.random() * 200) + 10,
      });
      products.push(product);
    }
    console.log(`   ✅ ${products.length} products created`);
    console.log();

    // 5. Create Feed Posts
    console.log("📝 Creating feed posts...");
    for (let i = 0; i < FEED_POSTS_DATA.length; i++) {
      const fp = FEED_POSTS_DATA[i];
      const shop = shops[fp.shopIndex];
      const owner = shopOwners[fp.shopIndex];
      const product = fp.product ? products.find((p) => p.name === fp.product!.name) : null;

      const likedBy = [customer._id];
      if (i < FEED_POSTS_DATA.length - 1) likedBy.push(shopOwners[(fp.shopIndex + 1) % 5]._id);

      await FeedPost.create({
        content: fp.content,
        authorId: owner._id,
        locationId: fp.locationId,
        likes: likedBy,
        comments: i === 0
          ? [{ authorId: customer._id, authorName: "Memory Zulu", content: "Great deal! Is this still available?" }]
          : [],
        shares: Math.floor(Math.random() * 10),
        isPromotion: fp.isPromotion,
        product: product
          ? { name: product.name, price: product.price, originalPrice: product.originalPrice, discount: product.discount, image: "", shopId: shop._id }
          : undefined,
        images: [],
      });
    }
    console.log(`   ✅ ${FEED_POSTS_DATA.length} feed posts created`);
    console.log();

    // 6. Create Orders
    console.log("🛒 Creating sample orders...");
    const orderStatuses: Array<"completed" | "pending" | "confirmed" | "preparing"> = ["completed", "completed", "pending", "confirmed", "preparing", "completed"];
    const paymentMethods = ["Mobile Money", "Cash", "Bank Transfer", "Mobile Money", "Cash", "Cash"];
    let orderCount = 0;
    for (let i = 0; i < 15; i++) {
      const shopIdx = i % shops.length;
      const shopProducts = products.filter((p) => p.shopId.toString() === shops[shopIdx]._id.toString());
      if (shopProducts.length === 0) continue;

      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems: Array<{ productId: mongoose.Types.ObjectId; quantity: number; price: number }> = [];
      let total = 0;

      for (let j = 0; j < numItems; j++) {
        const prod = shopProducts[Math.floor(Math.random() * shopProducts.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        orderItems.push({ productId: prod._id, quantity: qty, price: prod.price });
        total += prod.price * qty;
      }

      await Order.create({
        customerId: customer._id,
        shopId: shops[shopIdx]._id,
        items: orderItems,
        status: orderStatuses[i % orderStatuses.length],
        total,
        paymentMethod: paymentMethods[i % paymentMethods.length],
      });
      orderCount++;
    }
    console.log(`   ✅ ${orderCount} orders created`);
    console.log();

    // 7. Create Chats & Messages
    console.log("💬 Creating chats...");
    const chat1 = await Chat.create({
      type: "deal",
      participants: [customer._id, shopOwners[0]._id],
      dealInfo: {
        productName: "iPhone 15 Pro Max",
        initialPrice: 18500,
        finalPrice: 17500,
        status: "negotiating",
      },
      lastMessageTime: new Date(),
      isActive: true,
    });

    const chatMessages = [
      { senderId: customer._id, senderName: `${customer.firstName} ${customer.lastName}`, senderRole: "customer" as const, content: "Hello! Is the iPhone 15 Pro Max still available?" },
      { senderId: shopOwners[0]._id, senderName: `${shopOwnerNames[0].firstName} ${shopOwnerNames[0].lastName}`, senderRole: "shop_owner" as const, content: "Yes it is! We have it in Space Black and Natural Titanium. K18,500." },
      { senderId: customer._id, senderName: `${customer.firstName} ${customer.lastName}`, senderRole: "customer" as const, content: "Can you do K17,000? I'm ready to pay today." },
      { senderId: shopOwners[0]._id, senderName: `${shopOwnerNames[0].firstName} ${shopOwnerNames[0].lastName}`, senderRole: "shop_owner" as const, content: "I can do K17,500 — that's my best price. It includes a free screen protector and case!" },
      { senderId: customer._id, senderName: `${customer.firstName} ${customer.lastName}`, senderRole: "customer" as const, content: "Deal! I'll come pick it up tomorrow morning. Which color should I reserve?" },
      { senderId: shopOwners[0]._id, senderName: `${shopOwnerNames[0].firstName} ${shopOwnerNames[0].lastName}`, senderRole: "shop_owner" as const, content: "I'd recommend the Natural Titanium — it's the most popular. I'll hold one for you. See you tomorrow!" },
    ];

    const lastMsg = await Message.create(
      chatMessages.map((m) => ({ ...m, chatId: chat1._id, timestamp: new Date(Date.now() - Math.random() * 3600000), isRead: true, readBy: [] }))
    );
    await Chat.findByIdAndUpdate(chat1._id, { lastMessage: lastMsg[lastMsg.length - 1]._id, lastMessageTime: new Date() });

    // Second chat
    const chat2 = await Chat.create({
      type: "general",
      participants: [customer._id, shopOwners[1]._id],
      lastMessageTime: new Date(Date.now() - 3600000),
      isActive: true,
    });

    await Message.create([
      { chatId: chat2._id, senderId: customer._id, senderName: `${customer.firstName} ${customer.lastName}`, senderRole: "customer", content: "Do you have organic tomatoes?", timestamp: new Date(Date.now() - 7200000), isRead: true, readBy: [] },
      { chatId: chat2._id, senderId: shopOwners[1]._id, senderName: `${shopOwnerNames[1].firstName} ${shopOwnerNames[1].lastName}`, senderRole: "shop_owner", content: "Yes! We get them fresh every morning from farms in Chilanga. K85 for 5kg.", timestamp: new Date(Date.now() - 3600000), isRead: true, readBy: [] },
    ]);

    console.log("   ✅ 2 chats with messages created");
    console.log();

    // 8. Create Notifications for customer
    console.log("🔔 Creating notifications...");
    for (const nt of NOTIFICATION_TEMPLATES) {
      await Notification.create({
        userId: customer._id,
        type: nt.type,
        title: nt.title,
        message: nt.message,
        isRead: false,
        actionUrl: nt.actionUrl,
      });
    }
    // Add some for shop owners
    for (let i = 0; i < 3; i++) {
      await Notification.create({
        userId: shopOwners[i]._id,
        type: "order",
        title: "New Order Received",
        message: `You have a new order from Memory Zulu!`,
        isRead: false,
        actionUrl: "/shop/orders",
      });
    }
    console.log(`   ✅ ${NOTIFICATION_TEMPLATES.length + 3} notifications created`);
    console.log();

    // 9. Update location shopCount and userCount
    console.log("📊 Updating location stats...");
    for (const loc of locations) {
      const locShopCount = await Shop.countDocuments({ locationId: loc.slug });
      const locUserCount = await User.countDocuments({ location: loc.name });
      await Location.findByIdAndUpdate(loc._id, { shopCount: locShopCount, userCount: locUserCount + locShopCount });
      console.log(`   ✅ ${loc.name}: ${locShopCount} shops, ${locUserCount + locShopCount} users`);
    }
    console.log();

    console.log("🎉 Seed completed successfully!\n");
    console.log("📋 Login credentials:");
    console.log("   Customer:  customer@pakalale.com / password123");
    console.log("   Shop 1:    shop1@pakalale.com / password123 (TechHub Zambia)");
    console.log("   Shop 2:    shop2@pakalale.com / password123 (FreshBasket Market)");
    console.log("   Shop 3:    shop3@pakalale.com / password123 (StyleVault Fashion)");
    console.log("   Shop 4:    shop4@pakalale.com / password123 (HomeComfort Plus)");
    console.log("   Shop 5:    shop5@pakalale.com / password123 (GameZone Zambia)");
    console.log("   Shop 6:    shop6@pakalale.com / password123 (PharmaCare Health)");
    console.log();

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
