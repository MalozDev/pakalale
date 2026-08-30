import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "customer" | "shop_owner" | "admin";
  isVerified: boolean;
  location?: string;
  phone?: string;
  bio?: string;
  locationCoordinates?: { lat: number; lng: number };
  interestedCategories?: string[];
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
    locationCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    interestedCategories: [{ type: String }],
    lastActiveAt: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
