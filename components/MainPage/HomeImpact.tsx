"use client";
import { api } from "@/hooks/api";
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

const HomeImpact = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(`${api}/projects`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
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

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`${api}/auth/users`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    }

    fetchUsers();
  }, []);

  const completedProjects = projects.filter(
    (project) => project.status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="loading loading-spinner loading-lg text-primary mx-auto"></div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out relative">
        <h3 className="font-medium text-2xl text-white mb-3">{`${users?.length} Volunteers in 2024`}</h3>
        <p className="text-gray-100 text-base">
          {`This year, we reached ${users?.length} volunteers contributing to various
        causes. Let's keep it up!`}
        </p>
        <div className="absolute top-5 right-16 w-24 h-24 bg-yellow-300 rounded-full opacity-40 transform translate-x-12 -translate-y-6 md:w-20 md:h-20 sm:w-16 sm:h-16 sm:right-5 sm:top-4"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-teal-200 rotate-45 rounded-md opacity-30 md:w-16 md:h-16 sm:w-12 sm:h-12 sm:left-4 sm:bottom-4"></div>
      </div>
      <div className="bg-gradient-to-r from-green-400 to-teal-500 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out relative">
        <h3 className="font-medium text-2xl text-white mb-3">{`${completedProjects} Completed Projects`}</h3>
        <p className="text-gray-100 text-base">
          We have successfully completed {completedProjects} projects so far.
          Together, we are making a difference!
        </p>
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-300 rounded-full opacity-40 transform -translate-x-12 translate-y-6 md:w-20 md:h-20 sm:w-16 sm:h-16 sm:right-5 sm:top-4"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-yellow-200 opacity-30 rotate-45 rounded-md md:w-16 md:h-16 sm:w-12 sm:h-12 sm:right-4 sm:bottom-4"></div>
      </div>
    </div>
  );
};

export default HomeImpact;
