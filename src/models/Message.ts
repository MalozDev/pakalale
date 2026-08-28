import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: "customer" | "shop_owner";
  content: string;
  type: "text" | "image" | "file" | "voice" | "deal_update" | "system";
  isRead: boolean;
  readBy: mongoose.Types.ObjectId[];
  replyTo?: {
    messageId: mongoose.Types.ObjectId;
    content: string;
    senderName: string;
  };
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["customer", "shop_owner"], required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "file", "voice", "deal_update", "system"], default: "text" },
    isRead: { type: Boolean, default: false },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replyTo: {
      messageId: { type: Schema.Types.ObjectId },
      content: { type: String },
      senderName: { type: String },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  type: "deal" | "general";
  participants: mongoose.Types.ObjectId[];
  dealInfo?: {
    dealId?: mongoose.Types.ObjectId;
    productId?: mongoose.Types.ObjectId;
    productName?: string;
    productImage?: string;
    initialPrice?: number;
    counterPrice?: number;
    finalPrice?: number;
    lastOfferBy?: mongoose.Types.ObjectId;
    quantity?: number;
    status: "pending" | "negotiating" | "confirmed" | "completed" | "cancelled";
  };
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ["deal", "general"], default: "general" },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    dealInfo: {
      dealId: { type: Schema.Types.ObjectId },
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String },
      productImage: { type: String },
      initialPrice: { type: Number },
      counterPrice: { type: Number },
      finalPrice: { type: Number },
      lastOfferBy: { type: Schema.Types.ObjectId, ref: "User" },
      quantity: { type: Number, default: 1 },
      status: {
        type: String,
        enum: ["pending", "negotiating", "confirmed", "completed", "cancelled"],
        default: "pending",
      },
    },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    lastMessageTime: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for performance
MessageSchema.index({ chatId: 1, timestamp: 1 });
MessageSchema.index({ chatId: 1, senderId: 1, isRead: 1 });
ChatSchema.index({ participants: 1, isActive: 1, lastMessageTime: -1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export { Message, Chat };
