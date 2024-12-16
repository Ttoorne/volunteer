"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Alert from "@/components/Alert";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<
    "warning" | "success" | "error" | "info" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("Both password fields are required.");
      setMessageType("warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);

    try {
      const token = window.location.pathname.split("/").pop(); // Получаем токен из URL
      const res = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successfully.");
        setMessageType("success");
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        setMessage(data.error || "Error occurred.");
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
      <div className="relative w-full max-w-md p-6 sm:p-8 md:p-10 h-screen sm:h-auto flex flex-col justify-center items-center">
        {/* Кнопка закрытия */}
        <button
          onClick={() => router.push("/")}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 text-gray-700 hover:text-gray-900 z-50"
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

        <h1 className="text-xl sm:text-2xl text-center font-bold mb-4">
          Reset Your Password
        </h1>

        {message && messageType && (
          <Alert type={messageType} message={message} />
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleResetPassword();
          }}
          className="w-full"
        >
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-neutral focus-within:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 sm:h-6 sm:w-6 opacity-70 ml-2"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2a5 5 0 0 0-5 5v2H6a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-6a4 4 0 0 0-4-4h-1V7a5 5 0 0 0-5-5Zm-3 7V7a3 3 0 1 1 6 0v2H9Zm-2 2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H7Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                id="newPassword"
                className="grow py-2 px-3 outline-none"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="input flex items-center gap-2 border rounded-md bg-white text-gray-700 focus-within:ring-2 focus-within:ring-neutral focus-within:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 sm:h-6 sm:w-6 opacity-70 ml-2"
              >
                <path d="M12 0C7.032 0 3 4.032 3 9c0 4.968 4.032 9 9 9s9-4.032 9-9c0-4.968-4.032-9-9-9zM4 9c0-4.411 3.589-8 8-8s8 3.589 8 8c0 4.411-3.589 8-8 8s-8-3.589-8-8zm5 4.414l3-3 3 3 1.414-1.414L12 7.586l-4.414 4.414L9 13.414z" />
              </svg>
              <input
                id="confirmPassword"
                className="grow py-2 px-3 outline-none"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className={`${
              isLoading ? "btn-ghost cursor-not-allowed" : "btn-warning "
            } btn btn-block btn-outline`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
