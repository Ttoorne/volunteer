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

const Message = require("./models/Message");
const Chat = require("./models/Chat");

const app = express();

const server = http.createServer(app);

// Настройка CORS
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,PATCH,DELETE",
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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Хранилище для отслеживания участников чатов
const chatUsers = {};

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
    console.error("Invalid token:", err.message);
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Присоединение к чату по chatId
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.user.id} joined chat: ${chatId}`);

    // Отслеживаем пользователей чата
    if (!chatUsers[chatId]) {
      chatUsers[chatId] = new Set();
    }
    chatUsers[chatId].add(socket.user.id);

    console.log(
      `Current participants in chat ${chatId}:`,
      Array.from(chatUsers[chatId])
    );

    // Логируем участников чата
    io.to(chatId).emit("chatParticipants", Array.from(chatUsers[chatId]));
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
      chatId,
      senderId: socket.user.id,
      receiverId,
      content,
      isRead: false,
      createdAt: new Date(),
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
          senderId: socket.user.id,
          receiverId,
          content,
          createdAt: messageData.createdAt || new Date().toISOString(),
          isRead: messageData.isRead || false,
        });
      } else {
        console.log("Chat not found.");
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Отсоединение от чата
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.id}`);

    // Удаление пользователя из списка участников чата
    for (let chatId in chatUsers) {
      if (chatUsers[chatId].has(socket.user.id)) {
        chatUsers[chatId].delete(socket.user.id);
        console.log(`User ${socket.user.id} removed from chat ${chatId}`);

        // Логируем участников чата
        io.to(chatId).emit("chatParticipants", Array.from(chatUsers[chatId]));
      }
    }
  });
});

const port = process.env.PORT || process.env.NEXT_PUBLIC_API_PORT;

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
