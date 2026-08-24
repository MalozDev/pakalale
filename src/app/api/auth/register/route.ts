import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Shop from "@/models/Shop";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, password, firstName, lastName, role, phone, location, shop } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      phone: phone || "",
      location: location || "",
      isVerified: false,
    });

    // If shop owner, create the shop (not verified by default)
    let shopData = null;
    if (role === "shop_owner" && shop) {
      shopData = await Shop.create({
        name: shop.name,
        description: shop.description,
        ownerId: user._id,
        locationId: shop.locationId || "",
        status: "pending", // NOT verified by default
        contact: {
          phone: phone || "",
          email: email,
          whatsapp: phone || "",
        },
        specialties: shop.specialties || [],
        hours: {},
        images: [],
        totalReviews: 0,
      });
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        shop: shopData ? { id: shopData._id.toString(), name: shopData.name } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
