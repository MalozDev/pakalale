import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

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

    const shopId = searchParams.get("shopId");
    if (shopId) query.shopId = shopId;

    const customerId = searchParams.get("customerId");
    if (customerId) query.customerId = customerId;

    const status = searchParams.get("status");
    if (status && status !== "all") query.status = status;

    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const orders = await Order.find(query)
      .sort({ [sort]: order })
      .populate("customerId", "firstName lastName email")
      .populate("shopId", "name")
      .populate("items.productId", "name images")
      .lean();

    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        id: o._id.toString(),
        customerId: populateToStr(o.customerId),
        shopId: populateToStr(o.shopId),
        items: o.items.map((item) => ({
          ...item,
          productId: populateToStr(item.productId),
        })),
      })),
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const order = await Order.create(body);
    return NextResponse.json({ order: { ...order.toObject(), id: order._id.toString() } }, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: { ...order, id: order._id.toString() } });
  } catch (error) {
    console.error("Orders PUT error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
