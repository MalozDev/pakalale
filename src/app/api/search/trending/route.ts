import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";
import { getCached, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const days = parseInt(searchParams.get("days") || "7");

    const cacheKey = `trending:${limit}:${days}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Aggregate trending searches — only include queries that returned results
    const trending = await SearchHistory.aggregate([
      { $match: { timestamp: { $gte: since }, resultCount: { $gt: 0 } } },
      { $group: { _id: { $toLower: "$query" }, count: { $sum: 1 }, lastSearched: { $max: "$timestamp" } } },
      { $sort: { count: -1, lastSearched: -1 } },
      { $limit: limit },
    ]);

    const result = {
      trending: trending.map((t) => ({
        query: t._id,
        count: t.count,
        lastSearched: t.lastSearched,
      })),
    };
    setCache(cacheKey, result, 30_000); // 30s cache
    return NextResponse.json(result);
  } catch (error) {
    console.error("Trending GET error:", error);
    return NextResponse.json({ error: "Failed to fetch trending searches" }, { status: 500 });
  }
}
