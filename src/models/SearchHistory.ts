import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISearchHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  query: string;
  parsedIntent?: Record<string, string>;
  resultCount: number;
  clickedProducts?: mongoose.Types.ObjectId[];
  clickedShops?: mongoose.Types.ObjectId[];
  locationId?: string;
  timestamp: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    query: { type: String, required: true, trim: true },
    parsedIntent: { type: Schema.Types.Mixed },
    resultCount: { type: Number, default: 0 },
    clickedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    clickedShops: [{ type: Schema.Types.ObjectId, ref: "Shop" }],
    locationId: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

SearchHistorySchema.index({ userId: 1, timestamp: -1 });
SearchHistorySchema.index({ query: 1, timestamp: -1 });

const SearchHistory: Model<ISearchHistory> =
  mongoose.models.SearchHistory || mongoose.model<ISearchHistory>("SearchHistory", SearchHistorySchema);
export default SearchHistory;
