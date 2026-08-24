import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedComment {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface IFeedPost extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  images?: string[];
  authorId: mongoose.Types.ObjectId;
  locationId?: string;
  likes: mongoose.Types.ObjectId[];
  comments: IFeedComment[];
  shares: number;
  isPromotion: boolean;
  product?: {
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    shopId: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FeedPostSchema = new Schema<IFeedPost>(
  {
    content: { type: String, required: true },
    images: [{ type: String }],
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    locationId: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{
      authorId: { type: Schema.Types.ObjectId, ref: "User" },
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
      shopId: { type: Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

FeedPostSchema.index({ createdAt: -1 });
FeedPostSchema.index({ authorId: 1 });

export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
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

const LocationSchema = new Schema<ILocation>(
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

const FeedPost: Model<IFeedPost> =
  mongoose.models.FeedPost || mongoose.model<IFeedPost>("FeedPost", FeedPostSchema);
const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);

export { FeedPost, Location };
