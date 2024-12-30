"use client";
import HomeCalendar from "@/components/MainPage/HomeCalendar";
import HomeProjectCard from "@/components/MainPage/HomeProjectCard";
import HomeTips from "@/components/MainPage/HomeTips";
import { api } from "@/hooks/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import tipsImg from "@/assets/main__page_tips.gif";
import Image from "next/image";
import HomeImpact from "@/components/MainPage/HomeImpact";
import HomeFaq from "@/components/MainPage/HomeFaq";
import headerImg from "@/assets/main_header__bg.png";
import { fetchUserData } from "@/server/utils/fetchUserData";

interface Project {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startDate: string;
  endDate: string;
  location: string;
  status: "open" | "completed" | "in-progress";
}

interface User {
  name: string;
  avatar?: string;
}

const MainPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const getTokenFromServer = async () => {
    try {
      const response = await fetch(`${api}/projects/some-route`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }

      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getTokenFromServer();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await fetchUserData(token);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoadingUser(false);
        }
      } else {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(`${api}/projects`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data);
        setLoadingProjects(false);
      } catch (error) {
        setLoadingProjects(false);
      }
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects.filter((project) => {
      const matchesStatus = project.status !== "completed";
      return matchesStatus;
    });

    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();

      return dateA - dateB;
    });

    setFilteredProjects(filtered);
  }, [projects]);

  return (
    <div className="flex flex-col gap-16 bg-indigo-50">
      {/* Header section */}
      <section
        className="relative w-full flex flex-col md:flex-row gap-10 p-5 md:p-10 mt-0 items-center bg-cover bg-opacity-50 backdrop-blur-lg min-h-[90vh]"
        style={{ backgroundImage: `url(${headerImg.src})` }}
      >
        {/* Текст с плавной анимацией */}
        {loadingUser ? (
          <div className="relative flex flex-col gap-5 text-white p-6 md:p-12 rounded-lg shadow-2xl z-50 bg-black bg-opacity-30 w-full max-w-3xl">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-300 animate-pulse mx-auto"></div>
          </div>
        ) : (
          <div className="relative flex flex-col gap-5 text-white p-6 md:p-12 rounded-lg shadow-2xl z-50 bg-black bg-opacity-30 w-full max-w-3xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug text-center animate-fade-in">
              {token && !loadingUser
                ? `Welcome back, ${user?.name}!`
                : `Welcome to Volunteer!`}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-center animate-fade-in">
              {token && !loadingUser
                ? `We are excited to have you here. Let's make the world a better place together through volunteering!`
                : `We are excited to have you here. Join us in making the world a
              better place through volunteering!`}
            </p>
          </div>
        )}

        {/* Разделитель с градиентом */}
        <div className="w-[80px] md:w-[100px] h-[2px] md:h-[4px] bg-gradient-to-r from-yellow-300 to-yellow-200 my-8 md:my-10 animate-fade-in" />

        {/* Изображение с декоративными акцентами */}
        <div className="relative z-10 mb-8 md:mb-0">
          <img
            src="https://i.pinimg.com/736x/4c/c9/f7/4cc9f7cb4fe4f27483534c23f19c47af.jpg"
            alt="Header"
            className="animate-fade-in z-50 object-contain w-[320px] h-[320px] md:w-[432px] md:h-[432px] lg:w-[464px] lg:h-[464px] rounded-3xl shadow-lg"
          />
        </div>

        {/* Декоративные линии и формы для digital illustration */}
        <div className="absolute inset-0 z-0">
          {/* Пиксельный фон или линии */}
          <div className="absolute top-[5%] left-[10%] w-[60px] md:w-[80px] h-[60px] md:h-[80px] bg-gradient-to-r from-indigo-400 to-teal-500 opacity-40 transform rotate-45 rounded-md animate-fade-in" />
          <div className="absolute top-[20%] left-[50%] w-[120px] md:w-[150px] h-[8px] md:h-[10px] bg-indigo-200 opacity-50 transform rotate-45 animate-fade-in" />
          <div className="absolute top-[35%] left-[70%] w-[100px] md:w-[120px] h-[100px] md:h-[120px] border-4 border-teal-300 opacity-60 rounded-lg animate-fade-in" />
          <div className="absolute bottom-[20%] left-[25%] w-[70px] md:w-[90px] h-[70px] md:h-[90px] bg-gradient-to-t from-pink-300 to-teal-300 opacity-40 transform rotate-45 rounded-md animate-fade-in" />
          <div className="absolute top-[60%] left-[80%] w-[60px] md:w-[80px] h-[60px] md:h-[80px] bg-gradient-to-b from-sky-300 to-pink-200 opacity-30 transform rotate-45 rounded-lg animate-fade-in" />

          {/* Параллельные линии */}
          <div className="absolute top-[10%] left-[5%] w-[160px] md:w-[200px] h-[4px] md:h-[5px] bg-pink-400 opacity-60 animate-fade-in" />
          <div className="absolute bottom-[10%] left-[20%] w-[140px] md:w-[180px] h-[4px] md:h-[5px] bg-teal-500 opacity-50 animate-fade-in" />

          {/* Геометрическая сетка */}
          <div className="absolute top-[50%] left-[40%] w-[160px] md:w-[200px] h-[160px] md:h-[200px] border-4 border-dotted border-indigo-300 opacity-40 animate-fade-in" />
        </div>
      </section>

      {/* Active Projects section */}
      <section className="mt-6 px-4 sm:px-8 lg:px-10">
        <h2 className="text-3xl font-semibold mb-3 ml-4 sm:ml-8 lg:ml-16">
          Active Projects
        </h2>
        <div className="relative flex items-center px-4 sm:px-5 lg:px-5">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-10 mx-auto">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                No active projects at the moment.
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mt-2">
                Check back later for new opportunities.
              </p>
            </div>
          ) : (
            <>
              <button
                className="absolute left-[-30px] top-1/2 transform -translate-y-1/2 z-10 bg-gray-700 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:bg-gray-800 transition text-2xl sm:text-3xl"
                onClick={() => {
                  const carousel = document.querySelector(".carousel");
                  carousel?.scrollBy({ left: -300, behavior: "smooth" });
                }}
              >
                ‹
              </button>

              {/* Carousel */}
              {loadingProjects ? (
                <div className="loading loading-spinner loading-lg text-primary mx-auto"></div>
              ) : (
                <div className="carousel rounded-box flex justify-start overflow-x-scroll scrollbar-hide py-5 space-x-4 sm:space-x-6 lg:space-x-8">
                  {filteredProjects.slice(0, 9).map((project) => (
                    <HomeProjectCard key={project._id} project={project} />
                  ))}
                  <div className="flex items-center justify-center">
                    <Link
                      href="/projects"
                      className="flex flex-col gap-2 rounded-full p-4 sm:p-6 lg:p-8 hover:bg-gray-100 transition"
                    >
                      <span className="text-gray-800 text-lg sm:text-xl">
                        View All Projects
                      </span>
                      <span className="rounded-full text-xl sm:text-2xl bg-gray-800 text-white flex items-center justify-center">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              <button
                className="absolute right-[-30px] top-1/2 transform -translate-y-1/2 z-10 bg-gray-700 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center shadow-lg hover:bg-gray-800 transition text-2xl sm:text-3xl"
                onClick={() => {
                  const carousel = document.querySelector(".carousel");
                  carousel?.scrollBy({ left: 300, behavior: "smooth" });
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      </section>

      {/* Calendar section */}
      <section className="mt-6 px-10">
        <h2 className="text-3xl font-semibold ml-4 sm:ml-8 lg:ml-16">
          Upcoming Events
        </h2>

        <div className="p-5">
          <p className="text-gray-600 ml-7 text-base">
            Here you can view upcoming events and sign up for volunteering
            opportunities.
          </p>
          <div className="mt-4">
            <HomeCalendar projects={projects} />
          </div>
        </div>
      </section>

      {/* Volunteer Resources Section */}
      <section className="mt-6 px-6 sm:px-8 md:px-10">
        <h3 className="font-medium text-2xl sm:text-3xl text-gray-800 mb-4 mr-auto ml-4 sm:ml-28 w-fit">
          Volunteer Tips
        </h3>
        <div className="flex flex-col md:flex-row justify-center md:justify-between md:items-center">
          <HomeTips />
          <Image
            src={tipsImg}
            alt="Communicate"
            className="animate-fade-in object-contain w-[372px] h-[372px] md:w-[404px] md:h-[404px]  lg:w-[452px] lg:h-[452px]"
            priority
          />
        </div>
      </section>

      {/* Impact Overview Section */}
      <section className="mt-6 px-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Impact Overview
        </h2>

        <HomeImpact />
      </section>

      {/* FAQ Section */}
      <section className="mt-6">
        <h2 className="text-3xl font-medium ml-7 lg:ml-14">
          Frequently Asked Questions
        </h2>

        <HomeFaq />
      </section>

      {/* Call to Action section */}
      <section className="mt-6 text-center bg-gradient-to-b from-blue-400 via-purple-500 to-indigo-900 text-white py-8 md:py-12 rounded-xl rounded-b-none shadow-lg relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 md:w-40 md:h-40 bg-yellow-300 rounded-full opacity-20 transform -translate-x-8 -translate-y-8 md:-translate-x-10 md:-translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 md:w-60 md:h-60 bg-pink-300 rounded-full opacity-30 transform translate-x-8 translate-y-8 md:translate-x-10 md:translate-y-10"></div>

        {/* Section Content */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4 drop-shadow-lg">
          Ready to Make a Difference?
        </h2>
        <p className="text-base md:text-lg mb-6 drop-shadow-md px-4 md:px-0">
          Join us today and start volunteering! Your time and effort can change
          lives.
        </p>
        {token && !loadingUser ? (
          <Link
            href={"/projects"}
            className="relative bg-white text-blue-600 font-semibold py-2 px-6 md:py-3 md:px-8 rounded-full shadow-md hover:shadow-lg hover:bg-blue-100 transition-all duration-300 ease-in-out"
          >
            Make a Difference!
            <span className="absolute inset-0 bg-blue-200 opacity-0 rounded-full transition-opacity duration-300 hover:opacity-50"></span>
          </Link>
        ) : (
          <Link
            href={"/auth/register"}
            className="relative bg-white text-blue-600 font-semibold py-2 px-6 md:py-3 md:px-8 rounded-full shadow-md hover:shadow-lg hover:bg-blue-100 transition-all duration-300 ease-in-out"
          >
            Join as a Volunteer
            <span className="absolute inset-0 bg-blue-200 opacity-0 rounded-full transition-opacity duration-300 hover:opacity-50"></span>
          </Link>
        )}
      </section>
    </div>
  );
};

export default MainPage;
