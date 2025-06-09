import express from "express";
import cookieParser from "cookie-parser";
import createHttpError from "http-errors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import morgan from "morgan";
import env from "./utils/validateEnv.js";
import passport from "passport";
import "./config/passport.js";
import { Server } from "socket.io";
import cors from "cors";
import Email from "./utils/email.js";
import Document from "./models/Document.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
if (process.env.NODE_ENV === "production") {
  app.use(morgan("tiny"));
}

connectDB();

app.get("/", (req, res) => {
  res.send("Music Streaming API is running...");
});

app.get("/test-email", async (req, res) => {
  const user = { email: "narlasrikar@gmail.com", name: "Srikar Narla" };
  const resetUrl = "https://yourdomain.com/reset-password/testpin";

  try {
    await new Email(user, resetUrl).sendPasswordReset();
    res.send("✅ Email sent!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to send email");
  }
});

app.use("/api/users", userRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/docs", documentRoutes);

app.all("*", (req, res, next) => {
  next(createHttpError(404, `Cannot find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const userSocketMap = {};
let onlineUsers = [];
const videoRooms = {};
const DEFAULT_CONTENT = "";

function logVideoRooms() {
  console.log("📹 Current video rooms and users:");
  for (const roomId in videoRooms) {
    const users = Object.values(videoRooms[roomId]).map(
      (user) => user.name || user._id || "Unknown"
    );
    console.log(`Room ${roomId}:`, users);
  }
}

io.on("connection", (socket) => {
  console.log("⚡ New socket connection:", socket.id);

  socket.on("setup", (userData) => {
    socket.userId = userData._id;
    userSocketMap[userData._id] = socket.id;
    if (!onlineUsers.includes(userData._id)) onlineUsers.push(userData._id);

    socket.join(userData._id);
    console.log("✅ User setup complete:", userData._id);

    socket.emit("connected");
    console.log("🟢 Online users:", onlineUsers);
    io.emit("online-users", onlineUsers);
  });

  socket.on("get-online-users", () => {
    socket.emit("online-users", onlineUsers);
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log(`📥 User joined chat room: ${chatId}`);
  });

  socket.on("new chat created", (newChat) => {
    console.log("📦 New chat created:", newChat._id);

    newChat.users.forEach((user) => {
      if (user._id !== socket.userId) {
        socket.to(user._id).emit("new chat created", newChat);
      }
    });
  });

  socket.on("sendMessage", (data) => {
    const {
      content,
      sender: { _id: senderId },
      messageType,
      chat: { _id: chatId },
    } = data;

    const newMessage = {
      sender: senderId,
      chat: chatId,
      content,
      messageType: messageType || "text",
    };

    socket.to(chatId).emit("newMessage", newMessage);
  });

  socket.on("typing", ({ chatId, from }) => {
    socket.to(chatId).emit("typing", { from });
  });

  socket.on("stop typing", ({ chatId, from }) => {
    socket.to(chatId).emit("stop typing", { from });
  });

  socket.on("leave chat", (chatId) => {
    socket.leave(chatId);
    console.log(`📥 User left chat room: ${chatId}`);
  });

  socket.on("join-video-room", ({ roomId, user }) => {
    if (!roomId || !user) return;

    socket.join(roomId);

    if (!videoRooms[roomId]) videoRooms[roomId] = {};
    videoRooms[roomId][socket.id] = user;

    console.log(`🎥 ${user.name} joined video room ${roomId}`);

    socket.to(roomId).emit("user-joined", { socketId: socket.id, user });

    Object.entries(videoRooms[roomId]).forEach(([id, usr]) => {
      if (id !== socket.id) {
        socket.emit("user-joined", { socketId: id, user: usr });
      }
    });

    logVideoRooms();
  });

  socket.on("offer", ({ sdp, to, from }) => {
    io.to(to).emit("offer", { sdp, from });
  });

  socket.on("answer", ({ sdp, to, from }) => {
    io.to(to).emit("answer", { sdp, from });
  });

  socket.on("ice-candidate", ({ candidate, to, from }) => {
    io.to(to).emit("ice-candidate", { candidate, from });
  });

  socket.on("leave-video-room", ({ roomId }) => {
    if (videoRooms[roomId]) {
      delete videoRooms[roomId][socket.id];
      socket.to(roomId).emit("user-left", { socketId: socket.id });

      if (Object.keys(videoRooms[roomId]).length === 0) {
        delete videoRooms[roomId];
      }
    }
    socket.leave(roomId);
    logVideoRooms();
  });

  socket.on("get-document", async (docId) => {
    console.log(`📄 User requested document: ${docId}`);
    socket.join(docId);
    socket.docId = docId;

    let document = await Document.findById(docId);
    if (!document) {
      document = await Document.create({
        _id: docId,
        content: DEFAULT_CONTENT,
      });
    }
    socket.removeAllListeners("send-changes");
    socket.removeAllListeners("save-document");

    socket.emit("load-document", document.content);

    socket.on("send-changes", (delta) => {
      console.log(delta)
      socket.broadcast.to(docId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(docId, { content: data });
    });
  });

  socket.on("leave-document", () => {
    socket.leave(socket.docId);
    delete socket.docId;
    socket.removeAllListeners("send-changes");
    socket.removeAllListeners("save-document");

    if (socket.data.sendChangesHandler) {
      socket.off("send-changes", socket.data.sendChangesHandler);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        onlineUsers = onlineUsers.filter((id) => id !== userId);
        delete userSocketMap[userId];
        break;
      }
    }

    for (const roomId in videoRooms) {
      videoRooms[roomId] = videoRooms[roomId].filter((id) => id !== socket.id);
      if (videoRooms[roomId].length === 0) {
        delete videoRooms[roomId];
      }
    }

    if(socket.docId) {
      socket.leave(socket.docId);
      delete socket.docId;
    }

    console.log("🟢 Online users after disconnecting:", onlineUsers);
    io.emit("online-users", onlineUsers);
  });
  
});

