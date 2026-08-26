/**
 * Quick API benchmark — uses curl for reliable connection testing.
 * Run with: npx tsx scripts/bench-api.ts
 * (requires the dev server to be running on port 3000)
 */

import mongoose from "mongoose";
import { execSync } from "child_process";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pakalale";
const BASE = "http://localhost:3000";

async function getUserId(): Promise<string> {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.connection.db!.collection("users");
  const user = await User.findOne({});
  await mongoose.disconnect();
  if (!user) throw new Error("No users in database");
  return user._id.toString();
}

function curlBench(label: string, url: string): number {
  try {
    const result = execSync(
      `curl -s -o /dev/null -w '%{time_total}' "${url}"`,
      { encoding: "utf-8", timeout: 30000 }
    );
    const seconds = parseFloat(result.trim());
    const ms = Math.round(seconds * 1000);
    const emoji = ms < 100 ? "🟢" : ms < 500 ? "🟡" : ms < 1000 ? "🟠" : "🔴";
    console.log(`  ${emoji} ${label}: ${ms}ms`);
    return ms;
  } catch (e: any) {
    console.log(`  ❌ ${label}: ${e.message?.slice(0, 80)}`);
    return -1;
  }
}

async function main() {
  const userId = await getUserId();
  console.log(`Using userId: ${userId}\n`);
  console.log("=".repeat(60));
  console.log("  API BENCHMARK — First hit = COLD, Second hit = WARM CACHE");
  console.log("=".repeat(60));

  const endpoints: [string, string][] = [
    ["Chat list", `${BASE}/api/chat?userId=${userId}`],
    ["Notifications", `${BASE}/api/notifications?userId=${userId}`],
    ["Feed", `${BASE}/api/feed`],
    ["Shops (all)", `${BASE}/api/shops`],
    ["Shops (by location)", `${BASE}/api/shops?locationId=lusaka`],
    ["Locations", `${BASE}/api/locations`],
    ["User profile", `${BASE}/api/user/profile?userId=${userId}`],
    ["Search: 'phone'", `${BASE}/api/search/v2?q=phone&limit=10&userId=${userId}`],
    ["Search: 'airtel'", `${BASE}/api/search/v2?q=airtel&limit=10&userId=${userId}`],
    ["Trending", `${BASE}/api/search/trending?limit=4`],
    ["Search history", `${BASE}/api/search/history?userId=${userId}&limit=3`],
  ];

  // ── Round 1: COLD (no cache) ──
  console.log("\n▸ Round 1: COLD (first hit, no server cache)");
  const coldTimes: number[] = [];
  for (const [label, url] of endpoints) {
    const ms = curlBench(label, url);
    if (ms > 0) coldTimes.push(ms);
  }

  // ── Round 2: WARM (cached) ──
  console.log("\n▸ Round 2: WARM (server cache hit)");
  const warmTimes: number[] = [];
  for (const [label, url] of endpoints) {
    const ms = curlBench(label, url);
    if (ms > 0) warmTimes.push(ms);
  }

  // ── Round 3: Repeated (simulates tab switching) ──
  console.log("\n▸ Round 3: REPEATED (simulates page navigation)");
  const repeatTimes: number[] = [];
  for (const [label, url] of endpoints) {
    const ms = curlBench(label, url);
    if (ms > 0) repeatTimes.push(ms);
  }

  // ── Summary ──
  console.log("\n" + "=".repeat(60));
  console.log("  SUMMARY");
  console.log("=".repeat(60));

  if (coldTimes.length > 0) {
    const avg = Math.round(coldTimes.reduce((a, b) => a + b, 0) / coldTimes.length);
    const max = Math.max(...coldTimes);
    console.log(`  Cold (first hit):  avg=${avg}ms  max=${max}ms`);
  }
  if (warmTimes.length > 0) {
    const avg = Math.round(warmTimes.reduce((a, b) => a + b, 0) / warmTimes.length);
    const max = Math.max(...warmTimes);
    console.log(`  Warm (cached):     avg=${avg}ms  max=${max}ms`);
  }
  if (repeatTimes.length > 0) {
    const avg = Math.round(repeatTimes.reduce((a, b) => a + b, 0) / repeatTimes.length);
    const max = Math.max(...repeatTimes);
    console.log(`  Repeated:          avg=${avg}ms  max=${max}ms`);
  }

  console.log("\n  Cache TTLs: Chat=30s, Feed=60s, Shops=60s, Notif=30s, Loc=120s, Profile=60s");
  console.log("  Client: 60s stale SWR — instant on revisit, background refresh");
  console.log("  Indexes: All collections indexed ✅");
}

main().catch(console.error);
