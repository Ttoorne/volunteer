"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { api } from "@/hooks/api";
import ChatComponent from "@/components/ChatsPage/ChatComponent";
import background from "@/assets/chat_page__bg.png";
import Link from "next/link";
import { fetchUserAvatar } from "@/server/utils/fetchUserAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { chatPage__translations } from "@/components/ChatsPage/Translations";

const ChatPage: React.FC = () => {
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chatParticipant, setChatParticipant] = useState<any | null>(null);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState("");
  const [refresh, setRefresh] = useState<boolean>(false);

  const t = chatPage__translations[language];
  const port = process.env.NEXT_PUBLIC_API_PORT;

  useEffect(() => {
    const fetchAvatar = async () => {
      const avatar = await loadAvatar(
        chatParticipant?.avatar ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-DSW54utMSZ6J1F9luVr6YYDoRZ-FQYCL3w&s"
      );
      setAvatarUrl(avatar);
    };

    fetchAvatar();
  }, [chatParticipant]);

  useEffect(() => {
    const fetchAvatars = async () => {
      const avatarPromises = users.map(async (user) => {
        const avatarId = user.avatar;
        const imageUrl = await loadAvatar(avatarId);
        return { avatarId, imageUrl };
      });

      const avatars = await Promise.all(avatarPromises);
      const avatarMap = avatars.reduce(
        (acc, { avatarId, imageUrl }) => ({ ...acc, [avatarId]: imageUrl }),
        {}
      );

      setAvatarUrls(avatarMap);
    };

    fetchAvatars();
  }, [users]);

  const loadAvatar = async (avatarId: string) => {
    try {
      const imageUrl = await fetchUserAvatar(avatarId);
      return imageUrl;
    } catch {
      return "https://cdn-icons-png.flaticon.com/512/3607/3607444.png";
    }
  };
  const getTokenFromServer = async () => {
    try {
      const response = await fetch(`${api}/projects/some-route`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error(t.failedToFetchToken);

      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error(t.errorFetchingToken, error);
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
          console.error(t.errorFetchingUserData, error);
        }
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    if (userId && token) {
      const socketConnection = io(`http://localhost:${port}`, {
        auth: { token },
      });

      socketConnection.on("connect", () => {
        console.log(t.socketConnected);
      });

      setSocket(socketConnection);

      return () => {
        socketConnection.disconnect();
      };
    }
  }, [userId, token]);

  useEffect(() => {
    const fetchChatsAndUsers = async () => {
      if (token) {
        try {
          const chatsResponse = await fetch(`${api}/chats`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const chatsData = await chatsResponse.json();

          const sortedChats = Array.isArray(chatsData.data)
            ? chatsData.data.sort((a: any, b: any) => {
                const lastMessageA =
                  a.messages?.[a.messages.length - 1] || null;
                const lastMessageB =
                  b.messages?.[b.messages.length - 1] || null;

                const dateA = lastMessageA
                  ? new Date(lastMessageA.createdAt)
                  : new Date(0);
                const dateB = lastMessageB
                  ? new Date(lastMessageB.createdAt)
                  : new Date(0);

                return dateB.getTime() - dateA.getTime();
              })
            : [];

          setChats(sortedChats);

          const usersResponse = await fetch(`${api}/auth/users`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const usersData = await usersResponse.json();
          setUsers(usersData);

          const chatWithOrganizer = localStorage.getItem("chatWithOrganizer");
          if (chatWithOrganizer) {
            const organizer = JSON.parse(chatWithOrganizer);
            const existingChat = sortedChats.find((chat: any) =>
              chat.participants.some(
                (participant: any) => participant?._id === organizer._id
              )
            );

            if (existingChat) {
              openChat(existingChat);
            } else {
              createChatWithOrganizer(organizer);
            }
            localStorage.removeItem("chatWithOrganizer");
          }
        } catch (error) {
          console.error(t.errorFetchingChatsOrUsers, error);
        }
      }
    };

    fetchChatsAndUsers();
  }, [token, refresh]);

  useEffect(() => {
    if (activeChat) {
      const participantId = activeChat.participants.find(
        (participant: any) => participant?._id !== userId
      );

      const participant = users.find(
        (user) => user?._id === participantId?._id
      );
      setChatParticipant(participant);
    }
  }, [activeChat, users, userId]);

  const openChat = (chat: any) => {
    setRefresh((prev) => !prev);
    setActiveChat(chat);
  };

  const createChatWithOrganizer = async (organizer: any) => {
    try {
      const response = await fetch(`${api}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Чат с ${organizer._id}`,
          participants: [organizer._id],
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats((prevChats) => [newChat.data, ...prevChats]);
        openChat(newChat.data);
      } else {
        console.error(t.failedToCreateChat);
      }
    } catch (error) {
      console.error(t.errorCreatingChat, error);
    }
  };

  const getUnreadCount = (chat: any) => {
    const unreadMessages = chat.messages.filter(
      (message: any) =>
        message.isRead === false && message.senderId._id !== userId
    );
    return unreadMessages.length;
  };

  const getUnreadUserCount = (chat: any) => {
    const unreadMessages = chat.messages.filter(
      (message: any) => !message.isRead && message.senderId._id !== userId
    );
    return unreadMessages.length > 0;
  };

  if (!userId || !token || !socket)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-lg text-primary mx-auto"></span>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-transparent flex gap-5 relative"
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${background.src})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Левая панель: список чатов */}
      <div className="w-1/3 bg-gray-50 sticky mt-[5vh] rounded-3xl top-[5vh] left-5 h-[90vh] shadow-lg">
        <h2 className="h-16 text-xl font-medium text-white bg-teal-600 p-5 rounded-t-3xl flex items-center justify-center gap-2">
          <span>{t.chats}</span>
          {chats.reduce((total, chat) => total + getUnreadUserCount(chat), 0) >
            0 && (
            <span className="bg-gray-50 text-gray-500 text-sm font-bold py-1 px-3 rounded-full">
              {chats.reduce(
                (total, chat) => total + getUnreadUserCount(chat),
                0
              )}
            </span>
          )}
        </h2>
        <ul className="overflow-y-auto">
          {chats.map((chat) => {
            const participantId = chat.participants.find(
              (participant: any) => participant?._id !== userId
            );

            const participant = users.find(
              (user) => user?._id === participantId?._id
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
                className={`flex items-center justify-between py-4 px-6 cursor-pointer transition-all duration-300 ${
                  activeChat?._id === chat._id
                    ? "bg-blue-100 border-l-8 border-blue-400"
                    : "hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      avatarUrls[participant?.avatar] ||
                      "https://cdn-icons-png.flaticon.com/512/3607/3607444.png"
                    }
                    alt="Avatar"
                    className="w-14 h-14 rounded-full object-cover border border-gray-300"
                  />
                  <div>
                    <span className="block font-semibold text-gray-800 text-base">
                      {"@" + participant?.name || "Unknown user"}
                    </span>
                    <div
                      className={`text-sm mt-1 ${
                        isMyMessage
                          ? isRead
                            ? "text-blue-500 font-semibold"
                            : "text-gray-500"
                          : "text-gray-600"
                      }`}
                    >
                      {lastMessage ? (
                        <>
                          {isMyMessage && (
                            <span className="mr-1">
                              {isRead ? (
                                <i className="fas fa-check-double font-semibold text-green-600">
                                  ✓✓
                                </i>
                              ) : (
                                <i className="fas fa-check font-semibold text-gray-400">
                                  ✓
                                </i>
                              )}
                            </span>
                          )}
                          <span className="font-medium">
                            {" " + lastMessage.content}
                          </span>
                        </>
                      ) : (
                        t.noMessagesYet
                      )}
                    </div>
                  </div>
                </div>
                {getUnreadCount(chat) > 0 && (
                  <div className="text-white bg-blue-500 px-3 py-1 text-sm font-semibold rounded-full">
                    {getUnreadCount(chat)}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Правая панель: активный чат */}
      <div className="w-2/3 relative">
        {activeChat && chatParticipant ? (
          <div>
            <h2 className="flex items-center text-2xl font-medium px-6 py-4 h-20 bg-white sticky mt-5 top-3 z-20 rounded-3xl w-[95%] mx-auto">
              <Link
                href={`/profile/${chatParticipant.name}`}
                className="flex items-center space-x-4  "
              >
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-500 shadow-lg"
                />
                <div className="flex flex-col">
                  <p className="text-xl font-semibold text-gray-900 hover:text-teal-700 transition duration-300">
                    @{chatParticipant.name}
                  </p>
                  <p className="text-base text-gray-600">
                    {chatParticipant.firstName + " " + chatParticipant.lastName}
                  </p>
                </div>
              </Link>
            </h2>

            <ChatComponent
              chatParticipantName={chatParticipant.name}
              userId={userId}
              token={token}
              chatId={activeChat._id}
              chatParticipantId={chatParticipant._id}
              setRefresh={setRefresh}
            />
          </div>
        ) : (
          <p className="text-white text-2xl text-center mt-8">
            {t.chooseChatFromList}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
