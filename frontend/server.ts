import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Track online users
  const onlineUsers = new Map<string, Set<string>>(); // chatId -> Set of userIds
  const userSockets = new Map<string, string>(); // userId -> socketId

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // User joins with their userId
    socket.on("register", (userId: string) => {
      userSockets.set(userId, socket.id);
      console.log(`👤 User registered: ${userId} -> ${socket.id}`);
    });

    // User joins a chat room
    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
      const userId = Array.from(userSockets.entries()).find(([, sid]) => sid === socket.id)?.[0];
      if (userId) {
        if (!onlineUsers.has(chatId)) onlineUsers.set(chatId, new Set());
        onlineUsers.get(chatId)!.add(userId);
        io.to(chatId).emit("user_joined", { userId, chatId });
        console.log(`💬 User ${userId} joined chat ${chatId}`);
      }
    });

    // User leaves a chat room
    socket.on("leave_chat", (chatId: string) => {
      socket.leave(chatId);
      const userId = Array.from(userSockets.entries()).find(([, sid]) => sid === socket.id)?.[0];
      if (userId) {
        onlineUsers.get(chatId)?.delete(userId);
        io.to(chatId).emit("user_left", { userId, chatId });
        console.log(`🚪 User ${userId} left chat ${chatId}`);
      }
    });

    // New message sent — broadcast to OTHER users only (not the sender)
    socket.on("send_message", (data: {
      chatId: string;
      senderId: string;
      senderName: string;
      senderRole: string;
      content: string;
      type: string;
      timestamp: string;
      id: string;
    }) => {
      socket.to(data.chatId).emit("new_message", data);
      console.log(`📨 Message in ${data.chatId} from ${data.senderName}: ${data.content}`);
    });

    // Typing indicator
    socket.on("typing", (data: { chatId: string; userId: string; userName: string }) => {
      socket.to(data.chatId).emit("user_typing", data);
    });

    socket.on("stop_typing", (data: { chatId: string; userId: string }) => {
      socket.to(data.chatId).emit("user_stop_typing", data);
    });

    // Get online users in a chat
    socket.on("get_online_users", (chatId: string) => {
      const users = Array.from(onlineUsers.get(chatId) || []);
      socket.emit("online_users", { chatId, users });
    });

    // Disconnect
    socket.on("disconnect", () => {
      const userId = Array.from(userSockets.entries()).find(([, sid]) => sid === socket.id)?.[0];
      if (userId) {
        userSockets.delete(userId);
        // Remove from all chat rooms
        onlineUsers.forEach((users, chatId) => {
          if (users.delete(userId)) {
            io.to(chatId).emit("user_left", { userId, chatId });
          }
        });
        console.log(`👤 User disconnected: ${userId}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on same port`);
  });
});
