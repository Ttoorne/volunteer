"use client";
import ProjectCard from "@/components/ProjectCard";
import SideBarProjects from "@/components/SideBarProjects";
import React, { useEffect, useState } from "react";
import background from "@/assets/projects__background.png";

interface Project {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startDate: string;
  endDate: string;
  location: string;
  status: "open" | "closed" | "in process";
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Фильтры
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "",
    status: "",
    sortOrder: "ascending", // Добавлено поле для сортировки
  });

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(`http://localhost:5000/api/projects`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data); // Изначально показываем все проекты
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
    // Фильтрация и сортировка проектов
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
        !filters.status || project.status === filters.status;

      return (
        matchesStartDate && matchesEndDate && matchesLocation && matchesStatus
      );
    });

    // Сортировка по дате
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();

      if (filters.sortOrder === "ascending") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    setFilteredProjects(filtered);
  }, [filters, projects]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
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
    <div
      className="w-7/10 m-auto flex px-4 pt-8 pb-16 justify-around h-full relative"
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${background.src})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <SideBarProjects filters={filters} onFilterChange={handleFilterChange} />
      <div className="flex flex-col gap-7 w-4/6">
        <h2 className="text-lg lg:text-4xl text-white font-semibold">
          Volunteer Projects
        </h2>
        <div className="flex gap-8 flex-col z-10">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
