import { api } from "@/hooks/api";

export const fetchUserAvatar = async (avatarPath) => {
  const apiUrl = `${api}/auth/avatars/${avatarPath}`;
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Не удалось загрузить изображение");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Ошибка при загрузке аватара:", error);
    throw error;
  }
};
