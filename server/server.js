require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const messageRoutes = require("./routes/messages");
const chatRoutes = require("./routes/chats");

const Message = require("./models/Message"); // Импорт модели Message
const Chat = require("./models/Chat"); // Импорт модели Chat

const app = express();

// Создаем HTTP-сервер для интеграции с Socket.IO
const server = http.createServer(app);

// Настройка CORS
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// ?? ROUTE
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/projects", projectRoutes);

// Инициализация Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  // console.log(`User connected: ${socket.user.id}`);

  // Присоединение к чату по chatId
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.user.id} joined chat: ${chatId}`);
  });

  // Отправка сообщения в чат
  socket.on("sendMessage", async (messageData) => {
    const { chatId, content, receiverId } = messageData;

    // Проверяем, что все необходимые данные присутствуют
    if (!chatId || !content || !receiverId) {
      console.log("Missing required fields for message:", messageData);
      return;
    }

    // Создание и сохранение сообщения
    const message = new Message({
      chatId, // Добавляем chatId
      senderId: socket.user.id, // Используем socket.user.id как senderId
      receiverId, // Передаем receiverId
      content, // Контент сообщения
    });

    try {
      await message.save();

      // Добавление сообщения в чат
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.messages.push(message._id);
        await chat.save();

        console.log(`Emitting message to chatId ${chatId}`, {
          sender: socket.user.id,
          receiver: receiverId,
          content,
          timestamp: message.createdAt,
        });
        io.to(chatId).emit("receiveMessage", {
          chatId,
          sender: socket.user.id,
          receiver: receiverId,
          content,
          timestamp: message.createdAt,
        });
      } else {
        console.log("Chat not found.");
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    // console.log(`User disconnected: ${socket.user.id}`);
  });
});

const port = process.env.PORT || 3500;

// Подключение Express и WebSocket
server
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use.`);
    } else {
      console.error("Error starting server:", err);
    }
  });

// подключение MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
