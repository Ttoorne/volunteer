"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { api } from "@/hooks/api";
import ChatComponent from "@/components/ChatComponent";
import background from "@/assets/chat__background.jpg";

const ChatPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chatParticipant, setChatParticipant] = useState<any | null>(null);

  const getTokenFromServer = async () => {
    try {
      const response = await fetch(`${api}/projects/some-route`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch token");

      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  useEffect(() => {
    getTokenFromServer();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch(`${api}/auth/profiles/me`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await response.json();
          setUserId(data._id);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    if (userId && token) {
      const socketConnection = io("http://localhost:5000", {
        auth: { token },
      });

      socketConnection.on("connect", () => {
        console.log("Socket connected");
      });

      setSocket(socketConnection);

      return () => {
        socketConnection.disconnect();
      };
    }
  }, [userId, token]);

  // Внутри компонента ChatPage
  useEffect(() => {
    const fetchChatsAndUsers = async () => {
      if (token) {
        try {
          const chatsResponse = await fetch(`${api}/chats`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const chatsData = await chatsResponse.json();

          // Сортировка чатов по дате последнего сообщения
          const sortedChats = chatsData.data.sort((a: any, b: any) => {
            const lastMessageA = a.messages?.[a.messages.length - 1];
            const lastMessageB = b.messages?.[b.messages.length - 1];

            const dateA = lastMessageA
              ? new Date(lastMessageA.createdAt)
              : new Date(0);
            const dateB = lastMessageB
              ? new Date(lastMessageB.createdAt)
              : new Date(0);

            return dateB.getTime() - dateA.getTime(); // Сортировка в порядке убывания
          });

          setChats(sortedChats);

          const usersResponse = await fetch(`${api}/auth/users`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } catch (error) {
          console.error("Error fetching chats or users:", error);
        }
      }
    };

    fetchChatsAndUsers();
  }, [token]);

  const openChat = (chat: any) => {
    setActiveChat(chat);

    const participantId = chat.participants.find(
      (participant: any) => participant._id !== userId
    );

    const participant = users.find((user) => user._id === participantId._id);

    setChatParticipant(participant);
  };

  const getUnreadCount = (chat: any) => {
    const unreadMessages = chat.messages.filter(
      (message: any) =>
        message.isRead === false && message.senderId._id !== userId
    );
    return unreadMessages.length;
  };

  if (!userId || !token || !socket) return <p>Загрузка...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      {/* Левая панель: список чатов */}
      <div className="w-1/3 bg-white p-4 shadow-lg sticky top-0 h-screen border-r-2 border-gray-100">
        <h2 className="text-2xl font-medium mb-4">Chats</h2>
        <ul>
          {chats.map((chat) => {
            const participantId = chat.participants.find(
              (participant: any) => participant._id !== userId
            );
            const participant = users.find(
              (user) => user._id === participantId?._id
            );

            const lastMessage =
              Array.isArray(chat.messages) && chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;

            const isMyMessage = lastMessage?.senderId._id === userId;
            const isRead = lastMessage?.isRead;

            return (
              <li
                key={chat._id}
                onClick={() => openChat(chat)}
                className={`flex items-center justify-between p-4 mb-2 rounded-lg cursor-pointer ${
                  activeChat?._id === chat._id
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                } `}
              >
                <div>
                  <div className="flex justify-between">
                    <span>{participant?.name || "Unknown user"}</span>
                  </div>
                  <div
                    className={`text-sm mt-1 flex items-center ${
                      isMyMessage
                        ? isRead
                          ? "text-blue-600 font-semibold"
                          : "text-gray-500"
                        : "text-gray-600"
                    }`}
                  >
                    {lastMessage ? (
                      <>
                        {isMyMessage && (
                          <span className="mr-1">
                            {isRead ? (
                              <i className="fas fa-check-double text-green-500">
                                ✓✓
                              </i>
                            ) : (
                              <i className="fas fa-check text-gray-500">✓</i>
                            )}
                          </span>
                        )}
                        {lastMessage.content}
                      </>
                    ) : (
                      "No messages yet"
                    )}
                  </div>
                </div>
                <div>
                  {getUnreadCount(chat) > 0 && (
                    <p className="text-white bg-blue-400 w-7 h-7 font-medium rounded-full flex items-center justify-center">
                      <span>{getUnreadCount(chat)}</span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Правая панель: активный чат */}
      <div
        className="w-2/3"
        style={{
          minHeight: "100vh",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${background.src})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {activeChat && chatParticipant ? (
          <div>
            <h2 className="flex items-center text-2xl font-medium mb-4 px-4 bg-white sticky top-0 h-20">
              <span>{chatParticipant.name}</span>
            </h2>
            <ChatComponent
              chatParticipantName={chatParticipant.name}
              userId={userId}
              token={token}
              chatId={activeChat._id}
              chatParticipantId={chatParticipant._id}
            />
          </div>
        ) : (
          <p className="text-white text-2xl text-center mt-8">
            Choose chat from the list
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
