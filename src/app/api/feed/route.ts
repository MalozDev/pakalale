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
        .select("content images authorId locationId likes comments shares isPromotion product postType createdAt updatedAt")
        .lean(),
      FeedPost.countDocuments(query),
    ]);

    if (posts.length === 0) {
      const result = { posts: [], total, page, totalPages: Math.ceil(total / limit) };
      setCache(cacheKey, result, 60_000);
      return NextResponse.json(result);
    }

    // Batch fetch authors and shops in parallel
    const authorIds = [...new Set(posts.map((p) => toStr(p.authorId)).filter(Boolean))];
    const [authors, shops] = await Promise.all([
      authorIds.length > 0
        ? (await import("@/models/User")).default
            .find({ _id: { $in: authorIds } })
            .select("firstName lastName avatar role")
            .lean()
        : [],
      authorIds.length > 0
        ? Shop.find({ ownerId: { $in: authorIds } })
            .select("ownerId locationId status")
            .lean()
        : [],
    ]);

    const authorMap = new Map<string, Record<string, unknown>>();
    authors.forEach((a) => authorMap.set(toStr(a._id), a as unknown as Record<string, unknown>));

    const shopByOwner = new Map<string, { shopId: string; locationId: string; status: string }>();
    shops.forEach((s) => {
      shopByOwner.set(toStr(s.ownerId), {
        shopId: toStr(s._id),
        locationId: toStr(s.locationId),
        status: String(s.status),
      });
    });

    const result = {
      posts: posts.map((p) => {
        const authorObj = authorMap.get(toStr(p.authorId));
        const hasAuthor = !!authorObj;
        const ownerShop =
          hasAuthor && authorObj!.role === "shop_owner"
            ? shopByOwner.get(toStr(p.authorId))
            : undefined;

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
          comments: (p.comments || []).slice(0, 3), // Only return first 3 comments in list
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
    setCache(cacheKey, result, 60_000); // 60s cache — feed doesn't change that fast
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
    return NextResponse.json(
      {
        post: { ...post.toObject(), id: post._id.toString(), likes: 0, comments: [] },
      },
      { status: 201 }
    );
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
      const userIdObj = new mongoose.Types.ObjectId(userId);
      const alreadyLiked = await FeedPost.findOne({
        _id: id,
        likes: userIdObj,
      })
        .select("_id")
        .lean();

      if (alreadyLiked) {
        await FeedPost.findByIdAndUpdate(id, { $pull: { likes: userIdObj } });
        const post = await FeedPost.findById(id).select("likes").lean();
        invalidateCache("feed:");
        return NextResponse.json({
          liked: false,
          likesCount: post?.likes?.length || 0,
        });
      } else {
        await FeedPost.findByIdAndUpdate(id, { $push: { likes: userIdObj } });
        const post = await FeedPost.findById(id).select("likes authorId").lean();
        invalidateCache("feed:");

        // Notify post author (not self)
        if (post && toStr(post.authorId) !== userId) {
          const { createNotification } = await import("@/lib/notifications");
          await createNotification({
            userId: toStr(post.authorId),
            type: "review",
            title: "Someone liked your post ❤️",
            message: `Your post was liked by a user.`,
            actionUrl: "/customer",
          });
        }

        return NextResponse.json({
          liked: true,
          likesCount: post?.likes?.length || 0,
        });
      }
    }

    if (action === "comment") {
      await FeedPost.findByIdAndUpdate(id, {
        $push: {
          comments: {
            authorId: new mongoose.Types.ObjectId(userId),
            authorName: comment.authorName,
            content: comment.content,
            createdAt: new Date(),
          },
        },
      });
      const post = await FeedPost.findById(id).select("comments authorId").lean();
      invalidateCache("feed:");

      // Notify post author (not self)
      if (post && toStr(post.authorId) !== userId) {
        const { createNotification } = await import("@/lib/notifications");
        await createNotification({
          userId: toStr(post.authorId),
          type: "message",
          title: `New comment by ${comment.authorName}`,
          message: comment.content.length > 80 ? comment.content.slice(0, 80) + "..." : comment.content,
          actionUrl: "/customer",
        });
      }

      return NextResponse.json({
        commentsCount: post?.comments?.length || 0,
        comment: post?.comments?.[post.comments.length - 1] || null,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Feed PUT error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
