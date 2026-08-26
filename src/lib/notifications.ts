import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { invalidateCache } from "@/lib/cache";

/**
 * Create a notification for a user.
 * Call this from any API route to send notifications.
 */
export async function createNotification(data: {
  userId: string;
  type: "deal" | "message" | "review" | "shop" | "order" | "system";
  title: string;
  message: string;
  actionUrl?: string;
  relatedId?: string;
}) {
  try {
    await connectToDatabase();
    const notif = await Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl || undefined,
      relatedId: data.relatedId || undefined,
      isRead: false,
    });
    invalidateCache(`notif:${data.userId}`);
    return notif;
  } catch (e) {
    console.error("Failed to create notification:", e);
    return null;
  }
}

/**
 * Bulk create notifications for multiple users.
 * Useful for notifying all shop owners in an area.
 */
export async function createBulkNotifications(
  userIds: string[],
  data: {
    type: "deal" | "message" | "review" | "shop" | "order" | "system";
    title: string;
    message: string;
    actionUrl?: string;
    relatedId?: string;
  }
) {
  try {
    await connectToDatabase();
    const docs = userIds.map((userId) => ({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl || undefined,
      relatedId: data.relatedId || undefined,
      isRead: false,
    }));
    await Notification.insertMany(docs);
    userIds.forEach((uid) => invalidateCache(`notif:${uid}`));
  } catch (e) {
    console.error("Failed to create bulk notifications:", e);
  }
}
