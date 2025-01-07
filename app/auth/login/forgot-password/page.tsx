"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/MainComponents/Alert";
import { api } from "@/hooks/api";
import { useLanguage } from "@/context/LanguageContext";
import { login__translation } from "@/components/AuthPage/Translation";

export default function ForgotPassword() {
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = login__translation[language];

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<
    "warning" | "success" | "error" | "info" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage(t.emailRequired);
      setMessageType("warning");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${api}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(t.passwordResetLinkSent);
        setMessageType("success");
      } else {
        setMessage(data.error || "Error occurred.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(t.failedToConnect);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white flex justify-center items-center z-50">
      <div className="relative w-full max-w-md p-6 sm:h-auto h-screen flex flex-col justify-center items-center">
        {/* Кнопка закрытия */}
        <button
          onClick={() => router.push("/auth/login")}
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
          {t.forgotPasswordPage}
        </h1>

        {message && messageType && (
          <Alert type={messageType} message={message} />
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label
              htmlFor="email"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-neutral focus-within:ring-offset-2"
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
                placeholder={t.enterYourEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className={`${
              isLoading ? "btn-ghost" : "btn-outline btn-warning"
            } btn btn-block text-sm sm:text-base`}
            disabled={isLoading}
          >
            {isLoading ? t.sending : t.sendResetLink}
          </button>
        </form>
      </div>
    </div>
  );
}
