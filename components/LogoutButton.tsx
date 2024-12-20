"use client";
import { api } from "@/hooks/api";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch(`${api}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

        window.location.href = "/";
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <p onClick={handleLogout} className="cursor-pointer hover:text-red-500">
      Logout
    </p>
  );
};

export default LogoutButton;
