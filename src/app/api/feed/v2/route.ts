import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { FeedPost, Location } from "@/models/FeedPost";
import Shop from "@/models/Shop";
import SearchHistory from "@/models/SearchHistory";

function toStr(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val instanceof mongoose.Types.ObjectId) return val.toString();
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id: unknown })._id);
  }
  return String(val);
}

// Score a feed post for a customer
function scorePost(
  post: Record<string, unknown>,
  userInterests: string[],
  userLocationId?: string | null,
): number {
  let score = 0;

  // Recency (0-30 points) — exponential decay
  const createdAt = new Date(post.createdAt as string);
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation < 1) score += 30;
  else if (hoursSinceCreation < 6) score += 25;
  else if (hoursSinceCreation < 24) score += 20;
  else if (hoursSinceCreation < 72) score += 12;
  else if (hoursSinceCreation < 168) score += 5;
  else score += 1;

  // Engagement (0-25 points)
  const likes = (post.likes as unknown[])?.length || 0;
  const comments = (post.comments as unknown[])?.length || 0;
  const shares = (post.shares as number) || 0;
  score += Math.min(15, likes * 1.5);
  score += Math.min(8, comments * 2);
  score += Math.min(5, shares * 2);

  // Location match (0-15 points)
  if (post.locationId && userLocationId) {
    if (post.locationId === userLocationId) {
      score += 15;
    } else {
      score += 3;
    }
  } else {
    score += 5; // No location context
  }

  // Post type bonus
  const postType = post.postType as string;
  if (postType === "product_arrival") score += 8;
  else if (postType === "price_drop") score += 10;
  else if (postType === "promotion") score += 7;
  else if (postType === "customer_request") score += 5;
  else if (postType === "customer_review") score += 4;
  else if (postType === "demand_signal") score += 6;

  // Promotion boost
  if (post.isPromotion) score += 5;

  // Product attached bonus
  if (post.product) score += 3;

  // Interest match (0-10 points)
  if (userInterests.length > 0) {
    const content = String(post.content || "").toLowerCase();
    const matchedInterests = userInterests.filter((interest) =>
      content.includes(interest.toLowerCase())
    );
    score += Math.min(10, matchedInterests.length * 3);
  }

  return score;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "customer"; // "customer" or "shop"
    const locationId = searchParams.get("locationId");
    const userId = searchParams.get("userId");
    const filter = searchParams.get("filter");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    if (filter === "promotions") query.isPromotion = true;
    if (filter === "requests") query.postType = "customer_request";
    if (filter === "reviews") query.postType = "customer_review";
    if (locationId) query.locationId = locationId;

    // For customer feed, exclude customer_request posts (they're for shops)
    // For shop feed, show customer_request posts
    if (type === "customer") {
      query.$or = [
        { postType: { $ne: "customer_request" } },
        { postType: { $exists: false } },
      ];
    }

    // Fetch all candidate posts (more than needed for ranking)
    const candidates = await FeedPost.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(200, skip + limit * 3)) // Fetch more for ranking
      .populate("authorId", "firstName lastName avatar role")
      .lean();

    // Look up shops for shop_owner authors
    const shopOwnerIds = candidates
      .map((p) => {
        const authorObj = p.authorId as unknown as Record<string, unknown> | null;
        if (authorObj && authorObj.role === "shop_owner") return toStr(p.authorId);
        return null;
      })
      .filter(Boolean);

    const shops = shopOwnerIds.length > 0
      ? await Shop.find({ ownerId: { $in: shopOwnerIds } }).select("ownerId name profileImage locationId status specialties").lean()
      : [];

    const shopByOwner = new Map<string, { shopId: string; shopName: string; shopAvatar: string; locationId: string; status: string; specialties: string[] }>();
    shops.forEach((s) => {
      shopByOwner.set(toStr(s.ownerId), {
        shopId: toStr(s._id),
        shopName: String(s.name || ""),
        shopAvatar: String(s.profileImage || ""),
        locationId: toStr(s.locationId),
        status: String(s.status),
        specialties: s.specialties || [],
      });
    });

    // Get user interests for personalization
    let userInterests: string[] = [];
    if (userId) {
      const recentSearches = await SearchHistory.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean();
      userInterests = recentSearches.map((s) => s.query).filter(Boolean);

      // Also get shop specialties from user's location
      if (locationId) {
        const nearbyShops = await Shop.find({ locationId }).select("specialties").lean();
        nearbyShops.forEach((s) => userInterests.push(...(s.specialties || [])));
      }
    }

    // Score and rank posts
    const scoredPosts = candidates.map((p) => {
      const authorObj = p.authorId as unknown as Record<string, unknown> | null;
      const hasAuthor = authorObj && typeof authorObj === "object" && "firstName" in authorObj;
      const ownerShop = hasAuthor && authorObj.role === "shop_owner" ? shopByOwner.get(toStr(p.authorId)) : undefined;
      const pRecord = p as unknown as Record<string, unknown>;

      const isShopOwner = hasAuthor && authorObj.role === "shop_owner";
      const shopData = isShopOwner && ownerShop ? shopByOwner.get(toStr(p.authorId)) : null;

      return {
        id: p._id.toString(),
        content: p.content,
        images: p.images,
        authorId: toStr(p.authorId),
        author: hasAuthor
          ? {
              id: toStr(p.authorId),
              name: shopData?.shopName || `${authorObj.firstName} ${authorObj.lastName}`,
              avatar: shopData?.shopAvatar || authorObj.avatar,
              role: authorObj.role,
              shopId: ownerShop?.shopId || null,
              shopLocationId: ownerShop?.locationId || null,
              isShopVerified: ownerShop?.status === "verified",
              specialties: ownerShop?.specialties || [],
            }
          : null,
        locationId: p.locationId,
        likes: p.likes?.length || 0,
        likedBy: p.likes?.map((l) => l.toString()) || [],
        comments: p.comments || [],
        commentsCount: p.comments?.length || 0,
        shares: p.shares,
        isPromotion: p.isPromotion,
        postType: p.postType || "general",
        autoGenerated: p.autoGenerated || false,
        product: p.product
          ? { ...p.product, id: toStr(p.product.shopId), shopId: toStr(p.product.shopId) }
          : undefined,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        score: scorePost(pRecord, userInterests, locationId),
      };
    });

    scoredPosts.sort((a, b) => b.score - a.score);

    const total = scoredPosts.length;
    const paginatedPosts = scoredPosts.slice(skip, skip + limit);

    return NextResponse.json({
      posts: paginatedPosts.map((p) => ({
        ...p,
        score: Math.round(p.score * 100) / 100,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Feed v2 GET error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
