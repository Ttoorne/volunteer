const express = require("express");
const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat"); // Импортируем модель Chat
const Message = require("../models/Message"); // Импортируем модель Message (если нужно работать с сообщениями)
const router = express.Router();

// Создание нового чата
router.post("/", async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { participants, name, isGroupChat } = req.body;

    if (!participants || participants.length < 1) {
      return res
        .status(400)
        .json({ error: "A chat must have at least one participant." });
    }

    // Создание нового чата
    const chat = new Chat({
      name: name || "Без названия",
      participants: [...participants, decoded.id], // добавляем текущего пользователя в список участников
      isGroupChat: isGroupChat || false,
    });

    await chat.save();
    res.status(201).json({ message: "Chat created successfully", data: chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the chat." });
  }
});

// Получение всех чатов пользователя с сообщениями
router.get("/", async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const chats = await Chat.find({
      participants: decoded.id,
    })
      .populate("participants", "name email") // Популяция участников чата
      .populate({
        path: "messages",
        populate: { path: "senderId receiverId", select: "name email" }, // Исправление имен полей
      })
      .sort({ createdAt: -1 });

    if (!chats || chats.length === 0) {
      return res.status(404).json({ error: "No chats found for this user." });
    }

    res.json({ data: chats });
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    res.status(500).json({ error: "An error occurred while fetching chats." });
  }
});

// Получение чата по ID
router.get("/:chatId", async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate("participants", "name email")
      .populate("messages");
    if (!chat) {
      return res.status(404).json({ error: "Chat not found." });
    }

    res.json({ data: chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the chat." });
  }
});

// Удаление чата
router.delete("/:chatId", async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found." });
    }

    if (!chat.participants.includes(decoded.id)) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this chat." });
    }

    // Удаляем все сообщения, связанные с этим чатом
    await Message.deleteMany({ chatId: chatId });

    // Удаляем сам чат
    await Chat.findByIdAndDelete(chatId);
    res.json({ message: "Chat and associated messages deleted successfully." });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the chat." });
  }
});

module.exports = router;
