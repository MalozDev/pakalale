/**
 * Granular relative time formatter.
 * Returns: "Just now", "1m ago", "5m ago", "30m ago", "1h ago", "2h ago",
 * "Yesterday", "Mon", "Jan 5", "Jan 5, 2024"
 */
export function formatTimeAgo(timestamp: string | Date): string {
  const now = Date.now();
  const then = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp.getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return new Date(then).toLocaleDateString("en-US", { weekday: "short" });
  }

  const date = new Date(then);
  const currentYear = new Date().getFullYear();
  const postYear = date.getFullYear();

  if (postYear === currentYear) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Short format for chat list — shows time without "ago".
 * "Now", "5m", "2h", "Yesterday", "Mon", "Jan 5"
 */
export function formatTimeShort(timestamp: string | Date): string {
  const now = Date.now();
  const then = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp.getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "Now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;

  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return "Yesterday";

  const date = new Date(then);
  const currentYear = new Date().getFullYear();
  if (date.getFullYear() === currentYear) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Format last seen / last active time.
 * "Online", "Last seen 2m ago", "Last seen 3h ago", "Last seen yesterday"
 */
export function formatLastSeen(lastActiveAt?: string | Date | null, isOnline?: boolean): string {
  if (isOnline) return "Online";
  if (!lastActiveAt) return "";

  const now = Date.now();
  const then = typeof lastActiveAt === "string" ? new Date(lastActiveAt).getTime() : lastActiveAt.getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "Last seen just now";
  if (diffSec < 3600) return `Last seen ${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `Last seen ${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return "Last seen yesterday";
  return `Last seen ${formatTimeAgo(lastActiveAt)}`;
}
