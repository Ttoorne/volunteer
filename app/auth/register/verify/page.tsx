"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert"; // Путь к компоненту Alert
import Link from "next/link"; // Добавим импорт Link для навигации

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setMessage("No email found. Please register first.");
      setMessageType("error");
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setMessage(
        "The verification code has expired. You will be moved to registration page."
      );
      setMessageType("error");
      setTimeout(() => {
        // router.push("/auth/register");
      }, 3000);
    } else {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setMessage("Verification code must be exactly 6 digits.");
      setMessageType("error");
      return;
    }

    if (!email) {
      setMessage("Email is required for verification.");
      setMessageType("error");
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.toString() }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Account verified successfully!");
        setMessageType("success");
        localStorage.removeItem("email");
        setTimeout(() => router.push("/auth/login"), 1500);
      } else {
        setMessage(data.error || "Failed to verify account.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Connection to server failed.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="absolute inset-0 bg-white flex justify-center items-center z-50 px-4 sm:px-6 md:px-8">
      <div className="relative w-full max-w-lg p-4 sm:p-6 md:p-8 h-full sm:h-auto sm:max-h-screen flex flex-col justify-center items-center">
        {/* Кнопка закрытия */}
        <button
          onClick={() => router.push("/auth/register")}
          className="fixed top-6 right-6 text-gray-700 hover:text-gray-900 z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
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
          Verify Your Email
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center mb-4">
          Verification code expires in:{" "}
          <span className="font-medium text-red-500">
            {formatTime(timeLeft)}
          </span>
        </p>

        {message && messageType && (
          <Alert message={message} type={messageType} />
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="mb-4">
            <label
              htmlFor="code"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
            >
              <input
                className="grow py-2 px-3 outline-none text-sm sm:text-base"
                type="text"
                name="code"
                id="code"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
              />
            </label>
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 text-sm sm:text-base font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-4 text-sm sm:text-base">
          <Link
            href="/auth/register"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
