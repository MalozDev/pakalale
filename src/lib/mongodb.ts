import mongoose from "mongoose";
// Import all models to ensure they're registered for populate() calls
import "@/models/User";
import "@/models/Shop";
import "@/models/Product";
import "@/models/FeedPost";
import "@/models/Notification";
import "@/models/Order";
import "@/models/Message";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pakalale";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
