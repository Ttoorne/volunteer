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

  // if (isLoading) {
  //   return (
  //     <nav className="z-50 px-2 py-0 bg-white flex justify-center shadow-sm text-center min-h-28">
  //       <span className="loading loading-ring text-primary loading-lg"></span>
  //     </nav>
  //   );
  // }

  return (
    <nav className="z-50 px-2 py-0 bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center text-lg font-normal">
        <div className="ml-3">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Logo"
              priority
              className="w-28 h-28 lg:w-32 lg:h-32"
            />
            <p className="font-medium">VOLUNTEER</p>
          </Link>
        </div>
        <div className="space-x-5 text-base md:text-lg lg:text-xl">
          <Link
            href="/"
            className={`${
              pathname === "/"
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text"
                : "text-black"
            }`}
          >
            Home
          </Link>
          <Link
            href="/projects"
            className={`${
              pathname.startsWith("/projects") && pathname !== "/projects/add"
                ? "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-transparent bg-clip-text"
                : "text-black"
            }`}
          >
            Projects
          </Link>
          {user && (
            <Link
              href="/chat"
              className={`${
                pathname === "/chat"
                  ? "bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 text-transparent bg-clip-text"
                  : "text-black"
              }`}
            >
              Messages
            </Link>
          )}
        </div>
        <div className="mr-2 flex items-center space-x-4">
          {(isLoading || !avatarLoaded) && user ? (
            <div className="mr-2 w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gray-300 animate-pulse"></div>
          ) : user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar btn-md lg:btn-lg"
              >
                <div className="w-full rounded-full">
                  <img
                    alt="Avatar"
                    src={
                      userAvatarUrl ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-DSW54utMSZ6J1F9luVr6YYDoRZ-FQYCL3w&s"
                    }
                    className={`object-cover rounded-full w-full h-full ${
                      !avatarLoaded ? "skeleton" : ""
                    }`}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="z-55 menu menu-md lg:menu-lg dropdown-content bg-white rounded-box z-[1] mt-3 w-52 text-base p-2 shadow-md"
              >
                <li>
                  <Link href={`/profile/${user.name}`}>Profile</Link>
                </li>
                <li>
                  <Link href={`/projects/add`}>Add Project</Link>
                </li>
                <li>
                  <LogoutButton />
                </li>
              </ul>
            </div>
          ) : (
            <Link href="/auth/login">Log in</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
