import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Location } from "@/models/FeedPost";
import Shop from "@/models/Shop";
import { getCached, setCache } from "@/lib/cache";

function computeLocationStats(shops: Array<{ specialties?: string[]; rating?: number; totalReviews?: number; totalViews?: number }>) {
  let totalRating = 0;
  let ratedCount = 0;
  let totalViews = 0;
  const specialties = new Set<string>();
  for (const shop of shops) {
    if (shop.rating) { totalRating += shop.rating; ratedCount++; }
    totalViews += shop.totalViews || 0;
    for (const s of (shop.specialties || [])) specialties.add(s);
  }
  return {
    shopCount: shops.length,
    rating: ratedCount > 0 ? Math.round((totalRating / ratedCount) * 10) / 10 : 0,
    specialties: Array.from(specialties),
    totalViews,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get("slug");
    if (slug) {
      const location = await Location.findOne({ slug }).lean();
      if (!location) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }
      // Compute real data from shops
      const shops = await Shop.find({ locationId: slug })
        .select("specialties rating totalReviews totalViews")
        .lean();
      const computed = computeLocationStats(shops);
      return NextResponse.json({
        location: { ...location, id: location._id.toString(), ...computed },
      });
    }

    const id = searchParams.get("id");
    if (id) {
      const location = await Location.findById(id).lean();
      if (!location) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }
      // Compute real data from shops
      const shops = await Shop.find({ locationId: location._id.toString() })
        .select("specialties rating totalReviews totalViews")
        .lean();
      const computed = computeLocationStats(shops);
      return NextResponse.json({
        location: { ...location, id: location._id.toString(), ...computed },
      });
    }

    const search = searchParams.get("search");
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { specialties: { $regex: search, $options: "i" } },
      ];
    }

    const specialty = searchParams.get("specialty");
    if (specialty && specialty !== "all") {
      query.specialties = specialty;
    }

    const cacheKey = `loc:${JSON.stringify({ search, specialty })}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    const locations = await Location.find(query).sort({ name: 1 }).lean();

    // Compute real data from shops for each location
    const locationIds = locations.map((l) => l._id.toString());
    const locationSlugs = locations.map((l) => l.slug).filter(Boolean);
    const allIds = [...new Set([...locationIds, ...locationSlugs])];

    const shops = allIds.length > 0
      ? await Shop.find({ locationId: { $in: allIds } })
          .select("locationId specialties rating totalReviews totalViews")
          .lean()
      : [];

    // Build location stats from real shop data
    const statsMap = new Map<string, { shopCount: number; avgRating: number; specialties: string[]; totalViews: number; totalReviews: number }>();
    for (const shop of shops) {
      const locId = shop.locationId || "";
      const existing = statsMap.get(locId) || { shopCount: 0, avgRating: 0, specialties: [], totalViews: 0, totalReviews: 0 };
      existing.shopCount += 1;
      existing.totalViews += (shop as unknown as Record<string, unknown>).totalViews as number || 0;
      existing.totalReviews += shop.totalReviews || 0;
      if (shop.rating) {
        existing.avgRating = ((existing.avgRating * (existing.shopCount - 1)) + shop.rating) / existing.shopCount;
      }
      for (const spec of (shop.specialties || [])) {
        if (!existing.specialties.includes(spec)) existing.specialties.push(spec);
      }
      statsMap.set(locId, existing);
    }

    const result = {
      locations: locations.map((l) => {
        const stats = statsMap.get(l._id.toString()) || statsMap.get(l.slug) || { shopCount: 0, avgRating: 0, specialties: [], totalViews: 0, totalReviews: 0 };
        return {
          ...l,
          id: l._id.toString(),
          shopCount: stats.shopCount || l.shopCount || 0,
          rating: stats.avgRating ? Math.round(stats.avgRating * 10) / 10 : (l.rating || 0),
          specialties: stats.specialties.length > 0 ? stats.specialties : (l.specialties || []),
          totalViews: stats.totalViews,
        };
      }),
    };
    setCache(cacheKey, result, 30_000);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Locations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
