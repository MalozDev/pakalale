import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Location } from "@/models/FeedPost";
import { getCached, setCache } from "@/lib/cache";

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
      return NextResponse.json({
        location: { ...location, id: location._id.toString() },
      });
    }

    const id = searchParams.get("id");
    if (id) {
      const location = await Location.findById(id).lean();
      if (!location) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }
      return NextResponse.json({
        location: { ...location, id: location._id.toString() },
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

    const locations = await Location.find(query).sort({ rating: -1 }).lean();
    const result = {
      locations: locations.map((l) => ({ ...l, id: l._id.toString() })),
    };
    setCache(cacheKey, result, 30_000); // 30s cache — locations rarely change
    return NextResponse.json(result);
  } catch (error) {
    console.error("Locations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
