"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../assets/logo-volunteer.svg";
import LogoutButton from "@/components/LogoutButton";
import { fetchUserData } from "@/server/utils/fetchUserData";
import { useEffect, useState } from "react";
import { api } from "@/hooks/api";
import { fetchUserAvatarNavbar } from "@/server/utils/fetchUserAvatarNavbar";

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
          setUser(userData);

          if (userData.avatar) {
            const avatarUrl = await fetchUserAvatarNavbar(userData.avatar);
            setUserAvatarUrl(avatarUrl);
            handleAvatarLoad();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleAvatarLoad = () => {
    setAvatarLoaded(true);
  };

  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    const fetchChatsAndUsers = async () => {
      if (token) {
        try {
          const chatsResponse = await fetch(`${api}/chats`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const chatsData = await chatsResponse.json();

          const sortedChats = chatsData.data.sort((a: any, b: any) => {
            const lastMessageA = a.messages?.[a.messages.length - 1] || null;
            const lastMessageB = b.messages?.[b.messages.length - 1] || null;

            const dateA = lastMessageA
              ? new Date(lastMessageA.createdAt)
              : new Date(0);
            const dateB = lastMessageB
              ? new Date(lastMessageB.createdAt)
              : new Date(0);

            return dateB.getTime() - dateA.getTime();
          });

          setChats(sortedChats);
        } catch (error) {
          console.error("Error fetching chats or users:", error);
        }
      }
    };

    fetchChatsAndUsers();
  }, [token, pathname]);

  const getUnreadCount = (chat: any) => {
    const unreadMessages = chat.messages.filter(
      (message: any) => !message.isRead && message.senderId._id !== user?._id
    );
    return unreadMessages.length > 0;
  };

  const [unreadCount, setUnreadCount] = useState(0);

  const totalUnreadCount = chats.reduce(
    (total, chat) => total + getUnreadCount(chat),
    0
  );

  useEffect(() => {
    setUnreadCount(totalUnreadCount);
  }, [totalUnreadCount, setUnreadCount]);

  return (
    <nav
      className={`relative z-40 py-4 border-b ${
        pathname == "/chat"
          ? "bg-teal-600 border-none"
          : "bg-white border-gray-100"
      }   flex`}
    >
      <div
        className={`container mx-auto flex items-center justify-between ${
          pathname == "/chat" ? "text-gray-50" : "text-gray-800"
        } text-lg font-medium`}
      >
        {/* Логотип */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center relative">
            <Image
              src={logo}
              alt="Logo"
              priority
              className="w-12 h-12 lg:w-24 lg:h-24 absolute hover:scale-110 duration-200 hover:duration-200"
            />
            <p
              className={`text-2xl font-extrabold tracking-wider ml-[55%] ${
                pathname == "/chat"
                  ? "hover:text-yellow-400"
                  : "hover:text-teal-600"
              } transition duration-300`}
            >
              VOLUNTEER
            </p>
          </Link>
        </div>

        {/* Навигационные ссылки (скрываются на мобильных устройствах) */}
        <div className="hidden md:flex space-x-6 text-base md:text-lg lg:text-xl">
          <Link
            href="/"
            className={`${
              pathname === "/"
                ? "text-indigo-400 underline underline-offset-4 decoration-wavy decoration-indigo-400"
                : pathname === "/chat"
                ? "hover:text-yellow-400   decoration-yellow-400 transition duration-300"
                : "hover:text-indigo-400 transition duration-300"
            }`}
          >
            Home
          </Link>
          <Link
            href="/projects"
            className={`${
              pathname.startsWith("/projects") && pathname !== "/projects/add"
                ? "text-orange-600 underline underline-offset-4 decoration-wavy decoration-orange-600"
                : pathname === "/chat"
                ? "hover:text-yellow-400   decoration-yellow-400 transition duration-300"
                : "hover:text-orange-600 transition duration-300"
            }`}
          >
            Projects
          </Link>
          <Link
            href="/about"
            className={`${
              pathname === "/about"
                ? "text-yellow-500 underline underline-offset-4 decoration-wavy decoration-yellow-500"
                : pathname === "/chat"
                ? "hover:text-yellow-400   decoration-yellow-400 transition duration-300"
                : "hover:text-yellow-500 transition duration-300"
            }`}
          >
            About
          </Link>
          {user && (
            <Link
              href="/chat"
              className={`${
                pathname === "/chat"
                  ? "text-yellow-400 underline underline-offset-4 decoration-wavy decoration-yellow-400"
                  : "hover:text-teal-600 transition duration-300"
              }`}
            >
              <span>{`Messages  `}</span>
              {unreadCount !== 0 && pathname !== "/chat" ? (
                <span className="bg-teal-600 rounded-full py-2 px-4 text-white text-base hover:bg-yellow-400 duration-300">
                  New {unreadCount}
                </span>
              ) : null}
            </Link>
          )}
        </div>

        {/* Аватар или кнопка входа */}
        <div className="items-center space-x-4 hidden md:flex text-gray-800">
          {(isLoading || !avatarLoaded) && user ? (
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-300 animate-pulse"></div>
          ) : user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-gray-300 shadow-md hover:scale-110 transition-transform"
              >
                <img
                  alt="Avatar"
                  src={
                    userAvatarUrl ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-DSW54utMSZ6J1F9luVr6YYDoRZ-FQYCL3w&s"
                  }
                  className="object-cover rounded-full w-full h-full"
                />
              </div>
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg text-lg font-medium bg-white rounded-box w-52"
              >
                <li>
                  <Link
                    href={`/profile/${user.name}`}
                    className="hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href={`/projects/add`} className="hover:bg-gray-100">
                    Add Project
                  </Link>
                </li>
                <li>
                  <LogoutButton />
                </li>
              </ul>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-6 py-2 rounded-full bg-teal-500 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-teal-600 transition duration-300"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      {/* Мобильное меню (бургер) */}
      <div className="md:hidden flex items-center">
        <button
          className="text-gray-800 p-2 hover:bg-gray-100 rounded-md focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-0 left-0 w-full bg-white shadow-lg p-4 space-y-4 text-lg font-medium">
          <Link
            href="/"
            className="block text-indigo-400 hover:text-indigo-600"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className="block text-orange-600 hover:text-orange-800"
          >
            Projects
          </Link>
          <Link
            href="/about"
            className="block text-yellow-500 hover:text-yellow-600"
          >
            About
          </Link>
          {user && (
            <Link
              href="/chat"
              className="block text-teal-600 hover:text-teal-800"
            >
              Messages
            </Link>
          )}
          {user ? (
            <Link
              href={`/profile/${user.name}`}
              className="block text-gray-800 hover:text-gray-600"
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="block text-teal-500 hover:text-teal-600"
            >
              Log in
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-500 hover:text-gray-600"
          >
            Close
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
