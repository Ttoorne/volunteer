require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const sendEmail = require("../utils/sendEmail");
const sendPasswordResetEmail = require("../utils/sendPasswordResetEmail");
const multer = require("multer");
const Image = require("../models/Image");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Генерация кода подтверждения
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
};

// Функция для проверки существования пользователя
const checkIfUserExists = async (email, name) => {
  const [existingUser, pendingUser, existingName, pendingName] =
    await Promise.all([
      User.findOne({ email }),
      PendingUser.findOne({ email }),
      User.findOne({ name }),
      PendingUser.findOne({ name }),
    ]);

  if (existingUser) return { error: "User already exists with this email." };
  if (pendingUser) return { error: "Email is already awaiting verification." };
  if (existingName) return { error: "Name is already taken." };
  if (pendingName) return { error: "Name is already awaiting verification." };

  return null;
};

// ?? POST
// Регистрация пользователя
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Приводим имя к нижнему регистру и валидация
    name = name.toLowerCase();
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return res.status(400).json({
        error:
          "Name must contain only alphanumeric characters and underscores.",
      });
    }

    const validationError = await checkIfUserExists(email, name);
    if (validationError) return res.status(400).json(validationError);

    // Генерация кода подтверждения и хэширование пароля
    if (password.length < 8)
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    // Создание нового пользователя и сохранение
    const newPendingUser = new PendingUser({
      name,
      email,
      password: hashedPassword,
      verificationCode,
    });

    await newPendingUser.save();

    // Отправка письма для верификации
    try {
      await sendEmail(email, verificationCode);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return res.status(500).json({
        error: "Failed to send verification email. Please try again later.",
      });
    }

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "An error occurred during registration." });
  }
});

// Верификация пользователя
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser)
      return res
        .status(400)
        .json({ error: "Verification code expired or user not found." });
    if (pendingUser.verificationCode !== code)
      return res.status(400).json({ error: "Invalid verification code." });

    const newUser = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: "user",
    });

    await newUser.save();
    await PendingUser.deleteOne({ email });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error during email verification:", error);
    res
      .status(500)
      .json({ error: "An error occurred during email verification." });
  }
});

// Логин пользователя
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ error: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid password." });

    // Генерация токенов
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Установка токена в cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Запрещает доступ к куки через JavaScript
      secure: process.env.NODE_ENV === "production", // Использовать только HTTPS в продакшене
      sameSite: "lax", // Меняем на lax для междоменной работы
      maxAge: 15 * 60 * 1000, // 15 минут
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Меняем на lax для междоменной работы
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login." });
  }
});

// Запрос на сброс пароля
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Forgot password request received:", { email });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    const resetPasswordToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Токен действителен 1 час
    await user.save();

    const resetLink = `http://localhost:3000/auth/reset-password/${resetPasswordToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
      return res
        .status(500)
        .json({ error: "Failed to send reset email. Please try again later." });
    }

    console.log("Password reset email sent to:", user.email);
    res
      .status(200)
      .json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res
      .status(500)
      .json({ error: "An error occurred during password reset request." });
  }
});

// Сброс пароля
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.resetPasswordExpires < Date.now())
      return res.status(400).json({ error: "Reset token has expired." });

    // Сравнение нового пароля с текущим
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        error: "New password cannot be the same as the old password.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log("Password updated successfully:", user.email);

    res
      .status(200)
      .json({ message: "Password has been updated successfully." });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ error: "An error occurred during password reset." });
  }
});

// Обновление токена
router.post("/refresh", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: "User not found." });

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Убедитесь, что это включено на продакшн-сервере
      sameSite: "lax", // Настройка для безопасности cookies
      maxAge: 15 * 60 * 1000, // 15 минут
    });

    res.json({ accessToken: newAccessToken }); // Отправляем новый токен в ответе
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ error: "Invalid refresh token." });
  }
});

// ?? POST
// Выход из системы
router.post("/logout", async (req, res) => {
  try {
    // Удаляем cookies с accessToken и refreshToken
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Используйте только HTTPS в продакшене
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "An error occurred during logout." });
  }
});

//?? GET
// Получение данных пользователя по имени
router.get("/users/:name", async (req, res) => {
  try {
    const { name } = req.params;

    // Ищем пользователя по имени, а не по ID
    const userByName = await User.findOne({ name });
    if (!userByName) {
      return res.status(404).json({ error: "User not found." });
    }

    // Возвращаем данные пользователя по имени
    res.json(userByName);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data." });
  }
});

// Получение данных текущего пользователя
router.get("/profiles/me", async (req, res) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Error decoding token:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("No user found for ID:", decoded.id);
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data." });
  }
});

// Avatar
// Роут для получения изображения по ID
router.get("/avatars/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.setHeader("Content-Type", image.contentType);

    res.send(image.data);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "An error occurred while fetching image." });
  }
});

// Получение всех пользователей
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      return res.status(404).json({ error: "No users found." });
    }

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
});

//?? PUT
router.put("/users/:name", upload.single("avatar"), async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.name !== req.params.name) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this profile." });
    }

    const { firstName, lastName, bio, phone, location, skills } = req.body;

    // Обработка полей
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;

    // Обработка аватара
    if (req.file) {
      // Удаление старого аватара, если он есть

      if (user.avatar) {
        const oldAvatar = await Image.findById(user.avatar);

        if (oldAvatar) {
          await Image.deleteOne({ _id: oldAvatar._id });
        }
      }

      // Сохранение нового аватара
      const newImage = new Image({
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
      });

      const savedImage = await newImage.save();
      user.avatar = savedImage._id;
    }

    await user.save();

    res
      .status(200)
      .json({ message: "User profile updated successfully.", user });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

// !! DELETE
router.delete("/users/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "User ID is required to delete a user." });
    }

    // Проверяем, существует ли пользователь
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Удаляем аватар, если он существует
    if (user.avatar) {
      const oldAvatar = await Image.findById(user.avatar);

      if (oldAvatar) {
        await Image.deleteOne({ _id: oldAvatar._id });
      }
    }

    // Удаляем пользователя
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error during user deletion:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
});

module.exports = router;
