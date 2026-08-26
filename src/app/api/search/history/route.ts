import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const history = await SearchHistory.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      history: history.map((h) => ({
        id: h._id.toString(),
        query: h.query,
        resultCount: h.resultCount,
        locationId: h.locationId,
        timestamp: h.timestamp,
      })),
    });
  } catch (error) {
    console.error("Search History GET error:", error);
    return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, query, resultCount, locationId } = body;

    if (!userId || !query) {
      return NextResponse.json({ error: "userId and query are required" }, { status: 400 });
    }

    const record = await SearchHistory.create({
      userId: new mongoose.Types.ObjectId(userId),
      query,
      resultCount: resultCount || 0,
      locationId,
    });

    return NextResponse.json({ id: record._id.toString() }, { status: 201 });
  } catch (error) {
    console.error("Search History POST error:", error);
    return NextResponse.json({ error: "Failed to record search" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await SearchHistory.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Search History DELETE error:", error);
    return NextResponse.json({ error: "Failed to clear search history" }, { status: 500 });
  }
}
