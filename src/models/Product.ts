import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  stock: number;
  isAvailable: boolean;
  shopId: mongoose.Types.ObjectId;
  views: number;
  rating: number;
  reviews: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
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
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
