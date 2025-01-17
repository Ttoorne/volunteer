"use client";
import { useEffect, useState, ChangeEvent, useRef, useCallback } from "react";
import io from "socket.io-client";
import { api } from "@/hooks/api";
import { format, isToday, isYesterday, isSameYear } from "date-fns";
import { ru, enUS, tr } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";
import { chatComponent__translations } from "./Translations";

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
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  userId,
  token,
  chatId,
  chatParticipantId,
  chatParticipantName,
  setRefresh,
}) => {
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = chatComponent__translations[language];

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
        console.error(t.errorUpdatingIsRead, error);
      }
    },
    [token]
  );

  const port = process.env.NEXT_PUBLIC_API_PORT;

  useEffect(() => {
    if (!token || !chatId) return;

    socket.current = io(`http://localhost:${port}`, {
      transports: ["websocket"],
      auth: {
        token: token,
      },
    });

    socket.current.on("connect", () => {
      console.log("Connected to WebSocket server");
      socket.current.emit("joinChat", chatId);
    });

    socket.current.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err.message);
    });

    socket.current.on("receiveMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      if (socket.current) {
        socket.current.off("receiveMessage");
        socket.current.disconnect();
      }
    };
  }, [token, chatId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    socket.current.emit("sendMessage", {
      chatId: chatId,
      content: newMessage,
      receiverId: chatParticipantId,
      senderId: userId,
      createdAt: new Date().toISOString(),
      isRead: false,
    });

    setNewMessage("");
    setRefresh((prev) => !prev);
  };

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
          throw new Error(t.failedToFetchMessages);
        }

        const data = await response.json();

        if (Array.isArray(data.data)) {
          setMessages(data.data);
        } else {
          console.error(t.unexpectedDataFormat, data.data);
        }
      } catch (error) {
        console.error(t.errorFetchingMessages, error);
      }
    };

    fetchMessages();
  }, [chatId, token]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const formatTime = (dateString: string) => {
    const messageDate = new Date(dateString);

    if (isNaN(messageDate.getTime())) {
      console.error("Invalid date string:", dateString);
      return "";
    }

    return format(messageDate, "HH:mm");
  };

  const formatDate = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      console.error("Invalid date string:", dateString);
      return "";
    }

    const messageDate = new Date(dateString);
    let localeToUse;

    switch (language) {
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
      return t.today;
    } else if (isYesterday(messageDate)) {
      return t.yesterday;
    } else if (!isSameYear(messageDate, new Date())) {
      return format(messageDate, "EEEE dd MMMM yyyy", { locale: localeToUse });
    } else {
      return format(messageDate, "EEEE dd MMMM", { locale: localeToUse });
    }
  };

  useEffect(() => {
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
      markMessagesAsRead(unreadMessages);

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
  }, [messages]);

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
    <div className="flex flex-col p-4 h-full relative">
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="flex flex-col">
          {Object.keys(groupedMessages).map((date) => (
            <div key={`${chatId}-${date}`} className="mb-4">
              <div className="text-center text-gray-100 text-lg mt-4 mb-2">
                {date}
              </div>
              {groupedMessages[date].map((msg) => (
                <div
                  key={`${msg._id}-${chatId}-${date}`}
                  className={`chat ${
                    msg.senderId === userId ? "chat-end" : "chat-start"
                  }`}
                >
                  <div
                    className={`chat-bubble py-3 px-5 rounded-3xl ${
                      msg.senderId === userId
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div
                      className={`flex items-center justify-between text-xs 
                      ${
                        msg.senderId === userId
                          ? "text-gray-300"
                          : "text-gray-400"
                      }
                       mt-1`}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.senderId === userId && (
                        <span className="ml-2 font-semibold">
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

      <div className="flex text-base items-center sticky justify-center bottom-5 w-4/5 mx-auto">
        <textarea
          value={newMessage}
          onChange={handleInputChange}
          placeholder={t.typeMessage}
          className="border-2 p-4 w-full rounded-2xl bg-white text-black focus:border-teal-600 outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-4 ml-2 rounded-2xl hover:scale-110 duration-200 hover:duration-200"
        >
          {t.send}
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
