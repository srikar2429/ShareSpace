import express from "express";
import cookieParser from "cookie-parser";
import createHttpError from "http-errors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import morgan from "morgan";
import env from "./utils/validateEnv.js";
import passport from "passport";
import "./config/passport.js";
import { Server } from "socket.io";
import cors from "cors";

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

app.use("/api/users", userRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

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

io.on("connection", (socket) => {
  console.log("⚡ New socket connection:", socket.id);

  socket.on("setup", (userData) => {
    userSocketMap[userData._id] = socket.id;
    socket.join(userData._id);
    console.log("✅ User setup complete:", userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log(`📥 User joined chat room: ${chatId}`);
  });

  socket.on("sendMessage", (data) => {
    console.log(data);
    const {
      content,
      sender: {_id: senderId },
      messageType,
      chat: { _id: chatId },
    } = data;

    console.log("Message received to emit:", content);

    const newMessage = {
      sender: senderId,
      chat: chatId,
      content,
      messageType: messageType || "text", 
    };

    socket.to(chatId).emit("newMessage", newMessage);

    console.log("Message emitted to room:", chatId);
  });


  socket.on("leave chat", (chatId) => {
    socket.leave(chatId);
    console.log(`📥 User left chat room: ${chatId}`);
  });


  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});
