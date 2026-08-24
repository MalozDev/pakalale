import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";

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
    const shopId = searchParams.get("shopId");

    if (!shopId) {
      return NextResponse.json({ error: "shopId is required" }, { status: 400 });
    }

    const shopObjectId = new mongoose.Types.ObjectId(shopId);

    const [
      totalProducts,
      totalViews,
      totalOrders,
      ordersByStatus,
      revenueAgg,
      recentOrders,
      topProducts,
      totalStock,
    ] = await Promise.all([
      Product.countDocuments({ shopId: shopObjectId }),

      Product.aggregate([
        { $match: { shopId: shopObjectId } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),

      Order.countDocuments({ shopId: shopObjectId }),

      Order.aggregate([
        { $match: { shopId: shopObjectId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Order.aggregate([
        { $match: { shopId: shopObjectId, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      Order.find({ shopId: shopObjectId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customerId", "firstName lastName")
        .populate("items.productId", "name")
        .lean(),

      Product.find({ shopId: shopObjectId })
        .sort({ views: -1 })
        .limit(5)
        .lean(),

      Product.aggregate([
        { $match: { shopId: shopObjectId } },
        { $group: { _id: null, total: { $sum: "$stock" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const orderCount = revenueAgg[0]?.count || 0;
    const avgOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;
    const viewsCount = (totalViews[0]?.total as number) || 0;
    const conversionRate = viewsCount > 0 ? ((totalOrders / viewsCount) * 100).toFixed(1) : "0";

    const statusMap: Record<string, number> = {};
    ordersByStatus.forEach((s) => { statusMap[s._id] = s.count; });

    return NextResponse.json({
      stats: {
        totalProducts,
        totalViews: viewsCount,
        totalOrders,
        totalRevenue,
        avgOrderValue,
        conversionRate: parseFloat(conversionRate),
        totalStock: totalStock[0]?.total || 0,
      },
      ordersByStatus: statusMap,
      recentOrders: recentOrders.map((o) => {
        const cust = o.customerId as unknown as Record<string, unknown> | null;
        const customerName = cust && "firstName" in cust
          ? `${cust.firstName} ${cust.lastName}`
          : "Unknown";

        const productNames = o.items.map((item) => {
          const prod = item.productId as unknown as Record<string, unknown> | null;
          return (prod?.name as string) || "Product";
        }).join(", ");

        return {
          id: o._id.toString(),
          customer: customerName,
          products: productNames,
          total: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt,
        };
      }),
      topProducts: topProducts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        views: p.views,
        stock: p.stock,
        rating: p.rating,
        reviews: p.reviews,
      })),
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
