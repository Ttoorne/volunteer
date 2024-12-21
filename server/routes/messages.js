const express = require("express");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Chat = require("../models/Chat"); // Модель чата
const router = express.Router();

// Отправка нового сообщения
router.post("/", async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { receiverId, content, chatId } = req.body;

    if (!receiverId || !content || !chatId) {
      return res
        .status(400)
        .json({ error: "Receiver ID, content, and chatId are required." });
    }

    // Проверяем, что чат существует
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found." });
    }

    // Проверяем, что участник чата - это отправитель или получатель
    if (
      !chat.participants.includes(decoded.id) ||
      !chat.participants.includes(receiverId)
    ) {
      return res
        .status(403)
        .json({ error: "You are not a participant of this chat." });
    }

    // Сохраняем новое сообщение
    const message = new Message({
      senderId: decoded.id, // Используем senderId вместо sender
      receiverId: receiverId,
      content: content, // Модифицируем поле text для содержимого
      chatId: chatId, // Связываем сообщение с чатом
    });

    await message.save();

    // Добавляем сообщение в чат
    chat.messages.push(message._id);
    await chat.save();

    // Отправка сообщения всем участникам чата через WebSocket
    if (global.io) {
      global.io.to(chatId).emit("receiveMessage", {
        user: decoded.id,
        message,
      });
    }

    // Возвращаем успешный ответ
    res
      .status(201)
      .json({ message: "Message sent successfully", data: message });
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while sending the message." });
  }
});

// Получение всех сообщений для чата
router.get("/:chatId", async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { chatId } = req.params;

    // Находим чат
    const chat = await Chat.findById(chatId).populate("messages");
    if (!chat) {
      return res.status(404).json({ error: "Chat not found." });
    }

    // Проверяем, что участник чата - это текущий пользователь
    if (!chat.participants.includes(decoded.id)) {
      return res
        .status(403)
        .json({ error: "You are not a participant of this chat." });
    }

    res.json({ data: chat.messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages." });
  }
});

router.patch("/mark-as-read", async (req, res) => {
  const { messageIds } = req.body;

  try {
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update messages" });
  }
});

// Удаление сообщения
router.delete("/:messageId", async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { messageId } = req.params;

    // Находим сообщение
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    // Проверяем, что сообщение принадлежит текущему пользователю
    if (message.senderId.toString() !== decoded.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this message." });
    }

    // Удаляем сообщение
    await Message.findByIdAndDelete(messageId);

    // Удаляем сообщение из чата
    const chat = await Chat.findById(message.chatId);
    chat.messages.pull(messageId);
    await chat.save();

    // Отправляем обновления через WebSocket
    if (global.io) {
      global.io.to(message.chatId.toString()).emit("messageDeleted", messageId);
    }

    res.json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the message." });
  }
});

module.exports = router;
