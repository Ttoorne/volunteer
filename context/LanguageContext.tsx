"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

type LanguageContextType = {
  language: "en" | "tr" | "ru";
  setLanguage: (language: "en" | "tr" | "ru") => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<"en" | "tr" | "ru">("en"); // Обновлено: строгий тип

  useEffect(() => {
    const storedLanguage =
      Cookies.get("language") || localStorage.getItem("language") || "en";

    // Проверка значения и установка языка
    const isValidLanguage = (lang: string): lang is "en" | "tr" | "ru" =>
      ["en", "tr", "ru"].includes(lang);

    setLanguageState(isValidLanguage(storedLanguage) ? storedLanguage : "en");
  }, []);

  const setLanguage = (newLanguage: "en" | "tr" | "ru") => {
    // Обновлено
    setLanguageState(newLanguage);
    Cookies.set("language", newLanguage, { expires: 365 });
    localStorage.setItem("language", newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
