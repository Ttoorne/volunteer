"use client";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include", // Включает cookies
      });

      if (response.ok) {
        // Удаляем токены с клиента
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

        // Перезагружаем страницу или перенаправляем пользователя
        window.location.reload();
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
