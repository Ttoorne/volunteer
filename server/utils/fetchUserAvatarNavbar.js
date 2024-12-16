export const fetchUserAvatarNavbar = async (avatarPath) => {
  const apiUrl = `http://localhost:5000/api/auth/avatars/${avatarPath}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Не удалось загрузить изображение");
    }
    return apiUrl;
  } catch (error) {
    console.error("Ошибка при загрузке аватара:", error);
    throw error;
  }
};
