import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductView extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  source: "search" | "feed" | "shop_page" | "direct" | "recommendation";
  timestamp: Date;
}

const ProductViewSchema = new Schema<IProductView>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    source: { type: String, enum: ["search", "feed", "shop_page", "direct", "recommendation"], default: "direct" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ProductViewSchema.index({ productId: 1, timestamp: -1 });
ProductViewSchema.index({ userId: 1, timestamp: -1 });
ProductViewSchema.index({ source: 1, timestamp: -1 });

const ProductView: Model<IProductView> =
  mongoose.models.ProductView || mongoose.model<IProductView>("ProductView", ProductViewSchema);
export default ProductView;
