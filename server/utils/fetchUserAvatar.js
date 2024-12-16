export const fetchUserAvatar = async (avatarPath) => {
  const apiUrl = `http://localhost:5000/api/auth/avatars/${avatarPath}`;
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
