"use client";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { footer__translations } from "./Translation";

const Footer = () => {
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const pathname = usePathname();

  const t = footer__translations[language];

  return (
    <footer
      className={`${
        pathname === "/chat" ? "hidden" : ""
      } relative bg-indigo-900 text-white py-16 overflow-hidden`}
    >
      {/* Floating Shapes */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-500 to-teal-400 opacity-50 rounded-full blur-2xl animate-bounce"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-gradient-to-r from-purple-500 to-pink-400 opacity-30 rounded-full blur-3xl animate-spin-slow"></div>

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        {/* About Us Section */}
        <div className="text-center md:text-start">
          <h4 className="text-2xl font-bold mb-4">{t.aboutUs}</h4>
          <p className="text-sm opacity-80">{t.description}</p>
        </div>

        {/* Quick Links Section */}
        <div className="text-center">
          <h4 className="text-2xl font-bold mb-4">{t.quickLinks}</h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="/projects"
                className="hover:text-yellow-400 transition duration-300"
              >
                {t.events}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-yellow-400 transition duration-300"
              >
                {t.about}
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="hover:text-yellow-400 transition duration-300"
              >
                {t.support}
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div className="flex flex-col items-center md:items-end">
          <h4 className="text-2xl font-bold mb-4">{t.followUs}</h4>
          <div className="flex space-x-6">
            <a
              href="https://github.com/TtooRne"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition duration-300"
            >
              <FaGithub size={32} />
            </a>
            <a
              href="https://linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition duration-300"
            >
              <FaLinkedin size={32} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 text-center text-sm opacity-60 relative z-10">
        © {new Date().getFullYear()} {t.rightsReserved}
      </div>
    </footer>
  );
};

export default Footer;
