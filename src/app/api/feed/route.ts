import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { FeedPost } from "@/models/FeedPost";
import Shop from "@/models/Shop";
import { getCached, setCache, invalidateCache } from "@/lib/cache";

function toStr(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val instanceof mongoose.Types.ObjectId) return val.toString();
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id: unknown })._id);
  }
  return String(val);
}

function populateToStr(val: unknown): Record<string, unknown> | string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "_id" in val) {
    const obj = val as Record<string, unknown>;
    return { ...obj, id: String(obj._id) };
  }
  return String(val);
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const query: Record<string, unknown> = {};

    const filter = searchParams.get("filter");
    if (filter === "promotions") {
      query.isPromotion = true;
    }

    const locationId = searchParams.get("locationId");
    if (locationId) query.locationId = locationId;

    const authorId = searchParams.get("authorId");
    if (authorId) query.authorId = authorId;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const cacheKey = `feed:${JSON.stringify({ filter, locationId, authorId, page, limit })}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [posts, total] = await Promise.all([
      FeedPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("authorId", "firstName lastName avatar role")
        .lean(),
      FeedPost.countDocuments(query),
    ]);

    // Look up shops for shop_owner authors
    const shopOwnerIds = posts
      .map((p) => {
        const authorObj = p.authorId as unknown as Record<string, unknown> | null;
        if (authorObj && authorObj.role === "shop_owner") return toStr(p.authorId);
        return null;
      })
      .filter(Boolean);

    const shops = shopOwnerIds.length > 0
      ? await Shop.find({ ownerId: { $in: shopOwnerIds } }).select("ownerId locationId status").lean()
      : [];

    const shopByOwner = new Map<string, { shopId: string; locationId: string; status: string }>();
    shops.forEach((s) => {
      shopByOwner.set(toStr(s.ownerId), { shopId: toStr(s._id), locationId: toStr(s.locationId), status: String(s.status) });
    });

    const result = {
      posts: posts.map((p) => {
        const authorObj = p.authorId as unknown as Record<string, unknown> | null;
        const hasAuthor = authorObj && typeof authorObj === "object" && "firstName" in authorObj;
        const ownerShop = hasAuthor && authorObj.role === "shop_owner" ? shopByOwner.get(toStr(p.authorId)) : undefined;

        return {
          id: p._id.toString(),
          content: p.content,
          images: p.images,
          authorId: toStr(p.authorId),
          author: hasAuthor
            ? {
                id: toStr(p.authorId),
                name: `${authorObj.firstName} ${authorObj.lastName}`,
                avatar: authorObj.avatar,
                role: authorObj.role,
                shopId: ownerShop?.shopId || null,
                shopLocationId: ownerShop?.locationId || null,
                isShopVerified: ownerShop?.status === "verified",
              }
            : null,
          locationId: p.locationId,
          likes: p.likes?.length || 0,
          likedBy: p.likes?.map((l) => l.toString()) || [],
          comments: p.comments || [],
          commentsCount: p.comments?.length || 0,
          shares: p.shares,
          isPromotion: p.isPromotion,
          product: p.product
            ? { ...p.product, id: toStr(p.product.shopId), shopId: toStr(p.product.shopId) }
            : undefined,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    setCache(cacheKey, result, 10_000);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Feed GET error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const post = await FeedPost.create(body);
    invalidateCache("feed:");
    return NextResponse.json({
      post: { ...post.toObject(), id: post._id.toString(), likes: 0, comments: [] },
    }, { status: 201 });
  } catch (error) {
    console.error("Feed POST error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, action, userId, comment } = body;

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    if (action === "like") {
      const post = await FeedPost.findById(id);
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

      const userIdObj = new mongoose.Types.ObjectId(userId);
      const alreadyLiked = post.likes.some((l) => l.toString() === userId);

      if (alreadyLiked) {
        post.likes = post.likes.filter((l) => l.toString() !== userId);
      } else {
        post.likes.push(userIdObj);
      }
      await post.save();

      return NextResponse.json({
        liked: !alreadyLiked,
        likesCount: post.likes.length,
      });
    }

    if (action === "comment") {
      const post = await FeedPost.findById(id);
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

      post.comments.push({
        authorId: new mongoose.Types.ObjectId(userId),
        authorName: comment.authorName,
        content: comment.content,
        createdAt: new Date(),
      });
      await post.save();

      return NextResponse.json({
        commentsCount: post.comments.length,
        comment: post.comments[post.comments.length - 1],
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Feed PUT error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
