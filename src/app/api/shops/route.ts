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
      const shop = await Shop.findById(id).populate("ownerId", "firstName lastName email avatar").lean();
      if (!shop) {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 });
      }

      const [productCount, totalViews, orderCount] = await Promise.all([
        Product.countDocuments({ shopId: shop._id }),
        Product.aggregate([
          { $match: { shopId: shop._id } },
          { $group: { _id: null, total: { $sum: "$views" } } },
        ]),
        Order.countDocuments({ shopId: shop._id }),
      ]);

      return NextResponse.json({
        shop: {
          ...shop,
          id: shop._id.toString(),
          ownerId: populateToStr(shop.ownerId),
          productCount,
          totalViews: totalViews[0]?.total || 0,
          orderCount,
        },
      });
    }

    // Build cache key from query params
    const cacheKey = `shops:${JSON.stringify({ locationId, ownerId, search, status, sort, order })}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    const shops = await Shop.find(query)
      .sort({ [sort]: order })
      .populate("ownerId", "firstName lastName email avatar")
      .lean();

    // Batch count products instead of N+1 queries
    const shopIds = shops.map((s) => s._id);
    const productCounts = await Product.aggregate([
      { $match: { shopId: { $in: shopIds } } },
      { $group: { _id: "$shopId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    productCounts.forEach((pc) => countMap.set(toStr(pc._id), pc.count));

    const result = {
      shops: shops.map((shop) => ({
        ...shop,
        id: shop._id.toString(),
        productCount: countMap.get(shop._id.toString()) || 0,
        ownerId: populateToStr(shop.ownerId),
      })),
    };
    setCache(cacheKey, result, 15_000); // 15s cache
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
