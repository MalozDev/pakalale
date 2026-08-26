import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getCached, setCache } from "@/lib/cache";

function toStr(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
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

    const search = searchParams.get("search");
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { specialties: { $regex: search, $options: "i" } },
      ];
    }

    const locationId = searchParams.get("locationId");
    if (locationId) query.locationId = locationId;

    const ownerId = searchParams.get("ownerId");
    if (ownerId) query.ownerId = ownerId;

    const status = searchParams.get("status");
    if (status) query.status = status;

    const sort = searchParams.get("sort") || "rating";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const id = searchParams.get("id");
    if (id) {
      const cacheKey = `shop:${id}`;
      const cached = getCached(cacheKey);
      if (cached) return NextResponse.json(cached);

      const shop = await Shop.findById(id)
        .select("name description ownerId locationId status contact hours coverImage profileImage images specialties rating totalReviews createdAt updatedAt")
        .lean();
      if (!shop) {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 });
      }

      // Fetch owner info separately — faster than populate
      const User = (await import("@/models/User")).default;
      const owner = await User.findById(shop.ownerId)
        .select("firstName lastName email avatar")
        .lean();

      const productCount = await Product.countDocuments({ shopId: shop._id });

      const result = {
        shop: {
          id: shop._id.toString(),
          name: shop.name,
          description: shop.description,
          ownerId: owner
            ? { id: toStr(owner._id), firstName: owner.firstName, lastName: owner.lastName, email: owner.email, avatar: owner.avatar }
            : { id: toStr(shop.ownerId) },
          locationId: shop.locationId,
          status: shop.status,
          contact: shop.contact,
          hours: shop.hours,
          coverImage: shop.coverImage,
          profileImage: shop.profileImage,
          images: shop.images,
          specialties: shop.specialties,
          rating: shop.rating,
          totalReviews: shop.totalReviews,
          productCount,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt,
        },
      };
      setCache(cacheKey, result, 60_000); // 60s cache
      return NextResponse.json(result);
    }

    // Build cache key from query params
    const cacheKey = `shops:${JSON.stringify({ locationId, ownerId, search, status, sort, order })}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    const shops = await Shop.find(query)
      .sort({ [sort]: order })
      .select("name description ownerId locationId status contact coverImage profileImage images specialties rating totalReviews totalViews createdAt updatedAt")
      .lean();

    if (shops.length === 0) {
      const result = { shops: [] };
      setCache(cacheKey, result, 60_000);
      return NextResponse.json(result);
    }

    // Batch fetch owners — single query instead of N
    const ownerIds = [...new Set(shops.map((s) => toStr(s.ownerId)).filter(Boolean))];
    const User = (await import("@/models/User")).default;
    const owners = ownerIds.length > 0
      ? await User.find({ _id: { $in: ownerIds } })
          .select("firstName lastName email avatar")
          .lean()
      : [];
    const ownerMap = new Map<string, Record<string, unknown>>();
    owners.forEach((o) => ownerMap.set(toStr(o._id), o as unknown as Record<string, unknown>));

    // Batch count products — single aggregation instead of N queries
    const shopIds = shops.map((s) => s._id);
    const productCounts = await Product.aggregate([
      { $match: { shopId: { $in: shopIds } } },
      { $group: { _id: "$shopId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    productCounts.forEach((pc) => countMap.set(toStr(pc._id), pc.count));

    const result = {
      shops: shops.map((shop) => {
        const owner = ownerMap.get(toStr(shop.ownerId));
        return {
          id: shop._id.toString(),
          name: shop.name,
          description: shop.description,
          ownerId: owner
            ? { id: toStr(shop.ownerId), firstName: owner.firstName, lastName: owner.lastName, email: owner.email, avatar: owner.avatar }
            : { id: toStr(shop.ownerId) },
          locationId: shop.locationId,
          status: shop.status,
          contact: shop.contact,
          coverImage: shop.coverImage,
          profileImage: shop.profileImage,
          images: shop.images,
          specialties: shop.specialties,
          rating: shop.rating,
          totalReviews: shop.totalReviews,
          productCount: countMap.get(shop._id.toString()) || 0,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt,
        };
      }),
    };
    setCache(cacheKey, result, 60_000); // 60s cache
    return NextResponse.json(result);
  } catch (error) {
    console.error("Shops GET error:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Shop ID is required" }, { status: 400 });
    }

    const shop = await Shop.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({ shop: { ...shop, id: shop._id.toString() } });
  } catch (error) {
    console.error("Shops PUT error:", error);
    return NextResponse.json({ error: "Failed to update shop" }, { status: 500 });
  }
}
