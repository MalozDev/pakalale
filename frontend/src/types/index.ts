export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "customer" | "shop_owner" | "admin";
  isVerified: boolean;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "customer" | "shop_owner";
}

export interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  specialties: string[];
  image?: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  locationId: string;
  status: "pending" | "verified" | "rejected";
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  images: string[];
  rating?: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isAvailable: boolean;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedPost {
  id: string;
  content: string;
  images?: string[];
  authorId: string;
  author: User;
  locationId?: string;
  location?: Location;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  postId: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  items: OrderItem[];
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  customerId: string;
  customer: User;
  shopId: string;
  shop: Shop;
  createdAt: string;
}
