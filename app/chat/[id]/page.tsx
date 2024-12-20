"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/hooks/api";
import ChatComponent from "@/components/ChatComponent";

const ChatPage: React.FC = () => {
  const { id } = useParams(); // Получаем id чата из параметров
  const [chat, setChat] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]); // Массив пользователей
  const [chatParticipant, setChatParticipant] = useState<any>(null); // Стейт для участника чата

  // Получаем токен с сервера
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

  // Получаем пользователей
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

  // Получаем данные текущего пользователя
  useEffect(() => {
    getTokenFromServer();
  }, []);

  useEffect(() => {
    if (token) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`${api}/auth/profiles/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          setUserId(data._id);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [token]);

  // Получаем информацию о чате
  useEffect(() => {
    if (id && token) {
      const fetchChat = async () => {
        try {
          const response = await fetch(`${api}/chats/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch chat");
          }

          const data = await response.json();
          setChat(data);
        } catch (error) {
          console.error("Error fetching chat:", error);
        }
      };

      fetchChat();
    }
  }, [id, token]);

  // Получаем список пользователей
  useEffect(() => {
    if (token) {
      getUsers();
    }
  }, [token]);

  // Находим участника чата по chatParticipantId
  useEffect(() => {
    if (chat && users.length > 0) {
      const chatParticipantId = chat?.data.participants?.find(
        (user: any) => user._id !== userId
      )?._id;

      if (chatParticipantId) {
        const participant = users.find(
          (user) => user._id === chatParticipantId
        );
        setChatParticipant(participant);
      }
    }
  }, [chat, users, userId]);

  if (!chat || !userId || !token || !chatParticipant) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        Чат с {chatParticipant.name}
      </h1>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Сообщения:</h2>

      <div className="border-t-2 border-gray-200 pt-4">
        <ChatComponent
          chatParticipantName={chatParticipant.name}
          userId={userId}
          token={token}
          chatId={chat.data._id}
          chatParticipantId={chatParticipant._id}
        />
      </div>
    </div>
  );
};

export default ChatPage;
