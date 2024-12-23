"use client";
import { useEffect, useState, ChangeEvent, useRef, useCallback } from "react";
import io from "socket.io-client";
import { api } from "@/hooks/api";
import { format, isToday, isYesterday, isSameYear } from "date-fns";
import { ru, enUS, tr } from "date-fns/locale"; // Импортируем русскую, английскую и турецкую локали
import background from "@/assets/chat__background.jpg";

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  chatId: string;
  isRead: boolean;
  _id: string;
}

interface ChatComponentProps {
  userId: string;
  token: string;
  chatId: string;
  chatParticipantId: string;
  chatParticipantName: string;
  locale?: "ru" | "en" | "tr"; // Сделаем locale необязательным
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  userId,
  token,
  chatId,
  chatParticipantId,
  chatParticipantName,
  locale = "en", // По умолчанию будет английский язык
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  const socket = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const markMessagesAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!messageIds.length) return;
      try {
        await fetch(`${api}/messages/mark-as-read`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageIds }),
        });
      } catch (error) {
        console.error("Ошибка обновления isRead:", error);
      }
    },
    [token]
  );

  useEffect(() => {
    socket.current = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: {
        token: token,
      },
    });

    socket.current.emit("joinChat", chatId);

    socket.current.on("receiveMessage", (message: Message) => {
      if (message.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.current.off("receiveMessage");
      socket.current.disconnect();
    };
  }, [token, chatId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${api}/messages/${chatId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();

        if (Array.isArray(data.data)) {
          setMessages(data.data);
        } else {
          console.error("Unexpected data format", data.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chatId, token]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${api}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: chatParticipantId,
          chatId: chatId,
          content: newMessage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            senderId: userId,
            receiverId: chatParticipantId,
            content: newMessage,
            createdAt: new Date().toISOString(),
            chatId,
            isRead: false,
            _id: data.message._id,
          },
        ]);
        setNewMessage("");
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  // Функция для форматирования времени
  const formatTime = (dateString: string) => {
    const messageDate = new Date(dateString);
    return format(messageDate, "HH:mm");
  };

  // Функция для выбора локали и форматирования даты
  const formatDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    let localeToUse;

    // Выбираем локаль в зависимости от выбранной
    switch (locale) {
      case "ru":
        localeToUse = ru;
        break;
      case "en":
        localeToUse = enUS;
        break;
      case "tr":
        localeToUse = tr;
        break;
      default:
        localeToUse = enUS;
    }

    if (isToday(messageDate)) {
      return "Today";
    } else if (isYesterday(messageDate)) {
      return "Yesterday";
    } else if (!isSameYear(messageDate, new Date())) {
      return format(messageDate, "EEEE dd MMMM yyyy", { locale: localeToUse });
    } else {
      return format(messageDate, "EEEE dd MMMM", { locale: localeToUse });
    }
  };

  useEffect(() => {
    // Определяем сообщения собеседника, которые еще не прочитаны
    const unreadMessages = messages
      .filter((msg) => {
        const isFromParticipant = msg.senderId === chatParticipantId;
        const isUnread = !msg.isRead;
        return isFromParticipant && isUnread;
      })
      .map((msg) => {
        return msg._id;
      });

    if (unreadMessages.length > 0) {
      // Отправляем запрос на обновление isRead
      markMessagesAsRead(unreadMessages);

      // Обновляем состояние, чтобы отобразить изменения на клиенте
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) => {
          const shouldUpdate = unreadMessages.includes(msg._id);
          return shouldUpdate ? { ...msg, isRead: true } : msg;
        });
        return updatedMessages;
      });
    }
  }, [messages, chatParticipantId, token]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    console.log(messagesEndRef);
  }, [messages]);

  // Группируем сообщения по датам
  const groupedMessages = messages.reduce(
    (acc: { [key: string]: Message[] }, msg) => {
      const formattedDate = formatDate(msg.createdAt);
      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(msg);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col p-4 h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="flex flex-col">
          {Object.keys(groupedMessages).map((date) => (
            <div key={`${chatId}-${date}`} className="mb-4">
              <div className="text-center text-gray-200 mt-4 mb-2">{date}</div>
              {groupedMessages[date].map((msg) => (
                <div
                  key={`${msg._id}-${chatId}-${date}`}
                  className={`flex ${
                    msg.senderId === userId ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      msg.senderId === userId
                        ? "bg-blue-800 text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.senderId === userId && (
                        <span className="ml-2">
                          {msg.isRead ? (
                            <i className="fas fa-check-double text-green-400">
                              ✓✓
                            </i>
                          ) : (
                            <i className="fas fa-check text-gray-300">✓</i>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center">
        <textarea
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="border p-2 w-full rounded-2xl bg-white text-black"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 ml-2 rounded-md hover:scale-110 duration-200 hover:duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
