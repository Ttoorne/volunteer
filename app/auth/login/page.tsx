"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Alert from "@/components/Alert";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<
    "warning" | "success" | "error" | "info" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const validateForm = () => {
    const { email, password } = form;
    if (!email || !password) {
      return {
        message: "Both fields are required.",
        type: "warning" as "warning",
      };
    }
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
      return { message: "Invalid email format.", type: "warning" as "warning" };
    }
    return { message: null, type: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        setMessage("Login successful!");
        setMessageType("success");



        setForm({ email: "", password: "" });
        setTimeout(() => (window.location.href = "/"), 1500);
      } else {
        setMessage(data.error || "Error occurred during login.");
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
    <div className="absolute inset-0 bg-white flex justify-center items-center z-50">
      <div className="relative w-full max-w-md p-6 sm:h-auto h-screen flex flex-col justify-center items-center">
        <button
          onClick={() => router.push("/")}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 text-gray-700 hover:text-gray-900 z-50"
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

        <h1 className="text-xl sm:text-2xl text-center font-bold mb-4">
          Login
        </h1>
        <h3 className="flex flex-wrap gap-2 mb-4 text-center text-sm sm:text-base">
          Don’t have an account?{" "}
          <Link href="/auth/register" className="link-info hover:underline">
            Sign up
          </Link>
        </h3>

        {message && messageType && (
          <Alert type={messageType} message={message} />
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
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
                className="grow py-2 px-3 sm:py-3 outline-none"
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
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
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
                className="grow py-2 px-3 sm:py-3 outline-none"
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

          <button
            type="submit"
            className={`${
              isLoading ? "btn-ghost" : "btn-outline btn-primary"
            } btn btn-block sm:text-base text-sm`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in" : "Login"}
          </button>
        </form>

        <div className="mt-4 text-sm sm:text-base">
          <Link href="/auth/login/forgot-password" className="link-info">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
