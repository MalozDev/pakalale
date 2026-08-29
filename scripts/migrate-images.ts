/**
 * Migration Script: Base64 → Cloudinary
 * 
 * Scans all collections for base64 data URLs, uploads them to Cloudinary,
 * and replaces them with the Cloudinary URL.
 * 
 * Run with: npx tsx scripts/migrate-images.ts
 */

import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGODB_URI = process.env.MONGODB_URI!;

// ─── Helpers ───

function isBase64(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return value.startsWith("data:image") || value.startsWith("data:audio") || value.startsWith("data:video");
}

async function uploadBase64(base64: string, folder: string): Promise<string | null> {
  try {
    // Extract the mime type and data
    const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;

    const result = await cloudinary.uploader.upload(base64, {
      folder: `pakalale/migration/${folder}`,
      resource_type: "auto",
      transformation: [
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return result.secure_url;
  } catch (err) {
    console.error(`  ❌ Upload failed:`, (err as Error).message);
    return null;
  }
}

// ─── Collection Migrations ───

async function migrateUsers(db: mongoose.Connection) {
  console.log("\n📋 Migrating Users (avatar)...");
  const User = db.collection("users");
  const users = await User.find({ avatar: { $regex: "^data:" } }).toArray();
  console.log(`  Found ${users.length} users with base64 avatars`);

  let migrated = 0;
  for (const user of users) {
    if (!isBase64(user.avatar)) continue;
    console.log(`  📤 Uploading avatar for user ${user._id} (${user.firstName} ${user.lastName})...`);
    const url = await uploadBase64(user.avatar, "avatars");
    if (url) {
      await User.updateOne({ _id: user._id }, { $set: { avatar: url } });
      migrated++;
      console.log(`  ✅ Done → ${url.substring(0, 60)}...`);
    }
  }
  console.log(`  Migrated ${migrated}/${users.length} user avatars`);
}

async function migrateShops(db: mongoose.Connection) {
  console.log("\n📋 Migrating Shops (coverImage, profileImage, images)...");
  const Shop = db.collection("shops");

  const shops = await Shop.find({
    $or: [
      { coverImage: { $regex: "^data:" } },
      { profileImage: { $regex: "^data:" } },
      { images: { $elemMatch: { $regex: "^data:" } } },
    ],
  }).toArray();
  console.log(`  Found ${shops.length} shops with base64 images`);

  let migrated = 0;
  for (const shop of shops) {
    let changed = false;

    // Cover image
    if (isBase64(shop.coverImage)) {
      console.log(`  📤 Uploading cover for shop "${shop.name}"...`);
      const url = await uploadBase64(shop.coverImage, "shops");
      if (url) {
        await Shop.updateOne({ _id: shop._id }, { $set: { coverImage: url } });
        changed = true;
      }
    }

    // Profile image
    if (isBase64(shop.profileImage)) {
      console.log(`  📤 Uploading profile for shop "${shop.name}"...`);
      const url = await uploadBase64(shop.profileImage, "shops");
      if (url) {
        await Shop.updateOne({ _id: shop._id }, { $set: { profileImage: url } });
        changed = true;
      }
    }

    // Shop images array
    if (shop.images && Array.isArray(shop.images)) {
      const newImages: string[] = [];
      let imagesChanged = false;
      for (const img of shop.images) {
        if (isBase64(img)) {
          console.log(`  📤 Uploading shop image for "${shop.name}"...`);
          const url = await uploadBase64(img, "shops");
          if (url) {
            newImages.push(url);
            imagesChanged = true;
          } else {
            newImages.push(img); // Keep original if upload fails
          }
        } else {
          newImages.push(img);
        }
      }
      if (imagesChanged) {
        await Shop.updateOne({ _id: shop._id }, { $set: { images: newImages } });
        changed = true;
      }
    }

    if (changed) migrated++;
  }
  console.log(`  Migrated ${migrated}/${shops.length} shops`);
}

async function migrateFeedPosts(db: mongoose.Connection) {
  console.log("\n📋 Migrating Feed Posts (images, product.image)...");
  const FeedPost = db.collection("feedposts");

  const posts = await FeedPost.find({
    $or: [
      { images: { $elemMatch: { $regex: "^data:" } } },
      { "product.image": { $regex: "^data:" } },
    ],
  }).toArray();
  console.log(`  Found ${posts.length} feed posts with base64 images`);

  let migrated = 0;
  for (const post of posts) {
    let changed = false;

    // Post images array
    if (post.images && Array.isArray(post.images)) {
      const newImages: string[] = [];
      let imagesChanged = false;
      for (const img of post.images) {
        if (isBase64(img)) {
          console.log(`  📤 Uploading feed image for post ${post._id}...`);
          const url = await uploadBase64(img, "feed");
          if (url) {
            newImages.push(url);
            imagesChanged = true;
          } else {
            newImages.push(img);
          }
        } else {
          newImages.push(img);
        }
      }
      if (imagesChanged) {
        await FeedPost.updateOne({ _id: post._id }, { $set: { images: newImages } });
        changed = true;
      }
    }

    // Product image in post
    if (post.product && isBase64(post.product.image)) {
      console.log(`  📤 Uploading product image in post ${post._id}...`);
      const url = await uploadBase64(post.product.image, "feed");
      if (url) {
        await FeedPost.updateOne({ _id: post._id }, { $set: { "product.image": url } });
        changed = true;
      }
    }

    if (changed) migrated++;
  }
  console.log(`  Migrated ${migrated}/${posts.length} feed posts`);
}

async function migrateProducts(db: mongoose.Connection) {
  console.log("\n📋 Migrating Products (images)...");
  const Product = db.collection("products");

  const products = await Product.find({
    images: { $elemMatch: { $regex: "^data:" } },
  }).toArray();
  console.log(`  Found ${products.length} products with base64 images`);

  let migrated = 0;
  for (const product of products) {
    if (!product.images || !Array.isArray(product.images)) continue;

    const newImages: string[] = [];
    let imagesChanged = false;

    for (const img of product.images) {
      if (isBase64(img)) {
        console.log(`  📤 Uploading image for product "${product.name}"...`);
        const url = await uploadBase64(img, "products");
        if (url) {
          newImages.push(url);
          imagesChanged = true;
        } else {
          newImages.push(img);
        }
      } else {
        newImages.push(img);
      }
    }

    if (imagesChanged) {
      await Product.updateOne({ _id: product._id }, { $set: { images: newImages } });
      migrated++;
    }
  }
  console.log(`  Migrated ${migrated}/${products.length} products`);
}

async function migrateMessages(db: mongoose.Connection) {
  console.log("\n📋 Migrating Messages (voice, image)...");
  const Message = db.collection("messages");

  const messages = await Message.find({
    type: { $in: ["voice", "image"] },
    content: { $regex: "^data:" },
  }).toArray();
  console.log(`  Found ${messages.length} messages with base64 content`);

  let migrated = 0;
  for (const msg of messages) {
    if (!isBase64(msg.content)) continue;

    const folder = msg.type === "voice" ? "voice" : "chat-images";
    console.log(`  📤 Uploading ${msg.type} message ${msg._id}...`);
    const url = await uploadBase64(msg.content, folder);
    if (url) {
      await Message.updateOne({ _id: msg._id }, { $set: { content: url } });
      migrated++;
      console.log(`  ✅ Done`);
    }
  }
  console.log(`  Migrated ${migrated}/${messages.length} messages`);
}

async function migrateLocations(db: mongoose.Connection) {
  console.log("\n📋 Migrating Locations (image)...");
  const Location = db.collection("locations");

  const locations = await Location.find({
    image: { $regex: "^data:" },
  }).toArray();
  console.log(`  Found ${locations.length} locations with base64 images`);

  let migrated = 0;
  for (const loc of locations) {
    if (!isBase64(loc.image)) continue;
    console.log(`  📤 Uploading image for location "${loc.name}"...`);
    const url = await uploadBase64(loc.image, "locations");
    if (url) {
      await Location.updateOne({ _id: loc._id }, { $set: { image: url } });
      migrated++;
    }
  }
  console.log(`  Migrated ${migrated}/${locations.length} locations`);
}

// ─── Main ───

async function main() {
  console.log("🚀 Starting Base64 → Cloudinary migration...\n");
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`MongoDB: ${MONGODB_URI.substring(0, 40)}...`);

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection;

  // Count total base64 items first
  const User = db.collection("users");
  const Shop = db.collection("shops");
  const FeedPost = db.collection("feedposts");
  const Product = db.collection("products");
  const Message = db.collection("messages");
  const Location = db.collection("locations");

  const [
    userCount,
    shopCount,
    postCount,
    productCount,
    messageCount,
    locationCount,
  ] = await Promise.all([
    User.countDocuments({ $or: [{ avatar: { $regex: "^data:" } }] }),
    Shop.countDocuments({ $or: [{ coverImage: { $regex: "^data:" } }, { profileImage: { $regex: "^data:" } }, { images: { $elemMatch: { $regex: "^data:" } } }] }),
    FeedPost.countDocuments({ $or: [{ images: { $elemMatch: { $regex: "^data:" } } }, { "product.image": { $regex: "^data:" } }] }),
    Product.countDocuments({ images: { $elemMatch: { $regex: "^data:" } } }),
    Message.countDocuments({ type: { $in: ["voice", "image"] }, content: { $regex: "^data:" } }),
    Location.countDocuments({ image: { $regex: "^data:" } }),
  ]);

  const total = userCount + shopCount + postCount + productCount + messageCount + locationCount;
  console.log(`\n📊 Found ${total} base64 items to migrate:`);
  console.log(`   Users:      ${userCount}`);
  console.log(`   Shops:      ${shopCount}`);
  console.log(`   Feed Posts: ${postCount}`);
  console.log(`   Products:   ${productCount}`);
  console.log(`   Messages:   ${messageCount}`);
  console.log(`   Locations:  ${locationCount}`);

  if (total === 0) {
    console.log("\n✅ No base64 images found. Nothing to migrate!");
    await mongoose.disconnect();
    return;
  }

  const startTime = Date.now();

  await migrateUsers(db);
  await migrateShops(db);
  await migrateFeedPosts(db);
  await migrateProducts(db);
  await migrateMessages(db);
  await migrateLocations(db);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Migration complete in ${elapsed}s`);
  console.log(`\nAll base64 images have been uploaded to Cloudinary.`);
  console.log(`Run the app to verify everything works.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
