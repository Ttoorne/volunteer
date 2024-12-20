"use client";
import { useEffect, useState, ChangeEvent, useRef } from "react";
import io from "socket.io-client";
import { api } from "@/hooks/api";
import { format, isToday, isYesterday, isSameYear } from "date-fns";
import { ru, enUS, tr } from "date-fns/locale"; // Импортируем русскую, английскую и турецкую локали

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
        localeToUse = enUS; // По умолчанию английская локаль
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
    <div className="flex flex-col p-4 bg-gray-100 h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="flex flex-col">
          {Object.keys(groupedMessages).map((date) => (
            <div key={date} className="mb-4">
              <div className="text-center text-gray-500 mt-4 mb-2">{date}</div>
              {groupedMessages[date].map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderId === userId ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      msg.senderId === userId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs text-gray-500">
                      {formatTime(msg.createdAt)}
                    </p>
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
          className="border p-2 w-full rounded-md bg-white"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 ml-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
