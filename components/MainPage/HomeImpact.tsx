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

interface HomeImpactProps {
  translationsImpactOverview: {
    impactOverviewTitle: string;
    volunteersIn2024: (volunteersCount: number) => string;
    completedProjects: (completedProjectsCount: number) => string;
    volunteersIn2024Title: (volunteersCount: number) => string;
    completedProjectsTitle: (completedProjectsCount: number) => string;
  };
}

const HomeImpact = ({ translationsImpactOverview }: HomeImpactProps) => {
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

  const volunteersCount = users.length;

  if (loading) {
    return (
      <div className="loading loading-spinner loading-lg text-primary mx-auto"></div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error X|</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out relative">
        <h3 className="font-medium text-2xl text-white mb-3">
          {translationsImpactOverview.volunteersIn2024Title(volunteersCount)}
        </h3>
        <p className="text-gray-100 text-base">
          {translationsImpactOverview.volunteersIn2024(volunteersCount)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-green-400 to-teal-500 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out relative">
        <h3 className="font-medium text-2xl text-white mb-3">
          {translationsImpactOverview.completedProjectsTitle(completedProjects)}
        </h3>
        <p className="text-gray-100 text-base">
          {translationsImpactOverview.completedProjects(completedProjects)}
        </p>
      </div>
    </div>
  );
};

export default HomeImpact;
