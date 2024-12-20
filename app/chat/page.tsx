"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { api } from "@/hooks/api";
import { fetchUserData } from "@/server/utils/fetchUserData";
import Link from "next/link";

const ChatPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [users, setUsers] = useState<Array<any>>([]);
  const [chats, setChats] = useState<Array<any>>([]); // Состояние для хранения чатов

  const getTokenFromServer = async () => {
    try {
      const response = await fetch(`${api}/projects/some-route`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }

      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getTokenFromServer();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await fetchUserData(token);
          setUserId(userData._id);
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
        auth: {
          token: token,
        },
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

  useEffect(() => {
    if (token) {
      getUsers();
      fetchChats(); // Загружаем чаты после получения токена
    }
  }, [token]);

  const getUsers = async () => {
    try {
      const response = await fetch(`${api}/auth/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await fetch(`${api}/chats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      setChats(data.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // Функция для создания чата с POST-запросом
  const createChat = async (targetUserId: string) => {
    if (!userId || !socket) return;

    try {
      const existingChat = chats.find(
        (chat: any) =>
          chat.participants.length === 2 &&
          chat.participants.some(
            (participant: any) => participant._id === targetUserId
          )
      );

      if (existingChat) {
        window.location.href = `/chat/${existingChat._id}`;
      } else {
        const chatData = {
          participants: [targetUserId],
          name: "Чат с " + targetUserId,
          isGroupChat: false,
        };

        const createResponse = await fetch(`${api}/chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(chatData),
        });

        const createData = await createResponse.json();
        if (createResponse.ok) {
          window.location.href = `/chat/${createData.data._id}`;
        } else {
          console.error(createData.error);
        }
      }
    } catch (error) {
      console.error("Ошибка при создании чата:", error);
    }
  };

  if (!userId || !token || !socket) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        Чат
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Пользователи
        </h2>
        {users?.length === 0 ? (
          <p className="text-gray-500">Нет пользователей</p>
        ) : (
          <ul className="space-y-4">
            {users
              ?.filter((user) => user._id !== userId)
              .map((user) => {
                const existingChat = chats.find(
                  (chat: any) =>
                    chat.participants.length === 2 &&
                    chat.participants.some(
                      (participant: any) => participant._id === user._id
                    )
                );

                return (
                  <li
                    key={user._id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100"
                  >
                    <span className="text-lg text-gray-700">{user.name}</span>
                    <button
                      onClick={() => createChat(user._id)}
                      disabled={existingChat}
                      className={`py-2 px-4 rounded-lg text-sm font-medium ${
                        existingChat
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {existingChat ? (
                        <Link
                          href={`/chat/${existingChat._id}`}
                          className="text-blue-700"
                        >
                          Чат существует
                        </Link>
                      ) : (
                        "Создать чат"
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
