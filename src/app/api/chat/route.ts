import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Chat, Message } from "@/models/Message";
import { getCached, setCache, invalidateCache } from "@/lib/cache";

function toStr(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id: unknown })._id);
  }
  return String(val);
}

function populateParticipant(val: unknown): { id: string; name?: string; avatar?: string; role?: string } {
  if (!val) return { id: "" };
  if (typeof val === "string") return { id: val };
  if (typeof val === "object" && val !== null && "_id" in val) {
    const obj = val as Record<string, unknown>;
    return {
      id: String(obj._id),
      name: obj.firstName ? `${obj.firstName} ${obj.lastName}` : undefined,
      avatar: obj.avatar as string | undefined,
      role: obj.role as string | undefined,
    };
  }
  return { id: String(val) };
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const chatId = searchParams.get("chatId");

    if (chatId) {
      const cacheKey = `chat:messages:${chatId}`;
      const cached = getCached(cacheKey);
      if (cached) return NextResponse.json(cached);

      const messages = await Message.find({ chatId })
        .sort({ timestamp: 1 })
        .lean();

      const result = {
        messages: messages.map((m) => ({
          ...m,
          id: m._id.toString(),
          chatId: toStr(m.chatId),
          senderId: toStr(m.senderId),
        })),
      };
      setCache(cacheKey, result, 5_000); // 5s cache
      return NextResponse.json(result);
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const listCacheKey = `chat:list:${userId}`;
    const cachedList = getCached(listCacheKey);
    if (cachedList) return NextResponse.json(cachedList);

    const chats = await Chat.find({ participants: userId, isActive: true })
      .sort({ lastMessageTime: -1 })
      .populate("participants", "firstName lastName avatar role")
      .populate("lastMessage")
      .lean();

    // Get unread counts for each chat
    const chatIds = chats.map((c) => c._id);
    const unreadCounts = await Message.aggregate([
      { $match: { chatId: { $in: chatIds }, senderId: { $ne: new mongoose.Types.ObjectId(userId) }, isRead: false } },
      { $group: { _id: "$chatId", count: { $sum: 1 } } },
    ]);
    const unreadMap = new Map<string, number>();
    unreadCounts.forEach((u) => unreadMap.set(toStr(u._id), u.count));
    const totalUnread = unreadCounts.reduce((sum, u) => sum + u.count, 0);

    const result = {
      chats: chats.map((chat) => {
        const participants = (chat.participants || []).map((p) => populateParticipant(p));
        const otherParticipant = participants.find((p) => p.id !== userId) || null;

        let lastMsg = null;
        if (chat.lastMessage && typeof chat.lastMessage === "object" && "content" in chat.lastMessage) {
          const msg = chat.lastMessage as unknown as Record<string, unknown>;
          lastMsg = {
            id: toStr(msg._id),
            content: msg.content,
            senderId: toStr(msg.senderId),
            timestamp: msg.timestamp,
          };
        }

        return {
          id: chat._id.toString(),
          type: chat.type,
          participants,
          otherParticipant,
          lastMessage: lastMsg,
          lastMessageTime: chat.lastMessageTime,
          unreadCount: unreadMap.get(toStr(chat._id)) || 0,
          dealInfo: chat.dealInfo,
          isActive: chat.isActive,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      }),
      totalUnread,
    };
    setCache(listCacheKey, result, 5_000);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Invalidate chat caches when messages are sent
    if (body.senderId) invalidateCache(`chat:list:${body.senderId}`);
    if (body.chatId) invalidateCache(`chat:messages:${body.chatId}`);

    if (body.chatId && body.content) {
      const messageData: Record<string, unknown> = {
        chatId: body.chatId,
        senderId: body.senderId,
        senderName: body.senderName,
        senderRole: body.senderRole,
        content: body.content,
        type: body.type || "text",
        timestamp: new Date(),
        isRead: false,
        readBy: [],
      };
      if (body.replyTo) {
        messageData.replyTo = body.replyTo;
      }
      const message = await Message.create(messageData);

      await Chat.findByIdAndUpdate(body.chatId, {
        lastMessage: message._id,
        lastMessageTime: new Date(),
      });

      return NextResponse.json({
        message: {
          ...message.toObject(),
          id: message._id.toString(),
          chatId: toStr(message.chatId),
          senderId: toStr(message.senderId),
        },
      }, { status: 201 });
    }

    const chat = await Chat.create({
      type: body.type || "general",
      participants: body.participants,
      dealInfo: body.dealInfo,
      lastMessageTime: new Date(),
      isActive: true,
    });

    return NextResponse.json({
      chat: {
        ...chat.toObject(),
        id: chat._id.toString(),
        participants: chat.participants.map((p) => toStr(p)),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Failed to create chat/message" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, messageId, chatId, senderId, content } = body;

    if (action === "markRead" && chatId && senderId) {
      // Mark all messages in this chat as read (except from sender)
      await Message.updateMany(
        { chatId, senderId: { $ne: senderId }, isRead: false },
        { $set: { isRead: true }, $addToSet: { readBy: senderId } }
      );
      return NextResponse.json({ success: true });
    }

    if (action === "edit" && messageId && content) {
      const msg = await Message.findById(messageId);
      if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 });
      msg.content = content;
      await msg.save();
      return NextResponse.json({ message: { ...msg.toObject(), id: msg._id.toString() } });
    }

    if (action === "delete" && messageId) {
      await Message.findByIdAndDelete(messageId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Chat PUT error:", error);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}
