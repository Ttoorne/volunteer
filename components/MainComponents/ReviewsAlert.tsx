"use client";
import React, { useEffect, useState } from "react";

interface ReviewsAlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
}

const ReviewsAlert: React.FC<ReviewsAlertProps> = ({
  type,
  message,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const alertClass =
    type === "success"
      ? "alert-success"
      : type === "error"
      ? "alert-error"
      : type === "warning"
      ? "alert-warning"
      : "alert-info";

  const iconPath =
    type === "success"
      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      : type === "error"
      ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      : type === "warning"
      ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      className={`alert ${alertClass} ${
        !isVisible ? "hide" : ""
      } flex items-center p-4 rounded-lg text-sm sm:text-base md:text-lg`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 shrink-0 stroke-current mr-3 sm:mr-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={iconPath}
        />
      </svg>
      <span className="flex-1">{message}</span>
    </div>
  );
};

export default ReviewsAlert;
