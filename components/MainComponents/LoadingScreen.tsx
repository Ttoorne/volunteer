"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { loadingScreen__translations } from "./Translation";

const LoadingScreen = () => {
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  const t = loadingScreen__translations[language];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-yellow-100 via-green-100 to-white z-50"
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${"https://blog.tubikstudio.com/wp-content/uploads/2020/04/Pennine-Alps-illustration-tubikarts-1024x768.png"})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <video
          autoPlay
          loop
          muted
          className=" object-contain mb-6 border-4 border-green-500 rounded-xl shadow-lg"
        >
          <source src="/loading-screen__video.webm" type="video/webm" />
        </video>

        {/* Надпись */}
        <div className="relative flex flex-col gap-5 text-white p-6 md:p-12 rounded-lg shadow-2xl z-50 bg-gray-800 bg-opacity-30 w-full max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-snug text-center animate-fade-in">
            {language === "tr" && (
              <span>
                <span className="font-extrabold">Volunteer</span>
                <span>'a</span>
              </span>
            )}
            {t.welcome}
            {language !== "tr" && (
              <span className="font-extrabold">Volunteer</span>
            )}
            !
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-center animate-fade-in">
            {t.positiveImpact}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
