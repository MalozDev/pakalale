import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Location } from "@/models/FeedPost";

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

    const locations = await Location.find(query).sort({ rating: -1 }).lean();
    return NextResponse.json({
      locations: locations.map((l) => ({ ...l, id: l._id.toString() })),
    });
  } catch (error) {
    console.error("Locations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
