import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Shop from "@/models/Shop";
import { FeedPost } from "@/models/FeedPost";
import ProductView from "@/models/ProductView";
import FeedEvent from "@/models/FeedEvent";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { type, targetId, userId, source } = body;

    if (!type || !targetId) {
      return NextResponse.json({ error: "type and targetId are required" }, { status: 400 });
    }

    switch (type) {
      case "product_view": {
        // Increment product view count
        await Product.findByIdAndUpdate(targetId, { $inc: { views: 1 } });
        // Record in ProductView collection for analytics
        if (userId) {
          await ProductView.create({
            productId: targetId,
            userId,
            source: source || "direct",
            timestamp: new Date(),
          });
        }
        break;
      }

      case "shop_view": {
        // Increment shop view count
        await Shop.findByIdAndUpdate(targetId, { $inc: { totalViews: 1 } });
        break;
      }

      case "feed_view": {
        // Record feed post view for engagement tracking
        if (userId) {
          await FeedEvent.create({
            userId,
            postId: targetId,
            eventType: "view",
            timestamp: new Date(),
          });
        }
        break;
      }

      case "feed_click": {
        if (userId) {
          await FeedEvent.create({
            userId,
            postId: targetId,
            eventType: "click",
            metadata: body.metadata || {},
            timestamp: new Date(),
          });
        }
        break;
      }

      case "feed_share": {
        // Increment share count on the post
        await FeedPost.findByIdAndUpdate(targetId, { $inc: { shares: 1 } });
        if (userId) {
          await FeedEvent.create({
            userId,
            postId: targetId,
            eventType: "share",
            timestamp: new Date(),
          });
        }
        break;
      }

      case "feed_deal": {
        if (userId) {
          await FeedEvent.create({
            userId,
            postId: targetId,
            eventType: "deal",
            metadata: body.metadata || {},
            timestamp: new Date(),
          });
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid track type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track POST error:", error);
    return NextResponse.json({ success: true }); // Silent fail — tracking should never block UX
  }
}
