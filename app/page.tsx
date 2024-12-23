"use client";
import HomeCalendar from "@/components/HomeCalendar";
import HomeProjectCard from "@/components/HomeProjectCard";
import { api } from "@/hooks/api";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const MainPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setLoadingProjects(false); // Set loading to false once data is fetched
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setLoadingProjects(false); // Set loading to false in case of error
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
    <div className="px-10 flex flex-col gap-16">
      {/* Header section */}
      <section className="flex flex-col gap-3 p-5 bg-gray-100 rounded-md shadow-md">
        <h2 className="text-3xl font-semibold">Welcome to Volunteer!</h2>
        <p className="text-lg">
          We are excited to have you here. Join us in making the world a better
          place through volunteering!
        </p>
      </section>

      {/* Active Projects section */}
      <section className="mt-6">
        <h2 className="text-3xl font-medium mb-3 ml-16">Active Projects</h2>
        <div className="relative flex items-center px-5">
          {/* Левая стрелка */}
          <button
            className="absolute left-[-30px] top-1/2 transform -translate-y-1/2 z-10 bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-800 transition text-3xl"
            onClick={() => {
              const carousel = document.querySelector(".carousel");
              carousel?.scrollBy({ left: -300, behavior: "smooth" });
            }}
          >
            ‹
          </button>

          {/* Карусель */}
          {loadingProjects ? (
            <div className="loading loading-spinner loading-lg text-primary mx-auto"></div>
          ) : (
            <div className="carousel rounded-box flex justify-start overflow-x-scroll scrollbar-hide py-5 space-x-8">
              {" "}
              {/* Здесь добавляем padding-left */}
              {filteredProjects.slice(0, 6).map((project) => (
                <HomeProjectCard key={project._id} project={project} />
              ))}
              <div className="flex items-center justify-center">
                <Link
                  href="/projects"
                  className="flex flex-col gap-2 rounded-full p-8 hover:bg-gray-100 transition"
                >
                  <span className="text-gray-800 text-xl">
                    View All Projects
                  </span>
                  <span className="rounded-full text-2xl bg-gray-800 text-white flex items-center justify-center">
                    →
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Правая стрелка */}
          <button
            className="absolute right-[-30px] top-1/2 transform -translate-y-1/2 z-10 bg-gray-700 text-white rounded-full w-10 h-10 flex justify-center items-center shadow-lg hover:bg-gray-800 transition text-3xl"
            onClick={() => {
              const carousel = document.querySelector(".carousel");
              carousel?.scrollBy({ left: 300, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
      </section>

      {/* Calendar section */}
      <section className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        <div className="bg-white p-5 rounded-lg shadow-md">
          <p className="text-gray-600">
            Here you can view upcoming events and sign up for volunteering
            opportunities.
          </p>
          <div className="mt-4">
            <HomeCalendar projects={projects} />
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Latest News</h2>
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="font-medium text-xl">Volunteer Week Recap</h3>
          <p className="text-gray-600">
            Our Volunteer Week was a huge success! Thanks to everyone who
            participated. Here's a quick recap.
          </p>
          <a href="/news" className="text-blue-500 hover:underline">
            Read More
          </a>
        </div>
      </section>

      {/* Achievements section */}
      <section className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Our Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="font-medium text-xl">100+ Volunteers in 2024</h3>
            <p className="text-gray-600">
              This year, we reached over 100 volunteers contributing to various
              causes. Let's keep it up!
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="font-medium text-xl">500 Hours of Volunteer Work</h3>
            <p className="text-gray-600">
              Our community has collectively volunteered more than 500 hours so
              far. Together, we are making a difference!
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action section */}
      <section className="mt-6 text-center bg-blue-500 text-white py-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-3">
          Ready to Make a Difference?
        </h2>
        <p className="mb-4">
          Join us today and start volunteering! Your time and effort can change
          lives.
        </p>
        <button className="bg-white text-blue-500 py-2 px-6 rounded-full">
          Join as a Volunteer
        </button>
      </section>
    </div>
  );
};

export default MainPage;
