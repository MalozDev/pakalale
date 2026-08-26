import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDemandRecord extends Document {
  _id: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  query: string;
  parsedIntent: {
    productType?: string;
    brand?: string;
    color?: string;
    attributes?: Record<string, string>;
    priceMax?: number;
  };
  locationId?: string;
  coordinates?: { lat: number; lng: number };
  status: "active" | "fulfilled" | "expired";
  responses: {
    shopId: mongoose.Types.ObjectId;
    responseType: "has_product" | "can_restock" | "similar_product";
    message?: string;
    productId?: mongoose.Types.ObjectId;
    timestamp: Date;
  }[];
  viewCount: number;
  createdAt: Date;
  expiresAt: Date;
}

const DemandRecordSchema = new Schema<IDemandRecord>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    query: { type: String, required: true, trim: true },
    parsedIntent: {
      productType: { type: String },
      brand: { type: String },
      color: { type: String },
      attributes: { type: Schema.Types.Mixed },
      priceMax: { type: Number },
    },
    locationId: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    status: { type: String, enum: ["active", "fulfilled", "expired"], default: "active" },
    responses: [{
      shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
      responseType: { type: String, enum: ["has_product", "can_restock", "similar_product"] },
      message: { type: String },
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      timestamp: { type: Date, default: Date.now },
    }],
    viewCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
  },
  { timestamps: true }
);

DemandRecordSchema.index({ locationId: 1, status: 1, createdAt: -1 });
DemandRecordSchema.index({ status: 1, createdAt: -1 });
DemandRecordSchema.index({ customerId: 1, createdAt: -1 });
DemandRecordSchema.index({ "parsedIntent.productType": 1, status: 1 });

const DemandRecord: Model<IDemandRecord> =
  mongoose.models.DemandRecord || mongoose.model<IDemandRecord>("DemandRecord", DemandRecordSchema);
export default DemandRecord;
