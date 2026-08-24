import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Shop from "@/models/Shop";
import { Location } from "@/models/FeedPost";

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
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ products: [], shops: [], locations: [] });
    }

    const regex = { $regex: q, $options: "i" };

    const [products, shops, locations] = await Promise.all([
      Product.find({
        $or: [
          { name: regex },
          { description: regex },
          { category: regex },
          { tags: regex },
        ],
        isAvailable: true,
      })
        .limit(10)
        .populate("shopId", "name locationId rating")
        .lean(),

      Shop.find({
        $or: [
          { name: regex },
          { description: regex },
          { specialties: regex },
        ],
      })
        .limit(10)
        .lean(),

      Location.find({
        $or: [
          { name: regex },
          { description: regex },
          { specialties: regex },
        ],
      })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      products: products.map((p) => {
        const shopObj = p.shopId as unknown as Record<string, unknown> | null;
        const shopName = shopObj && "name" in shopObj ? String(shopObj.name) : "";
        return {
          id: p._id.toString(),
          name: p.name,
          price: p.price,
          category: p.category,
          shopName,
          shopId: toStr(p.shopId),
        };
      }),
      shops: shops.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description?.slice(0, 100),
        specialties: s.specialties,
        rating: s.rating,
        locationId: s.locationId,
      })),
      locations: locations.map((l) => ({
        id: l._id.toString(),
        name: l.name,
        slug: l.slug,
        description: l.description?.slice(0, 100),
        specialties: l.specialties,
        shopCount: l.shopCount,
      })),
    });
  } catch (error) {
    console.error("Search GET error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
