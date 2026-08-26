import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Shop from "@/models/Shop";
import { FeedPost, Location } from "@/models/FeedPost";
import SearchHistory from "@/models/SearchHistory";
import { getCached, setCache } from "@/lib/cache";

function toStr(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val instanceof mongoose.Types.ObjectId) return val.toString();
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id: unknown })._id);
  }
  return String(val);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Simple keyword extraction (Phase 1 — no LLM needed)
function extractKeywords(query: string): {
  tokens: string[];
  brands: string[];
  colors: string[];
  category: string | null;
  priceMax: number | null;
} {
  const lower = query.toLowerCase();
  const tokens = lower.split(/\s+/).filter((t) => t.length > 1);

  const knownBrands = [
    "samsung", "apple", "iphone", "tecno", "hp", "lenovo", "dell", "sony",
    "jbl", "nike", "adidas", "puma", " under armour", "new balance",
    "canon", "nikon", "panasonic", "lg", "xiaomi", "huawei", "infinix",
    "playstation", "xbox", "nintendo", "logitech", "anker",
  ];
  const knownColors = [
    "black", "white", "red", "blue", "green", "yellow", "pink", "purple",
    "orange", "grey", "gray", "brown", "gold", "silver", "navy", "beige",
    "teal", "olive", "khaki", "coral", "maroon", "turquoise",
  ];
  const categoryMap: Record<string, string> = {
    phone: "Mobile Phones", smartphones: "Mobile Phones", mobile: "Mobile Phones",
    laptop: "Laptops", computers: "Laptops", pc: "Laptops",
    headphone: "Accessories", headphones: "Accessories", earphone: "Accessories",
    tv: "Electronics", television: "Electronics", speaker: "Electronics",
    shoe: "Shoes", shoes: "Shoes", sneakers: "Shoes", boots: "Shoes",
    dress: "Women's Wear", skirt: "Women's Wear", blouse: "Women's Wear",
    shirt: "Men's Wear", trouser: "Men's Wear", pants: "Men's Wear", jacket: "Outerwear",
    sofa: "Living Room", bed: "Bedroom", table: "Dining", chair: "Accessories",
    tomato: "Vegetables", vegetable: "Vegetables", fruit: "Fruits", mango: "Fruits",
    avocado: "Fruits", banana: "Fruits", egg: "Dairy & Eggs",
    medicine: "Medicine", vitamin: "Vitamins", diaper: "Baby Care",
    console: "Consoles", game: "Games", gaming: "PC Gaming",
    watch: "Accessories", bag: "Accessories", handbag: "Accessories",
    fan: "Appliances", microwave: "Appliances",
    mouse: "PC Gaming", keyboard: "PC Gaming",
    sunscreen: "Skincare", skincare: "Skincare",
    cream: "Skincare", face: "Skincare", moisturizer: "Skincare",
    lotion: "Skincare", cleanser: "Skincare", serum: "Skincare",
    soap: "Skincare", body: "Skincare", hair: "Skincare",
    oil: "Skincare", perfume: "Skincare", fragrance: "Skincare",
    makeup: "Skincare", lipstick: "Skincare",
  };

  const brands = tokens.filter((t) => knownBrands.some((b) => b.includes(t) || t.includes(b)));
  const colors = tokens.filter((t) => knownColors.includes(t));
  
  let category: string | null = null;
  for (const [key, val] of Object.entries(categoryMap)) {
    if (tokens.some((t) => t.includes(key) || key.includes(t))) {
      category = val;
      break;
    }
  }

  // Extract price constraints
  let priceMax: number | null = null;
  const priceMatch = lower.match(/(?:under|below|less than|max|up to|cheaper than|less than)\s*(?:k|kwacha)?\s*(\d[\d,]*)/i);
  if (priceMatch) {
    priceMax = parseInt(priceMatch[1].replace(/,/g, ""));
  }
  // Also match "K500" or "K 500" patterns
  const priceMatch2 = lower.match(/k\s*(\d[\d,]*)/i);
  if (!priceMax && priceMatch2) {
    priceMax = parseInt(priceMatch2[1].replace(/,/g, ""));
  }

  return { tokens, brands, colors, category, priceMax };
}

// Score a product against the search query
function scoreProduct(
  product: Record<string, unknown>,
  keywords: ReturnType<typeof extractKeywords>,
  userLat?: number,
  userLng?: number,
  shopCoords?: { lat: number; lng: number }
): number {
  let score = 0;
  const name = String(product.name || "").toLowerCase();
  const desc = String(product.description || "").toLowerCase();
  const tags = (product.tags as string[] || []).map((t) => t.toLowerCase());
  const category = String(product.category || "").toLowerCase();
  const brand = String(product.brand || "").toLowerCase();

  // Text relevance (0-40 points)
  for (const token of keywords.tokens) {
    if (name.includes(token)) score += 15;
    if (tags.some((t) => t.includes(token))) score += 10;
    if (desc.includes(token)) score += 5;
    if (category.includes(token)) score += 8;
    if (brand.includes(token)) score += 12;
  }

  // Brand match bonus
  if (keywords.brands.length > 0) {
    const brandMatch = keywords.brands.some((b) => name.includes(b) || brand.includes(b));
    if (brandMatch) score += 20;
  }

  // Color match bonus
  if (keywords.colors.length > 0) {
    const colorMatch = keywords.colors.some((c) => name.includes(c) || desc.includes(c) || tags.some((t) => t.includes(c)));
    if (colorMatch) score += 10;
  }

  // Category match bonus
  if (keywords.category && category.includes(keywords.category.toLowerCase())) {
    score += 15;
  }

  // Availability (0-15 points)
  if (product.isAvailable && (product.stock as number) > 0) {
    score += 15;
    if ((product.stock as number) > 10) score += 3;
  } else if ((product.stock as number) > 0) {
    score += 5;
  }
  // Out of stock = 0 availability bonus

  // Popularity (0-10 points)
  const views = product.views as number || 0;
  const reviews = product.reviews as number || 0;
  const rating = product.rating as number || 0;
  score += Math.min(5, views / 100);
  score += Math.min(3, reviews / 20);
  score += Math.min(2, (rating / 5) * 2);

  // Price constraint match
  if (keywords.priceMax !== null) {
    const price = product.price as number;
    if (price <= keywords.priceMax) {
      score += 10;
    } else {
      // Penalize over-budget results
      score -= Math.min(10, (price - keywords.priceMax) / keywords.priceMax * 10);
    }
  }

  // Distance (0-10 points)
  if (userLat && userLng && shopCoords?.lat && shopCoords?.lng) {
    const R = 6371; // Earth radius in km
    const dLat = (shopCoords.lat - userLat) * Math.PI / 180;
    const dLng = (shopCoords.lng - userLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLat * Math.PI / 180) * Math.cos(shopCoords.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    score += Math.max(0, 10 - dist * 0.5); // Lose 0.5 points per km
  }

  // Promotion boost
  if ((product.discount as number) > 0) {
    score += Math.min(5, (product.discount as number) / 5);
  }

  // Recency (0-5 points)
  const createdAt = new Date(product.createdAt as string);
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 7) score += 5;
  else if (daysSinceCreation < 30) score += 3;
  else if (daysSinceCreation < 90) score += 1;

  return score;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
    const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
    const locationId = searchParams.get("locationId");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = searchParams.get("userId");

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ products: [], shops: [], locations: [], totalCount: 0 });
    }

    const searchCacheKey = `search:${q}:${locationId || ""}:${category || ""}:${page}:${limit}`;
    const cachedSearch = getCached(searchCacheKey);
    if (cachedSearch) return NextResponse.json(cachedSearch);

    const keywords = extractKeywords(q);

    // Build product query
    const productQuery: Record<string, unknown> = {};

    // Use $text search if available, otherwise fall back to regex
    if (keywords.tokens.length > 0) {
      const escapedTokens = keywords.tokens.map(escapeRegex);
      const tokenPattern = escapedTokens.join("|");
      productQuery.$or = [
        { name: { $regex: tokenPattern, $options: "i" } },
        { description: { $regex: tokenPattern, $options: "i" } },
        { tags: { $regex: tokenPattern, $options: "i" } },
        { category: { $regex: tokenPattern, $options: "i" } },
        { brand: { $regex: tokenPattern, $options: "i" } },
      ];
    }

    if (keywords.category) {
      productQuery.category = { $regex: keywords.category, $options: "i" };
    }

    if (category && category !== "all") {
      productQuery.category = category;
    }

    // Fetch candidates (more than needed for ranking)
    const candidates = await Product.find(productQuery)
      .populate("shopId", "name locationId rating coordinates specialties contact")
      .lean();

    // Score and rank products
    const scoredProducts = candidates.map((p) => {
      const shopObj = p.shopId as unknown as Record<string, unknown> | null;
      const shopCoords = shopObj?.coordinates as { lat: number; lng: number } | undefined;
      const pRecord = p as unknown as Record<string, unknown>;
      return {
        ...p,
        id: p._id.toString(),
        shopId: shopObj ? { id: String(shopObj._id), name: shopObj.name, locationId: shopObj.locationId, rating: shopObj.rating, phone: (shopObj.contact as Record<string, unknown>)?.phone } : p.shopId,
        score: scoreProduct(pRecord, keywords, userLat, userLng, shopCoords),
      };
    });

    scoredProducts.sort((a, b) => b.score - a.score);

    const totalProducts = scoredProducts.length;
    const paginatedProducts = scoredProducts.slice((page - 1) * limit, page * limit);

    // Search shops
    const shopQuery: Record<string, unknown> = {};
    if (keywords.tokens.length > 0) {
      const escapedTokens = keywords.tokens.map(escapeRegex);
      const tokenPattern = escapedTokens.join("|");
      shopQuery.$or = [
        { name: { $regex: tokenPattern, $options: "i" } },
        { description: { $regex: tokenPattern, $options: "i" } },
        { specialties: { $regex: tokenPattern, $options: "i" } },
      ];
    }
    if (locationId) shopQuery.locationId = locationId;

    // Only search shops if there are matching products — no point showing shops that don't carry the item
    const shops = totalProducts > 0
      ? await Shop.find(shopQuery).limit(10).populate("ownerId", "firstName lastName").lean()
      : [];

    // Search locations
    const locationQuery: Record<string, unknown> = {};
    if (keywords.tokens.length > 0) {
      const escapedTokens = keywords.tokens.map(escapeRegex);
      const tokenPattern = escapedTokens.join("|");
      locationQuery.$or = [
        { name: { $regex: tokenPattern, $options: "i" } },
        { description: { $regex: tokenPattern, $options: "i" } },
        { specialties: { $regex: tokenPattern, $options: "i" } },
      ];
    }

    const locations = await Location.find(locationQuery).limit(5).lean();

    // Search feed posts
    const feedQuery: Record<string, unknown> = {};
    if (keywords.tokens.length > 0) {
      const escapedTokens = keywords.tokens.map(escapeRegex);
      feedQuery.content = { $regex: escapedTokens.join("|"), $options: "i" };
    }
    const feedPosts = await FeedPost.find(feedQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("authorId", "firstName lastName avatar role")
      .lean();

    // Track search history if userId provided
    if (userId) {
      SearchHistory.create({
        userId: new mongoose.Types.ObjectId(userId),
        query: q,
        resultCount: totalProducts,
        locationId: locationId || undefined,
      }).catch(() => {}); // Fire and forget
    }

    const result = {
      products: paginatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description?.slice(0, 200),
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        category: p.category,
        brand: p.brand,
        color: p.color,
        stock: p.stock,
        isAvailable: p.isAvailable,
        rating: p.rating,
        reviews: p.reviews,
        views: p.views,
        tags: p.tags,
        shopId: p.shopId,
        score: Math.round(p.score * 100) / 100,
        createdAt: p.createdAt,
      })),
      shops: shops.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description?.slice(0, 150),
        specialties: s.specialties,
        rating: s.rating,
        totalReviews: s.totalReviews,
        locationId: s.locationId,
        status: s.status,
        phone: s.contact?.phone || "",
      })),
      locations: locations.map((l) => ({
        id: l._id.toString(),
        name: l.name,
        slug: l.slug,
        description: l.description?.slice(0, 150),
        specialties: l.specialties,
        shopCount: l.shopCount,
      })),
      posts: feedPosts.map((fp) => {
        const authorObj = fp.authorId as unknown as Record<string, unknown> | null;
        const hasAuthor = authorObj && typeof authorObj === "object" && "firstName" in authorObj;
        return {
          id: fp._id.toString(),
          content: fp.content,
          author: hasAuthor ? { id: String(authorObj._id), name: `${authorObj.firstName} ${authorObj.lastName}`, role: authorObj.role } : null,
          likes: fp.likes?.length || 0,
          commentsCount: fp.comments?.length || 0,
          isPromotion: fp.isPromotion,
          postType: fp.postType || "general",
          product: fp.product ? { name: fp.product.name, price: fp.product.price, shopId: toStr(fp.product.shopId) } : undefined,
          createdAt: fp.createdAt,
        };
      }),
      totalCount: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      keywords: {
        query: q,
        tokens: keywords.tokens,
        brands: keywords.brands,
        colors: keywords.colors,
        category: keywords.category,
        priceMax: keywords.priceMax,
      },
    };
    setCache(searchCacheKey, result, 15_000); // 15s cache
    return NextResponse.json(result);
  } catch (error) {
    console.error("Search v2 GET error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
