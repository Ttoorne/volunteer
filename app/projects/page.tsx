"use client";
import ProjectCard from "@/components/ProjectsPage/ProjectCard";
import SideBarProjects from "@/components/ProjectsPage/SideBarProjects";
import React, { useEffect, useState } from "react";
import notFoundImg from "@/assets/not__found_data.png";
import { api } from "@/hooks/api";
import GenerateBackgroundProjects from "@/components/ProjectsPage/GenerateBackgroundProjects";

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

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>("");

  // Фильтры
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "",
    status: "all",
    sortOrder: "ascending",
    searchQuery: "",
  });

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
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    const randomBackground = GenerateBackgroundProjects();
    setBackgroundImage(randomBackground.src);
  }, []);

  useEffect(() => {
    let filtered = projects.filter((project) => {
      const matchesStartDate =
        !filters.startDate ||
        new Date(project.startDate) >= new Date(filters.startDate);
      const matchesEndDate =
        !filters.endDate ||
        new Date(project.endDate) <= new Date(filters.endDate);
      const matchesLocation =
        !filters.location ||
        project.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesStatus =
        filters.status === "all" || project.status === filters.status;
      const matchesSearchQuery =
        !filters.searchQuery ||
        project.title
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        project.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase());

      return (
        matchesStartDate &&
        matchesEndDate &&
        matchesLocation &&
        matchesStatus &&
        matchesSearchQuery
      );
    });

    const openAndInProgress = filtered.filter(
      (project) => project.status === "open" || project.status === "in-progress"
    );
    const completedProjects = filtered.filter(
      (project) => project.status === "completed"
    );

    const sortByDate = (a: Project, b: Project) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();

      if (filters.sortOrder === "ascending") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    };

    openAndInProgress.sort(sortByDate);
    completedProjects.sort(sortByDate);

    const sortedProjects = [...openAndInProgress, ...completedProjects];

    setFilteredProjects(sortedProjects);
  }, [filters, projects]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div
        className="flex justify-center flex-col items-center  px-4 pt-8 pb-16  h-full relative"
        style={{
          minHeight: "100vh",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <span className="loading loading-spinner loading-lg text-warning"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex text-center justify-center items-center h-96">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full m-auto flex px-4 pt-8 pb-16 justify-around h-full relative">
      {/* Фон с размытием */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          filter: "blur(7px) brightness(0.8)",
        }}
      ></div>

      {/* Sidebar */}
      <SideBarProjects filters={filters} onFilterChange={handleFilterChange} />

      <div className="flex flex-col gap-7 w-full sm:w-3/4 md:w-4/6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-snug text-shadow-lg">
            Volunteer Events
          </h2>

          {/* Search Projects */}
          <label className="input flex items-center gap-3 w-full sm:w-1/2 lg:w-1/3 p-4 pl-8 border border-transparent rounded-full bg-gradient-to-r from-gray-50 to-gray-50 duration-200 hover:scale-105 transform transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-5 w-5 text-gray-500 opacity-80"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                handleFilterChange("searchQuery", e.target.value)
              }
              placeholder="Search event"
              className="w-full bg-transparent placeholder-gray-500 border-none text-gray-800 focus:outline-none"
            />
          </label>
        </div>

        <div className="flex gap-8 flex-col">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))
          ) : (
            <div className="text-center flex flex-col justify-center items-center text-white">
              <img
                src={notFoundImg.src}
                alt="not matches found"
                className="w-60 h-60 sm:w-64 sm:h-64md:w-80 md:h-80 lg:w-96 lg:h-96"
              />
              <p className="text-base sm:text-lg lg:text-xl">
                No matches found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
