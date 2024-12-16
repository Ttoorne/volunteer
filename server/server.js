// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");

const app = express();

// Используйте cookie-parser для работы с cookies
app.use(cookieParser());

// Настройка CORS
const corsOptions = {
  origin: "http://localhost:3000", // Разрешаем доступ только с фронтенда на порте 3000
  methods: "GET,POST,PUT,DELETE", // Разрешаем такие методы
  allowedHeaders: "Content-Type,Authorization", // Разрешаем нужные заголовки
  credentials: true, // Разрешить отправку и приём cookie
};

app.use(cors(corsOptions)); // Используем CORS с настройками

// Мидлвары для обработки JSON тела запросов
app.use(express.json());

// Подключаем маршруты для аутентификации
app.use("/api/auth", authRoutes); // Все маршруты внутри auth.js будут доступны с префиксом /api/auth

app.use("/api/projects", projectRoutes);

const port = process.env.PORT || 5000;

app
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

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
