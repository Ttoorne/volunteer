"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/assets/logo-volunteer.svg";
import LogoutButton from "@/components/MainComponents/LogoutButton";
import { fetchUserData } from "@/server/utils/fetchUserData";
import { useEffect, useState } from "react";
import { api } from "@/hooks/api";
import { fetchUserAvatarNavbar } from "@/server/utils/fetchUserAvatarNavbar";
import { useLanguage } from "@/context/LanguageContext";
import { navbar__translations } from "./Translation";

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
    } catch (error) {}
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
          } else {
            setUserAvatarUrl(
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-DSW54utMSZ6J1F9luVr6YYDoRZ-FQYCL3w&s"
            );
            handleAvatarLoad();
          }
        } catch (error) {
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
        } catch (error) {}
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

  const { setLanguage } = useLanguage();
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();

  const changeLanguage = (lng: "en" | "tr" | "ru") => {
    setLanguage(lng);
  };

  const t = navbar__translations[language];

  return (
    <nav
      className={`relative z-10 py-4 border-b ${
        pathname == "/chat"
          ? "bg-teal-600 border-none z-40"
          : pathname == "/projects"
          ? "bg-white border-gray-100 z-40"
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
            {t.home}
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
            {t.events}
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
            {t.about}
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
              <span>{t.messages}</span>
              {unreadCount !== 0 && pathname !== "/chat" ? (
                <span className="ml-2 bg-teal-600 rounded-full py-2 px-4 text-white text-base hover:bg-yellow-400 duration-300">
                  {t.new + unreadCount}
                </span>
              ) : null}
            </Link>
          )}
        </div>

        {/* Аватар или кнопка входа */}
        <div className="items-center space-x-4 hidden md:flex text-gray-800">
          {/* Переключатель языков */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold rounded-full shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  stroke="#0d9488"
                  strokeWidth="0.00024000000000000003"
                  className="fill-cyan-600"
                >
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
                </svg>
              </div>

              <span className="capitalize">{language.toUpperCase()}</span>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 shadow-xl text-base font-medium bg-white rounded-xl w-56 border-2 border-gray-200"
            >
              <li className="flex items-center gap-2 px-4 py-2">
                <button
                  className={`justify-center flex items-center gap-2 w-full ${
                    language === "en"
                      ? "bg-cyan-600 text-white shadow-lg hover:bg-cyan-500"
                      : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                  } py-2 px-4 rounded-full focus:bg-cyan-600 focus:text-white transition`}
                  onClick={() => changeLanguage("en")}
                >
                  <img
                    src="https://flagcdn.com/w40/us.png"
                    alt="English"
                    className="w-6 h-6 rounded-full"
                  />
                  English
                </button>
              </li>
              <li className="flex items-center gap-2 px-4 py-2">
                <button
                  className={`justify-center flex items-center gap-2 w-full ${
                    language === "tr"
                      ? "bg-cyan-600 text-white shadow-lg hover:bg-cyan-500"
                      : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                  } py-2 px-4 rounded-full focus:bg-cyan-600 focus:text-white transition`}
                  onClick={() => changeLanguage("tr")}
                >
                  <img
                    src="https://flagcdn.com/w40/tr.png"
                    alt="Turkish"
                    className="w-6 h-6 rounded-full"
                  />
                  Türkçe
                </button>
              </li>
              <li className="flex items-center gap-2 px-4 py-2">
                <button
                  className={`justify-center flex items-center gap-2 w-full ${
                    language === "ru"
                      ? "bg-cyan-600 text-white shadow-lg hover:bg-cyan-500"
                      : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                  } py-2 px-4 rounded-full focus:bg-cyan-600 focus:text-white transition`}
                  onClick={() => changeLanguage("ru")}
                >
                  <img
                    src="https://flagcdn.com/w40/ru.png"
                    alt="Russian"
                    className="w-6 h-6 rounded-full"
                  />
                  Русский
                </button>
              </li>
            </ul>
          </div>

          {/* Аватар или кнопка входа */}
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
                className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg text-lg font-medium bg-white rounded-box w-52 border-2 border-gray-200"
              >
                <li>
                  <Link
                    href={`/profile/${user.name}`}
                    className="hover:bg-gray-100"
                  >
                    {t.profile}
                  </Link>
                </li>
                <li>
                  <Link href={`/projects/add`} className="hover:bg-gray-100">
                    {t.addEvent}
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
              {t.login}
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
            {t.home}
          </Link>
          <Link
            href="/projects"
            className="block text-orange-600 hover:text-orange-800"
          >
            {t.events}
          </Link>
          <Link
            href="/about"
            className="block text-yellow-500 hover:text-yellow-600"
          >
            {t.about}
          </Link>
          {user && (
            <Link
              href="/chat"
              className="block text-teal-600 hover:text-teal-800"
            >
              {t.messages}
            </Link>
          )}
          {user ? (
            <Link
              href={`/profile/${user.name}`}
              className="block text-gray-800 hover:text-gray-600"
            >
              {t.messages}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="block text-teal-500 hover:text-teal-600"
            >
              {t.login}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-500 hover:text-gray-600"
          >
            {t.close}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
