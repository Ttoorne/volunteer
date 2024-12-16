"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Alert from "@/components/Alert";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<
    "warning" | "success" | "error" | "info" | null
  >(null); // Тип сообщения
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Сбрасываем сообщение при каждом изменении формы
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000); // Сбрасываем через 5 секунд

      return () => clearTimeout(timer); // Очистка таймера при размонтировании компонента
    }
  }, [message]);

  const validateForm = () => {
    const { name, email, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      return {
        message: "All fields are required.",
        type: "warning" as "warning",
      };
    }
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
      return { message: "Invalid email format.", type: "warning" as "warning" };
    }
    if (password.length < 8) {
      return {
        message: "Password must be at least 8 characters long.",
        type: "warning" as "warning",
      };
    }
    if (password !== confirmPassword) {
      return {
        message: "Passwords do not match.",
        type: "warning" as "warning",
      };
    }
    return { message: null, type: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = { ...form };

    const { message: errorMessage, type } = validateForm();
    if (errorMessage) {
      setMessage(errorMessage);
      setMessageType(type);
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      // Если имя уникально, продолжаем регистрацию
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Please verify your email.");
        setMessageType("success");

        setForm({ name: "", email: "", password: "", confirmPassword: "" });

        // Сохраняем email в localStorage
        localStorage.setItem("email", form.email);

        // Переходим на страницу подтверждения
        router.push("/auth/register/verify");
      } else {
        setMessage(data.error || "Error occurred during registration");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white flex justify-center items-center z-50 px-4 sm:px-6 md:px-8">
      <div className="relative w-full max-w-lg p-4 sm:p-6 md:p-8 h-full sm:h-auto sm:max-h-screen flex flex-col justify-center items-center">
        {/* Кнопка закрытия */}
        <button
          onClick={() => router.push("/")}
          className="fixed top-6 right-6 text-gray-700 hover:text-gray-900 z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10 sm:w-12 sm:h-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h1 className="text-xl sm:text-2xl md:text-3xl text-center font-bold mb-4">
          Register
        </h1>
        <h3 className="flex flex-col sm:flex-row gap-2 mb-4 text-sm sm:text-base">
          Already have an account?
          <Link
            href="/auth/login"
            className="link-info hover:underline
          "
          >
            Sign in
          </Link>
        </h3>

        {message && messageType && (
          <Alert type={messageType} message={message} />
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5 opacity-70 ml-2"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
              </svg>
              <input
                className="grow py-2 px-3 outline-none text-sm sm:text-base"
                type="text"
                name="name"
                id="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5 opacity-70 ml-2"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              <input
                className="grow py-2 px-3 outline-none text-sm sm:text-base"
                type="email"
                name="email"
                id="email"
                placeholder="Your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5 opacity-70 ml-2"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                className="grow py-2 px-3 outline-none text-sm sm:text-base"
                type="password"
                name="password"
                id="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5 opacity-70 ml-2"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                className="grow py-2 px-3 outline-none text-sm sm:text-base"
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className={`${
              isLoading ? "btn-ghost" : "btn-outline btn-accent"
            } btn btn-block`}
            disabled={isLoading}
          >
            {isLoading ? "Registering" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
